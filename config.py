
#Config for Flask-Collect
COLLECT_STATIC_ROOT = 'static/'

#Config for Flask-Assets
ASSETS_DEBUG = False #To not compress the js and css set this to True

# Application defined config variables
COVERAGE_MAP_GEOSERVER_ENDPOINT = ''
SITES_MAP_GEOSERVER_ENDPOINT = ''
SLD_ENDPOINT = ''
CODES_ENDPOINT = ''
SEARCH_QUERY_ENDPOINT = ''
PUBLIC_SRSNAMES_ENDPOINT = ''
NWIS_SITES_OGC_ENDPOINT = 'http://cida.usgs.gov/nwc/proxygeoserver/NWC/wms'
NWIS_SITES_LAYER_NAME = 'NWC:gagesII'

GA_TRACKING_CODE = ''

NAWQA_ONLY_PROJECTS = 'National Water Quality Assessment (NAWQA) Program;National Monitoring Network (NMN);National Stream Quality Accounting Network (NASQAN)'