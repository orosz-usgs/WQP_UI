from unittest import TestCase, mock

from requests import Response
import requests_mock
from werkzeug.exceptions import NotFound

from .. import app
from ..utils import generate_redis_db_number, retrieve_lookups, retrieve_providers, retrieve_organization, \
    retrieve_organizations, retrieve_county, retrieve_sites_geojson, retrieve_site, tsv_dict_generator, get_site_key, \
    invalid_usgs_view, create_redis_log_msg, create_request_resp_log_msg


class RedisDbNumberTestCase(TestCase):
    """Tests for generate redis_db_number"""
    def test_will_nwis_return_1(self):
        """will NWIS give back a db value of 1?"""
        assert generate_redis_db_number('NWIS') == 1

    def test_will_storet_return_2(self):
        """will STORET give back a db value of 2?"""
        assert generate_redis_db_number('STORET') == 2

    def test_will_stewards_return_3(self):
        """will STEWARDS give back a db value of 3?"""
        assert generate_redis_db_number('STEWARDS') == 3

    def test_will_biodata_return_4(self):
        """will BIODATA give back a db value of 4?"""
        assert generate_redis_db_number('BIODATA') == 4

    def test_will_other_return_0(self):
        """will any other value give back a db value of 0?"""
        assert generate_redis_db_number('RANDOM') == 0


class RetrieveLookupsTestCase(TestCase):

    def setUp(self):
        self.codes_endpoint = 'mock://wqpfake.com/test_lookup/endpoint'
        app.config['CODES_ENDPOINT'] = self.codes_endpoint

    @mock.patch('wqp.session.get')
    def test_request_with_default_params(self, mock_get):
        retrieve_lookups('/test')

        mock_get.assert_called_with(self.codes_endpoint + '/test', params={'mimeType': 'json'})

    @mock.patch('wqp.session.get')
    def test_request_with_params(self, mock_get):
        retrieve_lookups('/test', {'param1': 'value1'})

        mock_get.assert_called_with(self.codes_endpoint + '/test', params={'mimeType': 'json',
                                                                           'param1': 'value1'})

    @requests_mock.Mocker()
    def test_request_with_valid_response(self, m):
        m.get(self.codes_endpoint + '/test',
              json={'recordCount': 2,
                    'codes': [
                        {'value': 'V1', 'desc': 'Value1'},
                        {'value': 'V2', 'desc': 'Value2'}
                    ]})

        self.assertEqual(retrieve_lookups('/test'),
                         {'recordCount': 2,
                          'codes': [
                              {'value': 'V1', 'desc': 'Value1'},
                              {'value': 'V2', 'desc': 'Value2'}
                          ]})

    @requests_mock.Mocker()
    def test_request_with_invalid_response(self, m):
        m.get(self.codes_endpoint + '/test', status_code=500)

        self.assertIsNone(retrieve_lookups('/test'))


@requests_mock.Mocker()
class RetrieveProviders(TestCase):

    def setUp(self):
        self.codes_endpoint = 'mock://wqpfake.com/test_lookup/endpoint'
        app.config['CODES_ENDPOINT'] = self.codes_endpoint

    def test_with_valid_request(self, m):
        m.get(self.codes_endpoint + '/providers',
              json={'recordCount': 2,
                    'codes': [
                        {'value': 'P1', 'desc': 'Provider1'},
                        {'value': 'P2', 'desc': 'Provider2'}
                    ]})

        self.assertEqual(retrieve_providers(), ['P1', 'P2'])

    def test_with_invalid_request(self, m):
        m.get(self.codes_endpoint + '/providers', json={})

        self.assertIsNone(retrieve_providers())

    def test_with_unexpected_response(self, m):
        m.get(self.codes_endpoint + '/providers',
              json={'error': 'Unexpected'})

        self.assertIsNone(retrieve_providers())


@requests_mock.Mocker()
class RetrieveOrganization(TestCase):

    def setUp(self):
        self.codes_endpoint = 'mock://wqpfake.com/test_lookup/endpoint'
        app.config['CODES_ENDPOINT'] = self.codes_endpoint

    def test_with_response_containing_org_and_provider(self, m):
        m.get(self.codes_endpoint + '/organization',
              json={'recordCount': 2,
                    'codes': [
                        {'value': 'Org10', 'desc': 'Organization10', 'providers': 'P1 P2 P3'},
                        {'value' : 'Org1', 'desc': 'Organization1', 'providers': 'P1 P2'}
                    ]})

        self.assertEqual(retrieve_organization('P2', 'Org1'), {'id': 'Org1', 'name': 'Organization1'})

    def test_with_response_containing_org_but_not_provider(self, m):
        m.get(self.codes_endpoint + '/organization',
              json={'recordCount': 2,
                    'codes': [
                        {'value': 'Org10', 'desc': 'Organization10', 'providers': 'P1 P2 P3'},
                        {'value': 'Org1', 'desc': 'Organization1', 'providers': 'P1 P2'}
                    ]})

        self.assertEqual(retrieve_organization('P3', 'Org1'), {})

    def test_with_response_containing_no_orgs(self, m):
        m.get(self.codes_endpoint + '/organization',
              json={'recordCount': 0,
                    'codes': []})

        self.assertEqual(retrieve_organization('P3', 'Org1'), {})

    def test_with_nonsense_response(self, m):
        m.get(self.codes_endpoint + '/organization',
              json={'error': 'Unexpected error'})
        self.assertIsNone(retrieve_organization('P3', 'Org1'))

    def test_with_response_without_providers(self, m):
        m.get(self.codes_endpoint + '/organization',
              json={'recordCount': 2,
                    'codes': [
                        {'value': 'Org10', 'desc': 'Organization10'},
                        {'value': 'Org1', 'desc': 'Organization1'}
                    ]})
        self.assertEqual(retrieve_organization('P3', 'Org1'), {})

    def test_with_bad_response(self, m):
        m.get(self.codes_endpoint + '/organization', status_code=500)

        self.assertIsNone(retrieve_organization('P3', 'Org1'))


@requests_mock.Mocker()
class RetrieveOrganizationsTestCase(TestCase):

    def setUp(self):
        self.codes_endpoint = 'mock://wqpfake.com/test_lookup/endpoint'
        app.config['CODES_ENDPOINT'] = self.codes_endpoint

    def test_with_response_containing_provider(self, m):
        m.get(self.codes_endpoint + '/organization',
              json={'recordCount': 3,
                    'codes': [
                        {'value': 'Org10', 'desc': 'Organization10', 'providers': 'P1 P2 P3'},
                        {'value': 'Org1', 'desc': 'Organization1', 'providers': 'P1 P2'},
                        {'value': 'Org2', 'desc': 'Organization2', 'providers': 'P4'}
                    ]})

        self.assertEqual(retrieve_organizations('P1'), [{'id': 'Org10', 'name': 'Organization10'},
                                                        {'id': 'Org1', 'name': 'Organization1'}])
        self.assertEqual(retrieve_organizations('P4'), [{'id': 'Org2', 'name': 'Organization2'}])

    def test_with_response_without_provider(self, m):
        m.get(self.codes_endpoint + '/organization',
              json={'recordCount': 3,
                    'codes': [
                        {'value': 'Org10', 'desc': 'Organization10', 'providers': 'P1 P2 P3'},
                        {'value': 'Org1', 'desc': 'Organization1', 'providers': 'P1 P2'},
                        {'value': 'Org2', 'desc': 'Organization2', 'providers': 'P4'}
                    ]})

        self.assertEqual(retrieve_organizations('P5'), [])

    def test_with_nonsense_response(self, m):
        m.get(self.codes_endpoint + '/organization',
              json={'Error': 'Unexpected'})

        self.assertIsNone(retrieve_organizations('P5'))

    def test_with_bad_response(self, m):
        m.get(self.codes_endpoint + '/organization', status_code=500)

        self.assertIsNone(retrieve_organizations('P1'))


class RetrieveCountyTestCase(TestCase):

    def setUp(self):
        self.codes_endpoint = 'mock://wqpfake.com/test_lookup/endpoint'
        app.config['CODES_ENDPOINT'] = self.codes_endpoint

    @mock.patch('wqp.utils.retrieve_lookups')
    def test_retrieval_parameters(self, mock_retrieve):
        retrieve_county('US', '55', '005')

        mock_retrieve.assert_called_with('/countycode', {'statecode': 'US:55', 'text': 'US:55:005'})

    @requests_mock.Mocker()
    def test_response_with_data(self, m):
        m.get(self.codes_endpoint + '/countycode',
              json={'recordCount': 1,
                    'codes': [
                        {'value': 'US:55:005', 'desc': 'US, Wisconsin, Dane County', 'providers' : 'P1 P2'}
                    ]})

        self.assertEqual(retrieve_county('US', '55', '005'), {'StateName' : ' Wisconsin', 'CountyName': ' Dane County'})

    @requests_mock.Mocker()
    def test_response_with_no_records(self, m):
        m.get(self.codes_endpoint + '/countycode',
              json={'recordCount': 0, 'codes': []})

        self.assertEqual(retrieve_county('US', '55', '005'), {})

    @requests_mock.Mocker()
    def test_response_with_bad_description(self, m):
        m.get(self.codes_endpoint + '/countycode',
              json={'recordCount': 1,
                    'codes': [
                        {'value': 'US:55:005', 'desc': 'US, Wisconsin', 'providers': 'P1 P2'}
                    ]})

        self.assertEqual(retrieve_county('US', '55', '005'), {})

    @requests_mock.Mocker()
    def test_response_with_nonsense_response(self, m):
        m.get(self.codes_endpoint + '/countycode',
              json={'error': 'Unexpected error'})

        self.assertIsNone(retrieve_county('US', '55', '005'))

    @requests_mock.Mocker()
    def test_response_with_no_codes_in_response(self, m):
        m.get(self.codes_endpoint + '/countycode',
              json={'recordCount': 1})

        self.assertEqual(retrieve_county('US', '55', '005'), {})

    @requests_mock.Mocker()
    def test_with_bad_response(self, m):
        m.get(self.codes_endpoint + '/countycode', status_code=500)

        self.assertIsNone(retrieve_county('US', '55', '005'))


class RetrieveSitesGeojsonTestCase(TestCase):

    def setUp(self):
        self.sites_endpoint = 'mock://wqpfake.com/search/'
        app.config['SEARCH_QUERY_ENDPOINT'] = self.sites_endpoint

    @mock.patch('wqp.session.get')
    def test_request_parameters(self, mock_get):
        retrieve_sites_geojson('P1', 'Org1')

        mock_get.assert_called_with(
            self.sites_endpoint + 'Station/search',
            params={
                'organization': 'Org1',
                'providers': 'P1',
                'mimeType': 'geojson',
                'sorted': 'no',
                'minresults': 1,
                'uripage': 'yes'
            }
        )

    @requests_mock.Mocker()
    def test_with_valid_response(self, m):
        geojson = {
            'type': 'FeatureCollection',
            'features': [{
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [-111.4837694, 36.9369326]
                },
                'properties': {
                    'ProviderName': 'NWIS',
                    'OrganizationIdentifier': 'USGS-AZ',
                    'OrganizationFormalName': 'USGS Arizona Water Science Center',
                    'MonitoringLocationIdentifier': 'AZ003-365613111285900'
                }
            }, {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point', 'coordinates': [-113.4837694, 37.9369326]
                },
                'properties': {
                    'ProviderName': 'NWIS',
                    'OrganizationIdentifier': 'USGS-AZ',
                    'OrganizationFormalName': 'USGS Arizona Water Science Center',
                    'MonitoringLocationIdentifier': 'AZ003-3656131112565656'
                }
            }]
        }
        m.get(self.sites_endpoint + 'Station/search', json=geojson)

        self.assertEqual(retrieve_sites_geojson('NWIS', 'USGS-AZ'), geojson)

    @requests_mock.Mocker()
    def test_with_bad_request(self, m):
        m.get(self.sites_endpoint + 'Station/search', status_code=400)

        self.assertEqual(retrieve_sites_geojson('NWIS', 'USGS-AZ'), {})

    @requests_mock.Mocker()
    def test_with_server_error(self, m):
        m.get(self.sites_endpoint + 'Station/search', status_code=500)

        self.assertIsNone(retrieve_sites_geojson('NWIS', 'USGS-AZ'))


class RetrieveSiteTestCase(TestCase):

    def setUp(self):
        self.sites_endpoint = 'mock://wqpfake.com/search/'
        app.config['SEARCH_QUERY_ENDPOINT'] = self.sites_endpoint

    @mock.patch('wqp.session.get')
    def test_request_parameters(self, mock_get):
        retrieve_site('NWIS', 'USGS-AZ', 'AZ003-365613111285900')

        mock_get.assert_called_with(self.sites_endpoint + 'Station/search',
                                    params={'organization': 'USGS-AZ',
                                            'providers': 'NWIS',
                                            'siteid': 'AZ003-365613111285900',
                                            'mimeType': 'tsv',
                                            'sorted': 'no',
                                            'uripage': 'yes'})


    @requests_mock.Mocker()
    def test_with_valid_response(self, m):
        m.get(self.sites_endpoint + 'Station/search',
              text=('OrganizationIdentifier\tOrganizationFormalName\tMonitoringLocationIdentifier\tCountryCode\tStateCode\tCountyCode\tProviderName\n' +
                    'USGS-AZ\tUSGS Arizona Water Science Center\tAZ003-365613111285900\tUS\t04\t005\tNWIS'))

        self.assertEqual(retrieve_site('NWIS', 'USGS-AZ', 'AZ003-365613111285900'),
                         {'OrganizationIdentifier': 'USGS-AZ',
                          'OrganizationFormalName': 'USGS Arizona Water Science Center',
                          'MonitoringLocationIdentifier': 'AZ003-365613111285900',
                          'CountryCode': 'US',
                          'StateCode': '04',
                          'CountyCode': '005',
                          'ProviderName': 'NWIS'})

    @requests_mock.Mocker()
    def test_with_bad_response(self, m):
        m.get(self.sites_endpoint + 'Station/search', status_code=400)

        self.assertEqual(retrieve_site('NWIS', 'USGS-AZ', 'AZ003-365613111285900'), {})

    @requests_mock.Mocker()
    def test_with_server_error(self, m):
        m.get(self.sites_endpoint + 'Station/search', status_code=500)

        self.assertIsNone(retrieve_site('NWIS', 'USGS-AZ', 'AZ003-365613111285900'))


class TsvDictGenerator(TestCase):

    def test_with_lines_with_the_same_column_count(self):
        lines = ['H1\tH2\tH3\tH4',
                 'L1C1\tL1C2\tL1C3\tL1C4',
                 'L2C1\tL2C2\tL2C3\tL2C4']
        iter_lines = (line for line in lines)
        result = tuple(tsv_dict_generator(iter_lines))

        self.assertEqual(len(result), 2)
        self.assertEqual(result[0], {'H1': 'L1C1', 'H2': 'L1C2', 'H3': 'L1C3', 'H4': 'L1C4'})
        self.assertEqual(result[1], {'H1': 'L2C1', 'H2': 'L2C2', 'H3': 'L2C3', 'H4': 'L2C4'})

    def test_with_some_lines_with_mismatched_column_counts(self):
        lines = ['H1\tH2\tH3\tH4',
                 'L1C1\tL1C2\tL1C3',
                 'L2C1\tL2C2\tL2C3\tL2C4',
                 'L3C1\tL3C2\tL3C3\tL3C4\tL3C5',
                 'L4C1\tL4C2\tL4C3\tL4C4']
        iter_lines = (line for line in lines)
        result = tuple(tsv_dict_generator(iter_lines))

        self.assertEqual(len(result), 4)
        self.assertEqual(result[0], {})
        self.assertEqual(result[1], {'H1': 'L2C1', 'H2': 'L2C2', 'H3': 'L2C3', 'H4': 'L2C4'})
        self.assertEqual(result[2], {})
        self.assertEqual(result[3], {'H1': 'L4C1', 'H2': 'L4C2', 'H3': 'L4C3', 'H4': 'L4C4'})

class GetSiteKey(TestCase):

    def test_get_site_key(self):
        self.assertEqual(get_site_key('P1', 'Org1', 'Site1'), 'sites_P1_Org1_Site1')


class InvalidUsgsView(TestCase):

    def setUp(self):
        def test_view():
            return 'It worked'
        self.test_view = test_view

    def test_with_theme_not_set_to_usgs(self):
        app.config['UI_THEME'] = 'wqp'
        self.assertEqual(invalid_usgs_view(self.test_view)(), 'It worked')

    def test_with_theme_set_to_usgs(self):
        app.config['UI_THEME'] = 'usgs'
        view = invalid_usgs_view(self.test_view)
        with self.assertRaises(NotFound):
            view()


class TestCreateRedisLogMsg(TestCase):

    def setUp(self):
        self.redis_host = 'redis.fakehost.com'
        self.redis_port = 10089
        self.db_number = 91

    def test_message(self):
        result = create_redis_log_msg(self.redis_host,
                                      self.redis_port,
                                      self.db_number)
        expected = 'Connecting to Redis database 91 on redis.fakehost.com:10089.'
        self.assertEqual(result, expected)


class TestCreateRequestResponseLogMsg(TestCase):

    def setUp(self):
        self.test_resp = Response()
        self.test_resp = mock.MagicMock(status_code=601,
                                        url='https://fake.url.com',
                                        headers='blah')

    def test_message(self):
        result = create_request_resp_log_msg(self.test_resp)
        expected = 'Status Code: 601, URL: https://fake.url.com, Response headers: blah'
        self.assertEqual(result, expected)
