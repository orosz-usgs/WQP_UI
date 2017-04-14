
import arrow
import cPickle as pickle
import redis

from . import app, celery, create_request_resp_log_msg, create_redis_log_msg, session
from .utils import generate_redis_db_number, tsv_dict_generator, get_site_key


@celery.task(bind=True)
def load_sites_into_cache_async(self, provider_id):
    """
    Retrieves all sites for provider_id using streaming and adds each site to the cache. The current
    state of the task is also saved in the cache with key <provider_id>_sites_load_status
    :param self: self, allows the task status to be updated
    :param provider_id: the identifier of the provider (NWIS, STORET, ETC)
    :return: dict - with keys for status (code of request for sites), cached_count, error_count, and total_count
    """
    app.logger.debug('Starting async load of sites into Redis cache.')
    search_endpoint = app.config['SEARCH_QUERY_ENDPOINT'] + "Station/search/"
    redis_config = app.config['REDIS_CONFIG']
    result = {'status': '',
              'error_count': 0,
              'cached_count': 0,
              'total_count': 0}
    current_count = 0

    if redis_config:
        redis_session = redis.StrictRedis(host=redis_config['host'],
                                          port=redis_config['port'],
                                          db=generate_redis_db_number(provider_id),
                                          password=redis_config.get('password'))
        resp = session.get(search_endpoint, params={"providers": provider_id,
                                                    "mimeType": "tsv",
                                                    "sorted": "no",
                                                    "uripage": "yes"
                                                    },
                           stream=True
                           )

        result['status'] = resp.status_code
        if resp.status_code == 200:
            result['total_count'] = int(resp.headers['Total-Site-Count'])

            for site in tsv_dict_generator(resp.iter_lines()):
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
                                        'status': 'working'}
                                  )
        else:
            msg = create_request_resp_log_msg(resp)
            app.logger.warning(msg)

        # Add loading stats to cache
        status_key = provider_id + '_sites_load_status'
        status_content = {'time_utc': arrow.utcnow(),
                          'cached_count': result['cached_count'],
                          'error_count': result['error_count'],
                          'total_count': result['total_count'],
                          'provider': provider_id}
        redis_session.set(status_key, pickle.dumps(status_content))

    else:
        app.logger.warning('Redis has not been configured.')
        self.update_state(state='NO_REDIS_CONFIGURED', meta={})

    return result
