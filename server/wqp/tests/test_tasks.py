import pickle
from unittest import TestCase, mock

import arrow
import requests_mock

from .. import app
from ..utils import get_site_key
from ..tasks import load_sites_into_cache_async

class LoadSitesIntoCacheAsync(TestCase):


    @mock.patch('wqp.tasks.arrow.utcnow')
    def setUp(self,  mock_utcnow):
        self.search_endpoint = 'mock://wqpfake.com/search/'
        self.redis_config = {
            'host' : 'localhost',
            'port': 6379,
            'db': 0,
            'password': 'fakepassword'
        }
        self.now = arrow.utcnow()
        mock_utcnow.result_value = self.now
        self.mock_utcnow = mock_utcnow
        app.config['SEARCH_QUERY_ENDPOINT'] = self.search_endpoint
        app.config['REDIS_CONFIG'] = self.redis_config

    @mock.patch('wqp.tasks.redis.StrictRedis.set')
    @requests_mock.Mocker()
    def test_bad_search_request(self, mock_redis, m):
        m.get(self.search_endpoint + 'Station/search/', status_code=500)
        result = load_sites_into_cache_async('P1')
        self.assertEqual(result, {'status': 500, 'cached_count': 0, 'error_count': 0, 'total_count': 0})
        self.assertTrue(m.called)

    #I tried to check the call_count for the mock_* put it always seems to be one, even though in the
    #function call it is incremented. So for now just checking to make sure they are called.
    @mock.patch('wqp.tasks.redis.StrictRedis.set')
    @mock.patch('wqp.tasks.load_sites_into_cache_async.update_state')
    @requests_mock.Mocker()
    def test_good_search_request(self, mock_redis_set, mock_celery, m):
        m.get(self.search_endpoint + 'Station/search/',
              headers={'Total-Site-Count' : '1'},
              text='OrganizationIdentifier\tOrganizationFormalName\tMonitoringLocationIdentifier\tCountryCode\tStateCode\tCountyCode\tProviderName\n' +
                'USGS-AZ\tUSGS Arizona Water Science Center\tAZ003-365613111285900\tUS\t04\t005\tNWIS'
              )
        result = load_sites_into_cache_async('NWIS')

        self.assertTrue(mock_redis_set.called)
        self.assertTrue(mock_celery.called)
        self.assertEqual(result,
                         {'status': 200, 'cached_count' : 1, 'error_count' : 0, 'total_count': 1})

    @mock.patch('wqp.tasks.redis.StrictRedis.set')
    @mock.patch('wqp.tasks.load_sites_into_cache_async.update_state')
    @requests_mock.Mocker()
    def test_error_search_request(self, mock_redis_set, mock_celery, m):
        m.get(self.search_endpoint + 'Station/search/',
              headers={'Total-Site-Count': '1'},
              text='OrganizationIdentifier\tOrganizationFormalName\tMonitoringLocationIdentifier\tCountryCode\tStateCode\tCountyCode\tProviderName\n' +
                   'USGS-AZ\tUSGS Arizona Water Science Center\tAZ003-365613111285900\tUS\t04\t005'
              )
        result = load_sites_into_cache_async('NWIS')

        self.assertTrue(mock_redis_set.called)
        self.assertTrue(mock_celery.called)
        self.assertEqual(result,
                         {'status': 200, 'cached_count': 0, 'error_count': 1, 'total_count': 1})