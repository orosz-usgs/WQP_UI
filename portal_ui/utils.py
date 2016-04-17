
import feedparser
import requests

from bs4 import BeautifulSoup
from flask import request, make_response
import tablib
import ujson


def pull_feed(feed_url):
    """
    pull page data from a my.usgs.gov confluence wiki feed
    :param feed_url: the url of the feed, created in confluence feed builder
    :return: the html of the page itself, stripped of header and footer
    """
    feed = feedparser.parse(feed_url)

    # Process html to remove unwanted mark-up and fix links
    post = ''
    if len(feed['entries']) > 0:
        soup = BeautifulSoup(feed['entries'][0].summary, 'html.parser')

        # Remove edited by paragraph
        soup.p.extract()

        # Remove final div in the feed
        feed_div = soup.find('div', class_='feed')
        children_divs = feed_div.findAll('div')
        children_divs[len(children_divs) - 1].extract()

        # Translate any in page links to use relative URL
        base = feed['entries'][0].summary_detail.base
        links = feed_div.select('a[href^="' + base + '"]')
        for link in links:
            link['href'] = link['href'].replace(base, '')
        post = unicode(soup)

    return post


def geoserver_proxy_request(target_url):
    """

    :param target_url:
    :return:
    """
    if request.method == 'GET':
        resp = requests.get(target_url + '?' + request.query_string)
        # This fixed an an ERR_INVALID_CHUNKED_ENCODING when the app was run on the deployment server.
        if 'transfer-encoding' in resp.headers:
            del resp.headers['transfer-encoding']
            
    else:
        resp = requests.post(target_url, data=request.data, headers=request.headers)
        if 'content-encoding' in resp.headers: 
            del resp.headers['content-encoding']
        
    return make_response(resp.content, resp.status_code, resp.headers.items())    


def generate_provider_list(endpoint):
    """

    :param endpoint: the base codes endpoint
    :return: a list of provider names
    """
    provider_endpoint = endpoint+'/providers'
    r = requests.get(provider_endpoint, {"mimeType": "json"})
    status_code = r.status_code
    provider_list = None
    if status_code == 200:
        codes = r.json().get('codes')
        provider_list = []
        for code in codes:
            provider_list.append(code['value'])
    return {"status_code": status_code, "providers": provider_list}


def check_org_id(org_id, code_endpoint):
    org_exists = False
    org_endpoint = code_endpoint+'/Organization'
    r = requests.get(org_endpoint, {"mimeType": "json", "text":org_id} )
    status_code = r.status_code
    if status_code == 200:
        codes = r.json().get('codes')
        for code in codes:
            if code['value'] == org_id:
                org_exists = True
    return {"org_exists": org_exists, "status_code": status_code}

def generate_organization_list(endpoint, provider):
    """

    :param endpoint: the base codes endpoint
    :param provider: which provider we are looking for
    :return: a list of dicts of organizations and organization IDs for a specific provider
    """
    provider_endpoint = endpoint+'/organizations'
    r = requests.get(provider_endpoint, {"mimeType": "json"})
    status_code = r.status_code
    organization_list = None
    if status_code == 200:
        organization_list = []
        codes = r.json().get('codes')
        for organization in codes:
            org_dict = {}
            org_providers = organization['providers'].split(' ')
            if provider in org_providers:
                org_dict['id'] = organization['value']
                org_dict['name'] = organization['desc']
            if org_dict:
                organization_list.append(org_dict)
    return {"status_code": status_code, "organizations": organization_list}


def generate_site_list(base_url, provider_id, organization_id):
    """

    :param base_url: the base url we are using for the generating the search URL
    :param organization_id:
    :param provider_id:
    :return: a list of dicts that describe sites that are associated with an organization under a data provider
    """
    search_endpoint = base_url+"Station/search/"
    r = requests.get(search_endpoint, {"organization": organization_id, "providers": provider_id,
                                       "mimeType": "geojson", "sorted": "no", "uripage": "yes"})
    status_code = r.status_code
    if status_code == 200:
        site_geojson_text = r.text
        site_geojson = ujson.loads(site_geojson_text)
        site_list = []
        sites = site_geojson.get('features')
        if sites:
            for site in sites:
                site['id'] = site['properties'].get('MonitoringLocationIdentifier')
                site['name'] = site['properties'].get('MonitoringLocationName')
                site['type'] = site['properties'].get('ResolvedMonitoringLocationTypeName')
                site_list.append(site)
        return {"list": site_list, "geojson": site_geojson, "status_code": status_code}
    else:
        return {"list": None, "geojson": None, "status_code": status_code}


def get_site_info(base_url, provider_id, site_id, organization_id, code_endpoint):
    """

    :param base_url:
    :param provider_id:
    :param site_id:
    :param code_endpoint
    :return:
    """
    search_endpoint = base_url + "Station/search/"
    r = requests.get(search_endpoint, {"providers": provider_id, "siteid": site_id, "mimeType": "csv", "sorted": "no",
                                       "organization": organization_id, "uripage": "yes"})
    status_code = r.status_code
    site_data = None
    if status_code == 200 and r.text:
        site_data_raw = r.content
        data = tablib.Dataset().load(site_data_raw).dict[0]
        if data is not None:
            site_data = dict(data)
            if site_data.get('CountryCode') == 'US' and site_data.get('StateCode') and site_data.get('CountyCode'):
                statecode = 'US:'+site_data['StateCode']
                search_string = statecode+':'+site_data['CountyCode']
                county_request = requests.get(code_endpoint+"/countycode", {"statecode": statecode, "mimeType": "json",
                                                                            "text": search_string})
                if county_request.status_code == 200:
                    county_info = county_request.json()
                    if county_info.get('recordCount') == 1:
                        info_list = county_info['codes'][0]['desc'].split(',')
                        site_data[u'StateName'] = info_list[1]
                        site_data[u'CountyName'] = info_list[2]
    return {"status_code": status_code, "site_data": site_data}
