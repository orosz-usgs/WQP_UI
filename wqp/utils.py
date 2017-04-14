
from bs4 import BeautifulSoup
import feedparser


from flask import request, make_response

from . import app, create_request_resp_log_msg, session


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


def geoserver_proxy_request(target_url, cert_verification):
    """

    :param target_url:
    :param cert_verification:
    :return:
    """
    if request.method == 'GET':
        resp = session.get(target_url + '?' + request.query_string, verify=cert_verification)
        resp_msg = create_request_resp_log_msg(resp)
        app.logger.info(resp_msg)
        # This fixed an an ERR_INVALID_CHUNKED_ENCODING when the app was run on the deployment server.
        if 'transfer-encoding' in resp.headers:
            del resp.headers['transfer-encoding']
        # This fixed an net::ERR_CONTENT_DECODING_FAILED
        if 'content-encoding' in resp.headers:
            del resp.headers['content-encoding']
            
    else:
        resp = session.post(target_url, data=request.data, headers=request.headers, verify=cert_verification)
        resp_msg = create_request_resp_log_msg(resp)
        app.logger.info(resp_msg)
        if 'content-encoding' in resp.headers: 
            del resp.headers['content-encoding']
        
    return make_response(resp.content, resp.status_code, resp.headers.items())


def retrieve_lookups(code_uri, params={}):
    """

    :param code_uri: string - The part of the url that identifies what kind of information to lookup. Should start with a slash
    :param params: dict - Any query parameters other than the mimeType that should be sent with the lookup
    :return: list of dictionaries representing the json object returned by the code lookup. Return None if
        the information can not be retrieved
    """
    local_params = dict(params)
    local_params['mimeType'] = 'json'
    resp = session.get(app.config['CODES_ENDPOINT'] + code_uri, params=local_params)
    if resp.status_code == 200:
        lookups = resp.json()
    else:
        msg = create_request_resp_log_msg(resp)
        app.logger.warning(msg)
        lookups = None
    return lookups


def retrieve_providers():
    """

    :return: list of strings - one string for each provider. Return None if the information can't be retrieved
    """
    provider_lookups = retrieve_lookups('/providers')
    if provider_lookups:
        try:
            providers = [code['value'] for code in provider_lookups.get('codes')]
        except TypeError as e:
            app.logger.warning(repr(e))
            providers = None
    else:
        providers = None
    return providers


def retrieve_organization(provider, org_id):
    """

    :param org_id: string identifying a WQP organization value
    :return: dictionary containing id and name properties if such an org exists, an empty
        dictionary if no such org exists or None if no information can be retrieved.
    """
    organization_lookups = retrieve_lookups('/organizations', {'text': org_id})
    if organization_lookups:
        try:
            org_codes = organization_lookups.get('codes')
            # org_id must be exact match to value and provider must be in the provider value
            provider_org_codes = [org_code for org_code in org_codes if provider in org_code.get('providers', '').split(' ')]
            organization = {}
            for code in provider_org_codes:
                if code.get('value', '') == org_id:
                    organization = {'id' : org_id, 'name': code.get('desc', '')}
                    break
        except TypeError as e:
            app.logger.warning(repr(e))
            organization = None
    else:
        organization = None
    return organization


def retrieve_organizations(provider):
    """

    :param provider: string - retrieve organizations belonging to provider
    :return: list of dictionaries or None. Each dictionary contains id and name keys representing an organization.
        None is returned if no information can be retrieved.
    """

    organization_lookups = retrieve_lookups('/organizations')
    if organization_lookups:
        try:
            org_codes = organization_lookups.get('codes')
            provider_org_codes = [org_code for org_code in org_codes if provider in org_code.get('providers', '').split(' ')]
            organizations = [{'id': org_code.get('value', ''), 'name' : org_code.get('desc', '')} for org_code in provider_org_codes]
        except TypeError:
            organizations = None

    else:
        organizations = None
    return organizations


def retrieve_county(country, state, county):
    """

    :param country: string - two letter country abbreviation
    :param state string - states fips code
    :param county: - county fips code

    :return: dictionary - with StateName and CountyName properties, an empty dictionary if no county exists or
        None if no information can be retrieved
    """
    statecode = country + ':' + state
    countycode = statecode + ':' + county
    county_lookups = retrieve_lookups('/countycode', {'statecode': statecode, 'text': countycode})

    if county_lookups and county_lookups.has_key('recordCount'):
        if county_lookups.get('recordCount') == 1 and county_lookups.has_key('codes'):
            country_state_county = county_lookups.get('codes', [{}])[0].get('desc', '').split(',')
            if (len(country_state_county) > 2):
                county_data = {'StateName': country_state_county[1], 'CountyName': country_state_county[2]}
            else:
                county_data = {}
        else:
            county_data = {}
    else:
        county_data = None

    return county_data


def retrieve_sites_geojson(provider, org_id):
    """

    :param provider: string
    :param org_id: string
    :return: python object representing the geojson object containing the sites which are in the provider and org_id.
        Return an empty object if the org_id does not exist in provider.
        Return None if the information can not be retrieved.
    """
    resp = session.get(app.config['SEARCH_QUERY_ENDPOINT'] + 'Station/search',
                       params={'organization': org_id,
                               'providers': provider,
                               'mimeType': 'geojson',
                               'sorted': 'no',
                               'uripage': 'yes'} # This is added to distinguish from normal web service queries
                       )
    if resp.status_code == 200:
        sites = resp.json()
    elif resp.status_code == 400:
        sites = {}
    else:
        msg = create_request_resp_log_msg(resp)
        app.logger.warning(msg)
        sites = None
    return sites


def retrieve_site(provider_id, organization_id, site_id):
    """

    :param provider_id: string
    :param organization_id: string
    :param site_id: string
    :return: dictionary representing the requested site, empty dictionary if no site exists, or None if the site data can not be returned.
    """

    resp = session.get(app.config['SEARCH_QUERY_ENDPOINT'] + 'Station/search',
                       params={'organization': organization_id,
                               'providers' : provider_id,
                               'siteid': site_id,
                               'mimeType' : 'tsv',
                               'sorted': 'no',
                               'uripage': 'yes'} # This is added to distinguish from normal web service queries
                       )
    if resp.status_code == 200 and resp.text:
        resp_lines = resp.text.split('\n')
        if (len(resp_lines) > 1):
            headers = resp_lines[0].split('\t')
            site = dict(zip(headers, resp_lines[1].split('\t')))

        else:
            site = {}

    elif resp.status_code == 400:
        site = {}

    else:
        msg = create_request_resp_log_msg(resp)
        app.logger.warning(msg)
        site = None
    return site



def generate_redis_db_number(provider):
    """

    :param provider: a WQP data provider
    :return: a database number to assign for redis to allow for cache clearing
    """
    # set a default
    redis_db_number = 0
    if provider == 'NWIS':
        redis_db_number = 1
    elif provider == 'STORET':
        redis_db_number = 2
    elif provider == 'STEWARDS':
        redis_db_number = 3
    elif provider == 'BIODATA':
        redis_db_number = 4
    return redis_db_number


def tsv_dict_generator(tsv_iter_lines):
    """

    :param tsv_iter_lines: Generator which yields a line for each data line in a tsv.
    :yield: list of dictionaries. If a line's column count does not match the header, an empty dictionary is
        returned. Otherwise the dictionary representing the line is returned using the headers as keys
    """

    header_line = tsv_iter_lines.next()
    headers = header_line.split('\t')
    column_count = len(headers)

    for line in tsv_iter_lines:
        data_row = line.split('\t')
        if len(data_row) == column_count:
            data = dict(zip(headers, data_row))
        else:
            data = {}
        yield data


def get_site_key(provider_id, organization_id, site_id):
    """

    :param site: dictionary representing a WQP site.
    :return: String - Key that can be used to uniquely identify a site
    """

    return '_'.join(['sites', provider_id, organization_id, site_id])



