
from geojson import Feature, Point
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


