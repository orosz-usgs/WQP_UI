

import geojson

from flask_testing import TestCase

from ... import app
from ..utils import get_site_feature

class TestGetSiteFeature(TestCase):

    def create_app(self):
        app.config['NWIS_SITES_INVENTORY_ENDPOINT'] = 'http://fakewaterservices/inventory'
        return app

    def test_invalid_lat_lon(self):
        station = {
            'dec_lat_va' : 'Abcd',
            'dec_long_va' : '-100.0',
            'dec_coord_datum_cd' : 'NAD83'
        }
        self.assertIsNone(get_site_feature(station))

        station['dec_lat_va'] = '45.0'
        station['dec_long_va'] = 'abcd'
        self.assertIsNone(get_site_feature(station))

    def test_invalid_coord_datum_cd(self):
        station = {
            'dec_lat_va' : '45.0',
            'dec_long__va' : '-100.0',
            'dec_coord_datum_cd' : ''
        }
        self.assertIsNone(get_site_feature(station))

    def test_valid_data(self):
        station = {
            'dec_lat_va': '45.0',
            'dec_long_va': '-100.0',
            'dec_coord_datum_cd': 'NAD83',
            'station_nm' : 'Black River',
            'agency_cd' : 'USGS',
            'site_no' : '12345',
            'huc_cd' : '03120312',
            'site_tp_cd' : 'ST',

        }
        expectedProperties = {
            'stationName' : 'Black River',
            'agencyCode' : 'USGS',
            'siteNumber' : '12345',
            'hucCode' : '03120312',
            'SiteTypeCode' : 'ST',
            'SiteType' : 'Stream',
            'url': 'http://waterservices.usgs.gov/nwis/inventory?agencyCode=USGS&site_no=12345'
        }
        result = geojson.loads(geojson.dumps(get_site_feature(station)))


        self.assertEqual(result['properties'], expectedProperties)
        self.assertEqual(result['geometry']['type'], 'Point')