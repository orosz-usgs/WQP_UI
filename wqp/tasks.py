
import arrow
import cPickle as pickle
import redis

from . import app, celery, session
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
    search_endpoint = app.config['SEARCH_QUERY_ENDPOINT'] + "Station/search/"
    redis_config = app.config['REDIS_CONFIG']
    error_count = 0
    cached_count = 0
    total = 0
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

        status = resp.status_code
        if status == 200:
            total = int(resp.headers['Total-Site-Count'])

            for site in tsv_dict_generator(resp.iter_lines()):
                current_count += 1
                if site:
                    cached_count += 1
                    site_key = get_site_key(provider_id, site['OrganizationIdentifier'], site['MonitoringLocationIdentifier'])
                    redis_session.set(site_key, pickle.dumps(site, protocol=2))

                else:
                    error_count += 1
                self.update_state(state='PROGRESS',
                                  meta={'current': current_count,
                                        'errors': error_count,
                                        'total': total,
                                        'status': 'working'}
                                  )

        # Add loading stats to cache
        status_key = provider_id + '_sites_load_status'
        status_content = {'time_utc': arrow.utcnow(),
                          'cached_count': cached_count,
                          'error_count': error_count,
                          'total_count': total,
                          'provider': provider_id}
        redis_session.set(status_key, pickle.dumps(status_content))

    else:
        status = 500
        self.update_state(state='NO_REDIS_CONFIGURED', meta={})

    return {"status": status, "cached_count": cached_count, "error_count": error_count, 'total_count':total}
