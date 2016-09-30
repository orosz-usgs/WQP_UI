
from geojson import Feature, Point, dumps as geojson_dumps
from pyproj import Proj, transform

from .. import app

NWIS_SITES_INVENTORY_ENDPOINT = app.config['NWIS_SITES_INVENTORY_ENDPOINT']

# This huge dict lets us map the site type codes to actual, non-expert-useful values.
SITE_TYPES_MAPPING = {"ES": "Estuary",
                   "LK": "Lake, Reservoir, Impoundment",
                   "OC": "Ocean",
                   "OC-CO": "Coastal",
                   "ST": "Stream",
                   "ST-CA": "Canal",
                   "ST-DCH": "Ditch",
                   "ST-TS": "Tidal stream",
                   "WE": "Wetland",
                   "GW": "Well",
                   "GW-CR": "Collector or Ranney type well",
                   "GW-EX": "Extensometer well",
                   "GW-HZ": "Hyporheic-zone well",
                   "GW-IW": "Interconnected wells",
                   "GW-MW": "Multiple wells",
                   "GW-TH": "Test hole not completed as a well",
                   "SB": "Subsurface",
                   "SB-CV": "Cave",
                   "SB-GWD": "Groundwater drain",
                   "SB-TSM": "Tunnel, shaft, or mine",
                   "SB-UZ": "Unsaturated zone",
                   "SP": "Spring",
                   "AT": "Atmosphere",
                   "AG": "Aggregate groundwater use",
                   "AS": "Aggregate surface-water-use",
                   "AW": "Aggregate water-use establishment",
                   "FA": "Facility",
                   "FA-AWL": "Animal waste lagoon",
                   "FA-CI": "Cistern",
                   "FA-CS": "Combined sewer",
                   "FA-DV": "Diversion",
                   "FA-FON": "Field, Pasture, Orchard, or Nursery",
                   "FA-GC": "Golf course",
                   "FA-HP": "Hydroelectric plant",
                   "FA-LF": "Landfill",
                   "FA-OF": "Outfall",
                   "FA-PV": "Pavement",
                   "FA-QC": "Laboratory or sample-preparation area",
                   "FA-SEW": "Wastewater sewer",
                   "FA-SPS": "Septic system",
                   "FA-STS": "Storm sewer",
                   "FA-TEP": "Thermoelectric plant",
                   "FA-WDS": "Water-distribution system",
                   "FA-WIW": "Waste injection well",
                   "FA-WTP": "Water-supply treatment plant",
                   "FA-WWD": "Wastewater land application",
                   "FA-WWTP": "Wastewater-treatment plant",
                   "FA-WU": "Water-use establishment",
                   "GL": "Glacier",
                   "LA": "Land",
                   "LA-EX": "Excavation",
                   "LA-OU": "Outcrop",
                   "LA-PLY": "Playa",
                   "LA-SH": "Soil hole",
                   "LA-SNK": "Sinkhole",
                   "LA-SR": "Shore",
                   "LA-VOL": "Volcanic vent"}

NAD83_PROJ = Proj(init='epsg:26912')
MERCATOR_PROJ = Proj(init='epsg:4326')

def get_site_feature(station):
    '''
    Transforms station into a geojson.Feature object and returns this object
    :param station: dict - represents a single station generated from the NWIS rdb file.
    :return: geojson.Feature
    '''

    if station['dec_coord_datum_cd'] == 'NAD83':
        try:
            lat = float(station.get('dec_lat_va', ''))
            lon = float(station.get('dec_long_va', ''))
        except ValueError:
            # Need coordinates to create a geojson file
            feature = None
        else:
            x1, y1 = NAD83_PROJ(lon, lat)
            x2, y2 = transform(NAD83_PROJ, MERCATOR_PROJ, x1, y1)

            properties = {
                'stationName': station.get('station_nm', ''),
                'agencyCode': station.get('agency_cd', ''),
                'siteNumber': station.get('site_no', ''),
                'hucCode': station.get('huc_cd', ''),
                'SiteTypeCode': station.get('site_tp_cd', ''),
            }
            properties['SiteType'] = SITE_TYPES_MAPPING.get(properties['SiteTypeCode'], '')
            properties['url'] = NWIS_SITES_INVENTORY_ENDPOINT + \
                                '?agencyCode=' + properties['agencyCode'] + '&site_no=' + properties['siteNumber']

            feature = Feature(geometry=Point((x2, y2)), properties=properties)
    else:
        feature = None

    if (feature == None):
        pass
        #TODO: Add some logging so we know when we get a bad response from NWIS

    return feature


def site_feature_generator(iter_lines):
    '''
    Generator which yields a geosjon Feature object for each line representing a station in rdb_text
    :param iter_lines: Generator which yields a line. The lines are assumed to represent an rdb formatted NWIS site file.
    :yield: geojson Feature object for each station in rdb_text
    '''
    found_header = False
    while not found_header:
        line = iter_lines.next()
        if line[0] != '#':
            headers = line.split('\t')
            try:
                iter_lines.next() #Skip the line after the header
                found_header = True
            except StopIteration:
                return

    for site_line in iter_lines:
        site_values = site_line.split('\t')
        yield get_site_feature(dict(zip(headers, site_values)))


def site_geojson_generator(iter_lines_generator_list):
    '''
    Based on https://blog.al4.co.nz/2016/01/streaming-json-with-flask/ .
    Uses a generator to stream JSON so we don't have to hold everything in memory
    This is a little tricky, as we need to omit the last comma to make valid JSON,
    thus we use a lagging generator, similar to http://stackoverflow.com/questions/1630320/

    :param iter_lines_generator_list: list of generators. Each generator yields a line of rdb formatted NWIS site info
    :yield: A line of a geojson FeatureCollection. The first line will start a FeatureCollection geojson object with the
            crs defined. After than a Feature will be yielded. The last line yielded will be the closing parenthesis
            and bracket for the geojson object
    '''
    yield '{"crs":{"type": "name","properties": {"name": "urn:ogc:def:crs:EPSG::4326"}},' \
          '"type": "FeatureCollection","features": [\n'

    prev_feature = None
    for iter_lines in iter_lines_generator_list:
        for feature in site_feature_generator(iter_lines):
            if prev_feature:
                yield geojson_dumps(prev_feature) + ', \n'
            prev_feature = feature

    # Got all of the features so yield the last one closing the geojson object
    if prev_feature:
        yield geojson_dumps(prev_feature) + ']}'
    else:
        yield ']}'






