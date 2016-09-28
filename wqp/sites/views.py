
import requests

from flask import Blueprint, request, make_response

from .. import app
from .huc_utils import is_huc2, is_huc8

REQUIRED_SERVICE_ARGUMENTS = ('sites', 'statecd', 'huc', 'bbox', 'countycd')
US_HUC2s = ('01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
            '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21')
NWIS_SITES_SERVICE_ENDPOINT = app.config['NWIS_SITES_SERVICE_ENDPOINT']


sites = Blueprint('sites', __name__)

@sites.route('/')
def nwis_sites():
    param_keys = request.args.keys()
    response = None
    params = {'format': 'rdb'}
    # If none of the required service arguments are used, we will retrieve the entire
    if not any(k in REQUIRED_SERVICE_ARGUMENTS for k in param_keys):
        response = 'Returning all hucs. Not yet implemented'

    # Check for limits on the number of huc2s and huc8s. If it exceeds NWIS limitation, then
    # multiple service calls will be needed.
    elif 'huc' in param_keys:
        huc_values = request.args['huc'].split(',')
        huc2s = [hucid for hucid in huc_values if is_huc2(hucid)]
        huc8s = [hucid for hucid in huc_values if is_huc8(hucid)]
        if len(huc2s) > 1:
            response = 'More than 1 huc2. Need to make multiple calls'

        elif len(huc8s) > 10:
            response = 'More than 10 huc8s. Need to make multiple calls'

    if response == None:
        params.update(request.args)
        site_resp = requests.get(NWIS_SITES_SERVICE_ENDPOINT,
                                 params=params, headers={'Accept-Encoding': 'gzip,deflate'}, stream=True)
        response = make_response(site_resp.content, site_resp.status_code)

    return response