import {showIdentifyPopup} from '../../../js/identifyDialog';


describe('Test identifyDialog', function () {
    let map, popup, $testDiv, $siteid, $north, $south, $west, $east;

    beforeEach(() => {
        $('body').append('<div id="test-div"></div>');
        $testDiv = $('#test-div');
        $testDiv.append('<div id="map"></div>');
        $testDiv.append('<select id="siteid" name="siteid"></select>');
        $testDiv.append('<input type="text" id="north" />');
        $testDiv.append('<input type="text" id="south" />');
        $testDiv.append('<input type="text" id="west" />');
        $testDiv.append('<input type="text" id="east" />');
        map = L.map('map', {
            center: [43, -100],
            zoom: 3
        });

        popup = L.popup();
        $siteid = $('#siteid');
        $north = $('#north');
        $south = $('#south');
        $west = $('#west');
        $east = $('#east');

        $siteid.select2();
    });

    afterEach(() => {
        $siteid.select2('destroy');
        map.remove();
        $testDiv.remove();
    });

    it('Does not show the dialog if no features are passed', () => {
        showIdentifyPopup({
            map: map,
            popup: popup,
            atLatLng: [43, -100],
            features: {
                features: []
            }
        });

        expect(map.hasLayer(popup)).toBe(false);
    });

    it('Shows the dialog if features are passed', () => {
        /* eslint no-use-before-define: 0 */
        showIdentifyPopup({
            map: map,
            popup: popup,
            atLatLng: [43, -100],
            features: TEST_ONE_FEATURE
        });

        expect(map.hasLayer(popup)).toBe(true);
    });

    it('Clicking the populate button with one feature adds the site id to the siteid select and does not fill in the bbox inputs', () => {
        /* eslint no-use-before-define: 0 */
        showIdentifyPopup({
            map: map,
            popup: popup,
            atLatLng: [43, -100],
            features: TEST_ONE_FEATURE
        });
        $('#identify-populate-button').trigger('click');

        expect($siteid.val()).toEqual('WIDNR_WQX-10037636');
        expect($north.val()).toEqual('');
        expect($south.val()).toEqual('');
        expect($west.val()).toEqual('');
        expect($east.val()).toEqual('');
    });

    it('Clicking the populate button with one feature adds the site id to the siteid select and does not fill in the bbox inputs', () => {
        /* eslint no-use-before-define: 0 */
        showIdentifyPopup({
            map: map,
            popup,
            atLatLng: [43, -100],
            features: TEST_FIFTY_FEATURES
        });
        $('#identify-populate-button').trigger('click');

        expect($siteid.val()).toEqual(null);
        expect($north.val()).toEqual('43.29278');
        expect($south.val()).toEqual('43.179714');
        expect($west.val()).toEqual('-89.8247');
        expect($east.val()).toEqual('-89.6956778');
    });

    it('A second call to showIdentifyDialog with no features closes the popup', () => {
        /* eslint no-use-before-define: 0 */
        showIdentifyPopup({
            map: map,
            popup: popup,
            atLatLng: [43, -100],
            features: TEST_ONE_FEATURE
        });
        showIdentifyPopup({
            map: map,
            popup: popup,
            atLatLng: [43, -100],
            features: {
                features: []
            }
        });

        expect(map.hasLayer(popup)).toBe(false);
    });

    const TEST_ONE_FEATURE = {
        'type': 'FeatureCollection',
        'totalFeatures': 1,
        'features': [{
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1555',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.61713, 43.25431]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-10037636',
                'locName': 'Unknown Lake in Dane Co',
                'type': 'Lake',
                'searchType': '\'Lake, Reservoir, Impoundment\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '2',
                'resultCnt': '2',
                'bbox': [-89.61713, 43.25431, -89.61713, 43.25431]
            }
        }],
        'crs': {
            'type': 'name',
            'properties': {
                'name': 'urn:ogc:def:crs:EPSG::4326'
            }
        },
        'bbox': [43.25431, -89.61713, 43.25431, -89.61713]
    };

    const TEST_FIFTY_FEATURES = {
        'type': 'FeatureCollection',
        'totalFeatures': 55,
        'features': [{
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.718456, 43.2913775]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'USGS-WI',
                'orgName': 'USGS Wisconsin Water Science Center',
                'name': 'USGS-05406000',
                'locName': 'WISCONSIN RIVER AT PRAIRIE DU SAC, WI',
                'type': 'Stream',
                'searchType': 'Stream',
                'huc8': '07070005',
                'provider': 'NWIS',
                'sampleCnt': '0',
                'resultCnt': '0',
                'bbox': [-89.718456, 43.2913775, -89.718456, 43.2913775]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.4',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.7565118, 43.206102]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'USGS-WI',
                'orgName': 'USGS Wisconsin Water Science Center',
                'name': 'USGS-05406320',
                'locName': 'DUNLAP CREEK AT SR78 NEAR MAZOMANIE, WI',
                'type': 'Stream',
                'searchType': 'Stream',
                'huc8': '07070005',
                'provider': 'NWIS',
                'sampleCnt': '2',
                'resultCnt': '28',
                'bbox': [-89.7565118, 43.206102, -89.7565118, 43.206102]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.5',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.8241667, 43.1905556]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'USGS-WI',
                'orgName': 'USGS Wisconsin Water Science Center',
                'name': 'USGS-05406328',
                'locName': 'MARSH CREEK AT BECKMAN ROAD NEAR MAZOMANIE, WI',
                'type': 'Stream',
                'searchType': 'Stream',
                'huc8': '07070005',
                'provider': 'NWIS',
                'sampleCnt': '0',
                'resultCnt': '0',
                'bbox': [-89.8241667, 43.1905556, -89.8241667, 43.1905556]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.75',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.7573451, 43.1824916]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'USGS-WI',
                'orgName': 'USGS Wisconsin Water Science Center',
                'name': 'USGS-054065199',
                'locName': 'HALFWAY PRAIRIE CREEK AT FARM NEAR MAZOMANIE, WI',
                'type': 'Stream',
                'searchType': 'Stream',
                'huc8': '07070005',
                'provider': 'NWIS',
                'sampleCnt': '196',
                'resultCnt': '1704',
                'bbox': [-89.7573451, 43.1824916, -89.7573451, 43.1824916]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.76',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.7590118, 43.1824916]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'USGS-WI',
                'orgName': 'USGS Wisconsin Water Science Center',
                'name': 'USGS-05406520',
                'locName': 'HALFWAY PRAIRIE CREEK NEAR MAZOMANIE, WI',
                'type': 'Stream',
                'searchType': 'Stream',
                'huc8': '07070005',
                'provider': 'NWIS',
                'sampleCnt': '197',
                'resultCnt': '1684',
                'bbox': [-89.7590118, 43.1824916, -89.7590118, 43.1824916]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.82',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.7959564, 43.179714]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'USGS-WI',
                'orgName': 'USGS Wisconsin Water Science Center',
                'name': 'USGS-05406540',
                'locName': 'BLACK EARTH CREEK AT MAZOMANIE, WI',
                'type': 'Stream',
                'searchType': 'Stream',
                'huc8': '07070005',
                'provider': 'NWIS',
                'sampleCnt': '0',
                'resultCnt': '0',
                'bbox': [-89.7959564, 43.179714, -89.7959564, 43.179714]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.843',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.8037342, 43.1805473]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'USGS-WI',
                'orgName': 'USGS Wisconsin Water Science Center',
                'name': 'USGS-431050089481301',
                'locName': 'DN-08/06E/08-0903',
                'type': 'Well',
                'searchType': 'Well',
                'huc8': '07070005',
                'provider': 'NWIS',
                'sampleCnt': '0',
                'resultCnt': '0',
                'bbox': [-89.8037342, 43.1805473, -89.8037342, 43.1805473]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.845',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.804012, 43.1805473]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'USGS-WI',
                'orgName': 'USGS Wisconsin Water Science Center',
                'name': 'USGS-431051089481401',
                'locName': 'DN-08/06E/08-1071',
                'type': 'Well',
                'searchType': 'Well',
                'huc8': '07070005',
                'provider': 'NWIS',
                'sampleCnt': '1',
                'resultCnt': '18',
                'bbox': [-89.804012, 43.1805473, -89.804012, 43.1805473]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.854',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.8012342, 43.1863805]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'USGS-WI',
                'orgName': 'USGS Wisconsin Water Science Center',
                'name': 'USGS-431111089480401',
                'locName': 'DN-08/06E/08-1112',
                'type': 'Well',
                'searchType': 'Well',
                'huc8': '07070005',
                'provider': 'NWIS',
                'sampleCnt': '0',
                'resultCnt': '0',
                'bbox': [-89.8012342, 43.1863805, -89.8012342, 43.1863805]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.858',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.8245676, 43.1924914]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'USGS-WI',
                'orgName': 'USGS Wisconsin Water Science Center',
                'name': 'USGS-431133089492801',
                'locName': 'DN-08/06E/06-0919',
                'type': 'Well',
                'searchType': 'Well',
                'huc8': '07070005',
                'provider': 'NWIS',
                'sampleCnt': '1',
                'resultCnt': '18',
                'bbox': [-89.8245676, 43.1924914, -89.8245676, 43.1924914]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.860',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.7840119, 43.1933247]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'USGS-WI',
                'orgName': 'USGS Wisconsin Water Science Center',
                'name': 'USGS-431136089470201',
                'locName': 'DN-08/06E/04-1143',
                'type': 'Well',
                'searchType': 'Well',
                'huc8': '07070005',
                'provider': 'NWIS',
                'sampleCnt': '3',
                'resultCnt': '159',
                'bbox': [-89.7840119, 43.1933247, -89.7840119, 43.1933247]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.863',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.6956778, 43.1961027]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'USGS-WI',
                'orgName': 'USGS Wisconsin Water Science Center',
                'name': 'USGS-431146089414401',
                'locName': 'DN-08/07E/05-0992',
                'type': 'Well',
                'searchType': 'Well',
                'huc8': '07070005',
                'provider': 'NWIS',
                'sampleCnt': '1',
                'resultCnt': '29',
                'bbox': [-89.6956778, 43.1961027, -89.6956778, 43.1961027]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.865',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.787623, 43.1999911]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'USGS-WI',
                'orgName': 'USGS Wisconsin Water Science Center',
                'name': 'USGS-431200089471501',
                'locName': 'DN-08/06E/04-1141',
                'type': 'Well',
                'searchType': 'Well',
                'huc8': '07070005',
                'provider': 'NWIS',
                'sampleCnt': '0',
                'resultCnt': '0',
                'bbox': [-89.787623, 43.1999911, -89.787623, 43.1999911]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.867',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.7948453, 43.2030466]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'USGS-WI',
                'orgName': 'USGS Wisconsin Water Science Center',
                'name': 'USGS-431211089474101',
                'locName': 'DN-08/06E/04-0918',
                'type': 'Well',
                'searchType': 'Well',
                'huc8': '07070005',
                'provider': 'NWIS',
                'sampleCnt': '1',
                'resultCnt': '18',
                'bbox': [-89.7948453, 43.2030466, -89.7948453, 43.2030466]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.876',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.7840119, 43.2099908]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'USGS-WI',
                'orgName': 'USGS Wisconsin Water Science Center',
                'name': 'USGS-431236089470201',
                'locName': 'DN-09/06E/33-1087',
                'type': 'Well',
                'searchType': 'Well',
                'huc8': '07070005',
                'provider': 'NWIS',
                'sampleCnt': '0',
                'resultCnt': '0',
                'bbox': [-89.7840119, 43.2099908, -89.7840119, 43.2099908]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.885',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.7999167, 43.2229444]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'USGS-WI',
                'orgName': 'USGS Wisconsin Water Science Center',
                'name': 'USGS-431312089475301',
                'locName': 'DN-09/06E/29-0083',
                'type': 'Well',
                'searchType': 'Well',
                'huc8': '07070005',
                'provider': 'NWIS',
                'sampleCnt': '1',
                'resultCnt': '16',
                'bbox': [-89.7999167, 43.2229444, -89.7999167, 43.2229444]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.887',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.7892897, 43.2236015]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'USGS-WI',
                'orgName': 'USGS Wisconsin Water Science Center',
                'name': 'USGS-431325089472101',
                'locName': 'DN-09/06E/28-1269',
                'type': 'Well',
                'searchType': 'Well',
                'huc8': '07070005',
                'provider': 'NWIS',
                'sampleCnt': '0',
                'resultCnt': '0',
                'bbox': [-89.7892897, 43.2236015, -89.7892897, 43.2236015]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.911',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.7145669, 43.2683226]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'USGS-WI',
                'orgName': 'USGS Wisconsin Water Science Center',
                'name': 'USGS-431606089425201',
                'locName': 'DN-09/07E/07-0890',
                'type': 'Well',
                'searchType': 'Well',
                'huc8': '07070005',
                'provider': 'NWIS',
                'sampleCnt': '0',
                'resultCnt': '0',
                'bbox': [-89.7145669, 43.2683226, -89.7145669, 43.2683226]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.931',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.7906786, 43.1988801]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'USGS-WI',
                'orgName': 'USGS Wisconsin Water Science Center',
                'name': 'USGS-431756089472301',
                'locName': 'DN-08/06E/04-0508',
                'type': 'Well',
                'searchType': 'Well',
                'huc8': '07070005',
                'provider': 'NWIS',
                'sampleCnt': '0',
                'resultCnt': '0',
                'bbox': [-89.7906786, 43.1988801, -89.7906786, 43.1988801]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.975',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.82451, 43.21793]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'OST_SHPD',
                'orgName': 'USEPA, Office of Water, Office of Science and Technology, Standards and Health Protection Division',
                'name': 'OST_SHPD-NRSA0809-WI030',
                'locName': 'Wisconsin River',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '1',
                'resultCnt': '54',
                'bbox': [-89.82451, 43.21793, -89.82451, 43.21793]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.976',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.82451, 43.21793]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'OST_SHPD',
                'orgName': 'USEPA, Office of Water, Office of Science and Technology, Standards and Health Protection Division',
                'name': 'OST_SHPD-NRSA1314-WIR9-0904',
                'locName': 'Wisconsin River',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '1',
                'resultCnt': '177',
                'bbox': [-89.82451, 43.21793, -89.82451, 43.21793]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.977',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.82451, 43.21793]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'OST_SHPD_TEST',
                'orgName': 'Testing Account For USEPA, Office of Water, Office of Science and Technology, Standards and Health Protection Division',
                'name': 'OST_SHPD_TEST-NRSA01314-WIR9-090',
                'locName': 'Wisconsin River',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '0',
                'resultCnt': '0',
                'bbox': [-89.82451, 43.21793, -89.82451, 43.21793]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.978',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.82451, 43.21793]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'OST_SHPD_TEST',
                'orgName': 'Testing Account For USEPA, Office of Water, Office of Science and Technology, Standards and Health Protection Division',
                'name': 'OST_SHPD_TEST-NRSA0809-WI030',
                'locName': 'Wisconsin River',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '1',
                'resultCnt': '54',
                'bbox': [-89.82451, 43.21793, -89.82451, 43.21793]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.979',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.82451, 43.21793]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'OST_SHPD_TEST',
                'orgName': 'Testing Account For USEPA, Office of Water, Office of Science and Technology, Standards and Health Protection Division',
                'name': 'OST_SHPD_TEST-NRSA1314-WIR9-0904',
                'locName': 'Wisconsin River',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '1',
                'resultCnt': '177',
                'bbox': [-89.82451, 43.21793, -89.82451, 43.21793]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1059',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.7514599, 43.2031101]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-10009589',
                'locName': 'DUNLAP CREEK UPSTREAM HWY 78 BRIDGE',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '10',
                'resultCnt': '55',
                'bbox': [-89.7514599, 43.2031101, -89.7514599, 43.2031101]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1210',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.75891, 43.18264]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-10014474',
                'locName': 'HALFWAY PRAIRIE CREEK-UPSTREAM STH 78',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '0',
                'resultCnt': '0',
                'bbox': [-89.75891, 43.18264, -89.75891, 43.18264]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1267',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.824102, 43.190435]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-10016850',
                'locName': 'MARSH CREEK - 0',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '3',
                'resultCnt': '10',
                'bbox': [-89.824102, 43.190435, -89.824102, 43.190435]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1268',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.724729, 43.20578]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-10016905',
                'locName': 'Dunlap Creek - Wilkinson Rd',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '9',
                'resultCnt': '47',
                'bbox': [-89.724729, 43.20578, -89.724729, 43.20578]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1274',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.81559, 43.224957]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-10017373',
                'locName': 'Wisconsin River - Mazo Beach',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '0',
                'resultCnt': '0',
                'bbox': [-89.81559, 43.224957, -89.81559, 43.224957]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1275',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.75807, 43.239006]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-10017374',
                'locName': 'Wisconsin River -- Mazo Town Boat Landing',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '1',
                'resultCnt': '0',
                'bbox': [-89.75807, 43.239006, -89.75807, 43.239006]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1315',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.75793, 43.239059]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-10020089',
                'locName': 'Wisconsin River -- Mazomanie Boat Ramp',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '14',
                'resultCnt': '0',
                'bbox': [-89.75793, 43.239059, -89.75793, 43.239059]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1318',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.82396, 43.190414]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-10020908',
                'locName': 'Marsh Creek At Beckman Road',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '15',
                'resultCnt': '54',
                'bbox': [-89.82396, 43.190414, -89.82396, 43.190414]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1356',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.71164, 43.28833]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-10029254',
                'locName': 'Mud Lake Outfall just west of Clifton Rd',
                'type': 'Facility Privately Owned Non-ind',
                'searchType': '\'Facility\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '4',
                'resultCnt': '32',
                'bbox': [-89.71164, 43.28833, -89.71164, 43.28833]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1357',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.712204, 43.287823]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-10029255',
                'locName': 'Mud Lake Outfall to WI. R. Unnamed Channel',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '2',
                'resultCnt': '13',
                'bbox': [-89.712204, 43.287823, -89.712204, 43.287823]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1358',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.71624, 43.29278]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-10029256',
                'locName': 'Isolated Slough in WI. R. Unnamed Channel',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '2',
                'resultCnt': '14',
                'bbox': [-89.71624, 43.29278, -89.71624, 43.29278]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1359',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.71401, 43.287643]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-10029257',
                'locName': 'Wisconsin River Upstream of Mud Lake Outfall into River',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '4',
                'resultCnt': '32',
                'bbox': [-89.71401, 43.287643, -89.71401, 43.287643]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1360',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.713455, 43.286743]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-10029258',
                'locName': 'Wisconsin River Downstream of Mud Lake Outfall on River',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '6',
                'resultCnt': '32',
                'bbox': [-89.713455, 43.286743, -89.713455, 43.286743]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1394',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.752174, 43.24657]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-10030785',
                'locName': 'Wisconsin River across from Blackhawk landing and upstream 0.5 mi',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '6',
                'resultCnt': '42',
                'bbox': [-89.752174, 43.24657, -89.752174, 43.24657]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1395',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.748505, 43.245583]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-10030786',
                'locName': 'Wisconsin River upstream from Blackhawk landing 0.5 mi',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '3',
                'resultCnt': '46',
                'bbox': [-89.748505, 43.245583, -89.748505, 43.245583]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1396',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.718445, 43.270496]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-10030788',
                'locName': 'Wisconsin River at old highway 12 bridge site',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '3',
                'resultCnt': '38',
                'bbox': [-89.718445, 43.270496, -89.718445, 43.270496]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1397',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.71767, 43.27128]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-10030789',
                'locName': 'Wisconsin River at island across from Sauk City',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '6',
                'resultCnt': '45',
                'bbox': [-89.71767, 43.27128, -89.71767, 43.27128]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1408',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.714806, 43.287575]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-10031437',
                'locName': 'Wisconsin River at Mud Lake outlet',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '2',
                'resultCnt': '15',
                'bbox': [-89.714806, 43.287575, -89.714806, 43.287575]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1424',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.71757, 43.25817]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-10031636',
                'locName': 'Roxbury Creek at STH 78',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '27',
                'resultCnt': '158',
                'bbox': [-89.71757, 43.25817, -89.71757, 43.25817]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1551',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.7944, 43.212387]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-10037572',
                'locName': 'Dunlap Hollow Creek -- SE corner of Dunlap Hollow Creek and County Highway Y',
                'type': 'Wetland Undifferentiated',
                'searchType': '\'Wetland\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '0',
                'resultCnt': '0',
                'bbox': [-89.7944, 43.212387, -89.7944, 43.212387]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1595',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.72949, 43.207016]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-10039733',
                'locName': 'Dunlap Creek DS Dunlap Hollow Rd',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '0',
                'resultCnt': '0',
                'bbox': [-89.72949, 43.207016, -89.72949, 43.207016]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1664',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.774062, 43.239254]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-10043051',
                'locName': 'Wisconsin River below Prairie du Sac Dam to Dane/Iowa Co. line',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '139',
                'resultCnt': '152',
                'bbox': [-89.774062, 43.239254, -89.774062, 43.239254]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1737',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.8153, 43.2155]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-10046875',
                'locName': 'Fishers LK.',
                'type': 'Lake',
                'searchType': '\'Lake, Reservoir, Impoundment\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '1',
                'resultCnt': '9',
                'bbox': [-89.8153, 43.2155, -89.8153, 43.2155]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1738',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.7346, 43.2519]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-10046880',
                'locName': 'Unnamed Channel (WBIC 1259800)',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '1',
                'resultCnt': '21',
                'bbox': [-89.7346, 43.2519, -89.7346, 43.2519]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1739',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.7322, 43.2499]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-10046881',
                'locName': 'Un. Channel (WBIC 5572682 Heiney\'s)',
                'type': 'Lake',
                'searchType': '\'Lake, Reservoir, Impoundment\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '1',
                'resultCnt': '5',
                'bbox': [-89.7322, 43.2499, -89.7322, 43.2499]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1740',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.8247, 43.2096]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-10046883',
                'locName': 'Dunlap Cr.',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '1',
                'resultCnt': '5',
                'bbox': [-89.8247, 43.2096, -89.8247, 43.2096]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1741',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.7148, 43.2077]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-10046884',
                'locName': 'Un. Slough (WBIC 5573283 by Dunlap Cr.)',
                'type': 'Lake',
                'searchType': '\'Lake, Reservoir, Impoundment\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '1',
                'resultCnt': '4',
                'bbox': [-89.7148, 43.2077, -89.7148, 43.2077]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1924',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.75654, 43.206074]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-133391',
                'locName': 'Dunlap Creek - Near Mazomanie WI',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '11',
                'resultCnt': '22',
                'bbox': [-89.75654, 43.206074, -89.75654, 43.206074]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1945',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.75892, 43.18258]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-133412',
                'locName': 'Halfway Prairie Creek - Hwy 78 Near Mazomanie WI',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '350',
                'resultCnt': '1127',
                'bbox': [-89.75892, 43.18258, -89.75892, 43.18258]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1946',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.757296, 43.182494]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-133413',
                'locName': 'Halfway Prairie Creek at Farm Near Mazomanie WI',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '320',
                'resultCnt': '1021',
                'bbox': [-89.757296, 43.182494, -89.757296, 43.182494]
            }
        }, {
            'type': 'Feature',
            'id': 'dynamicSites_3969519071.1965',
            'geometry': {
                'type': 'Point',
                'coordinates': [-89.720319, 43.269566]
            },
            'geometry_name': 'the_geom',
            'properties': {
                'orgId': 'WIDNR_WQX',
                'orgName': 'Wisconsin Department of Natural Resources',
                'name': 'WIDNR_WQX-133441',
                'locName': 'Wisconsin River at Ush 12 Bridge',
                'type': 'River/Stream',
                'searchType': '\'Stream\'',
                'huc8': '07070005',
                'provider': 'STORET',
                'sampleCnt': '3',
                'resultCnt': '4',
                'bbox': [-89.720319, 43.269566, -89.720319, 43.269566]
            }
        }],
        'crs': {
            'type': 'name',
            'properties': {
                'name': 'urn:ogc:def:crs:EPSG::4326'
            }
        },
        'bbox': [43.179714, -89.8247, 43.29278, -89.6956778]
    };
});

