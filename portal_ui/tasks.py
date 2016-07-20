from celery import Celery
from . import app
import requests
import redis
import csv
import cPickle as pickle

celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)


@celery.task(bind=True)
def generate_site_list_from_streamed_tsv_async(self, base_url, redis_config, provider_id, redis_db):
    """

    :param base_url: the base url we are using for the generating the search URL
    :param provider_id:
    :param redis_config:
    :return: a list of dicts that describe sites that are associated with an organization under a data provider
    """
    search_endpoint = base_url + "Station/search/"
    r = requests.get(search_endpoint, { "providers": provider_id,
                                       "mimeType": "tsv", "sorted": "no", "uripage": "yes"}, stream=True
                     )

    status = r.status_code
    headers = r.headers
    total = int(headers['Total-Site-Count'])
    header_line = None
    redis_session = None
    if redis_config:
        redis_session = redis.StrictRedis(host=redis_config['host'], port=redis_config['port'], db=redis_db,
                                          password=redis_config.get('password'))

    error_count = 0
    cached_count = 0
    counter = 0
    for line in r.iter_lines():
        # filter out keep-alive new lines
        if line:
            if counter == 0:
                header_line = line
                header_object = csv.reader([header_line], delimiter='\t')
                for row in header_object:
                    header = row
                counter += 1
            elif counter >= 1:
                station = csv.reader([line], delimiter='\t')
                for row in station:
                    station_data = row
                    if len(station_data) == 36:
                        station_dict = dict(zip(header, station_data))
                        site_key = 'sites_' + provider_id + '_' + str(station_dict['OrganizationIdentifier']) + "_" + \
                                   str(station_dict['MonitoringLocationIdentifier'])
                        if redis_session:
                            redis_session.set(site_key, pickle.dumps(station_dict, protocol=2))
                        cached_count += 1
                        self.update_state(state='PROGRESS',
                                          meta={'current': counter, 'errors': error_count, 'total': total,
                                                'status': 'working'})
                        counter += 1
                    elif len(station_data) != 36:
                        error_count += 1


    return {"status": status, "cached_count": cached_count, "error_count": error_count}
