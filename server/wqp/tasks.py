import datetime
import os
import pickle

import arrow
from celery.schedules import crontab
from celery.utils.log import get_task_logger
import redis

from . import app, celery, session
from .utils import generate_redis_db_number, tsv_dict_generator, get_site_key, create_request_resp_log_msg, \
    create_redis_log_msg, list_directory_contents, create_targz, delete_old_files


logger = get_task_logger(__name__)


@celery.task(bind=True)
def load_sites_into_cache_async(self, provider_id):
    """
    Retrieves all sites for provider_id using streaming and adds each site to the cache. The current
    state of the task is also saved in the cache with key <provider_id>_sites_load_status
    :param self: self, allows the task status to be updated
    :param provider_id: the identifier of the provider (NWIS, STORET, ETC)
    :return: dict - with keys for status (code of request for sites), cached_count, error_count, and total_count
    """
    logger.debug('Starting async load of sites into Redis cache.')
    search_endpoint = app.config['SEARCH_QUERY_ENDPOINT'] + "Station/search/"
    redis_config = app.config['REDIS_CONFIG']
    result = {'status': '',
              'error_count': 0,
              'cached_count': 0,
              'total_count': 0}
    current_count = 0

    if redis_config:
        db_number = generate_redis_db_number(provider_id)
        redis_msg = create_redis_log_msg(redis_config['host'], redis_config['port'], db_number)
        logger.info(redis_msg)
        redis_session = redis.StrictRedis(host=redis_config['host'],
                                          port=redis_config['port'],
                                          db=db_number,
                                          password=redis_config.get('password'))
        resp = session.get(search_endpoint,
                           params={'providers': provider_id,
                                   'mimeType': 'tsv',
                                   'sorted': 'no',
                                   'uripage': 'yes'},
                           stream=True)
        resp_log_msg = create_request_resp_log_msg(resp)
        logger.debug(resp_log_msg)
        result['status'] = resp.status_code
        if resp.status_code == 200:
            result['total_count'] = int(resp.headers['Total-Site-Count'])
            logger.debug('Parsing sites from TSV for {}.'.format(provider_id))
            for site in tsv_dict_generator(resp.iter_lines(decode_unicode=True)):
                current_count += 1
                if site:
                    result['cached_count'] += 1
                    site_key = get_site_key(provider_id, site['OrganizationIdentifier'], site['MonitoringLocationIdentifier'])
                    redis_session.set(site_key, pickle.dumps(site, protocol=2))

                else:
                    result['error_count'] += 1
                self.update_state(state='PROGRESS',
                                  meta={'current': current_count,
                                        'errors': result['error_count'],
                                        'total': result['total_count'],
                                        'status': 'working'})
        else:
            logger.warning('No data to cache.')
        # Add loading stats to cache
        status_key = provider_id + '_sites_load_status'
        status_content = {'time_utc': arrow.utcnow(),
                          'cached_count': result['cached_count'],
                          'error_count': result['error_count'],
                          'total_count': result['total_count'],
                          'provider': provider_id}
        redis_session.set(status_key, pickle.dumps(status_content))

    else:
        logger.warning('Redis has not been configured.')
        self.update_state(state='NO_REDIS_CONFIGURED', meta={})

    return result


@celery.task
def delete_old_log_archives():
    """
    Delete old log tar.gz archives.

    """
    logging_directory = app.config.get('LOGGING_DIRECTORY')
    if logging_directory is not None:
        logdir_contents = list_directory_contents(logging_directory)
        archives = [content_file for content_file in logdir_contents if content_file.endswith('.tar.gz')]
        delete_old_files(archives)
    else:
        pass


@celery.task
def rollover_logs():
    """
    Rollover .log files to tar.gz files.

    """
    logging_directory = app.config.get('LOGGING_DIRECTORY')
    if logging_directory is not None:
        logdir_contents = list_directory_contents(logging_directory)
        logfiles = [content_file for content_file in logdir_contents if content_file.endswith('.log')]
        if logfiles:
            yesterday = (datetime.datetime.now() - datetime.timedelta(days=1)).strftime('%Y-%m-%d')
            # name to archive as "wqp-YYYY-MM-DD"
            archive_name = '{0}-{1}.tar.gz'.format(__name__.split('.')[0], yesterday)
            create_targz(os.path.join(logging_directory, archive_name), logfiles)
    else:
        pass


@celery.on_after_configure.connect
def add_periodic(sender, **kwargs):
    """
    Schedule tasks in celery beat.

    :param sender:
    :param kwargs:
    :return:
    """
    if app.config.get('LOGGING_DIRECTORY') is not None:
        delete_time = app.config.get('LOG_DELETE_TIME', (1, 0))
        rollover_time = app.config.get('LOG_ROLLOVER_TIME', (0, 0))
        del_hour, del_minute = delete_time
        roll_hour, roll_minute = rollover_time
        sender.add_periodic_task(schedule=crontab(hour=del_hour, minute=del_minute),
                                 sig=delete_old_log_archives.s())
        sender.add_periodic_task(schedule=crontab(hour=roll_hour, minute=roll_minute),
                                 sig=rollover_logs.s())
