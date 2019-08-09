'''
Views and a view decorator that implement an Oauth2 client.
'''

from io import BytesIO
import pickle

import arrow
from flask import render_template, request, make_response, redirect, url_for, abort, Response, jsonify, Blueprint, \
    send_file
import redis

from ..auth.views import authentication_required_when_configured

from .. import app, session, csrf
from ..utils import pull_feed, geoserver_proxy_request, retrieve_providers, retrieve_organizations, \
    get_site_key, retrieve_organization, retrieve_sites_geojson, retrieve_site, retrieve_county, \
    generate_redis_db_number, create_request_resp_log_msg, create_redis_log_msg, invalid_usgs_view
from ..tasks import load_sites_into_cache_async


# Create blueprint
portal_ui = Blueprint('portal_ui', __name__,
                      template_folder='templates',
                      static_folder='static',
                      static_url_path='/portal_ui/static')

# set some useful local variables from the global config variables
redis_config = app.config['REDIS_CONFIG']
cache_timeout = app.config['CACHE_TIMEOUT']
proxy_cert_verification = app.config.get('PROXY_CERT_VERIFY', False)


@portal_ui.route('/index.jsp')
@portal_ui.route('/index/')
@portal_ui.route('/', endpoint='home-canonical')
@invalid_usgs_view
def home():
    if request.path == '/index.jsp' or request.path == '/index/':
        return redirect(url_for('portal_ui.home-canonical')), 301
    return render_template('index.html')


@portal_ui.route('/contact_us.jsp')
@portal_ui.route('/contact_us/', endpoint='contact_us-canonical')
@invalid_usgs_view
def contact_us():
    if request.path == '/contact_us.jsp':
        return redirect(url_for('portal_ui.contact_us-canonical')), 301
    return render_template('contact_us.html')


@portal_ui.route('/portal.jsp')
@portal_ui.route('/portal/', endpoint='portal-canonical')
@authentication_required_when_configured
def portal():
    if request.path == '/portal.jsp':
        return redirect(url_for('portal_ui.portal-canonical')), 301
    return render_template('portal.html')


@portal_ui.route('/portal_userguide.jsp')
@portal_ui.route('/portal_userguide/', endpoint='portal_userguide-canonical')
@authentication_required_when_configured
def portal_userguide():
    if request.path == '/portal_userguide.jsp':
        return redirect(url_for('portal_ui.portal_userguide-canonical')), 301
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&" \
               "labelString=wqp_user_guide&excludedSpaceKeys%3D&sort=modified&maxResults=1&timeSpan=3650&" \
               "showContent=true&confirm=Create+RSS+Feed"
    return render_template('portal_userguide.html', feed_content=pull_feed(feed_url))


@portal_ui.route('/webservices_documentation.jsp')
@portal_ui.route('/webservices_documentation/', endpoint='webservices_documentation-canonical')
@invalid_usgs_view
def webservices_documentation():
    if request.path == '/webservices_documentation.jsp':
        return redirect(url_for('portal_ui.webservices_documentation-canonical')), 301
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&" \
               "labelString=wqp_web_services_guide&excludedSpaceKeys%3D&sort=modified&maxResults=1&timeSpan=3650&" \
               "showContent=true&confirm=Create+RSS+Feed"
    return render_template('webservices_documentation.html', feed_content=pull_feed(feed_url))


@portal_ui.route('/faqs.jsp')
@portal_ui.route('/faqs/', endpoint='faqs-canonical')
@invalid_usgs_view
def faqs():
    if request.path == '/faqs.jsp':
        return redirect(url_for('portal_ui.faqs-canonical')), 301
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&" \
               "labelString=wqp_faqs&excludedSpaceKeys%3D&sort=modified&maxResults=1&timeSpan=3650&showContent=true&" \
               "confirm=Create+RSS+Feed"
    return render_template('faqs.html', feed_content=pull_feed(feed_url))


@portal_ui.route('/upload_data.jsp')
@portal_ui.route('/upload_data/', endpoint='upload_data-canonical')
@invalid_usgs_view
def upload_data():
    if request.path == '/upload_data.jsp':
        return redirect(url_for('portal_ui.upload_data-canonical')), 301
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&" \
               "labelString=wqp_upload_data&excludedSpaceKeys%3D&sort=modified&maxResults=1&timeSpan=3650&" \
               "showContent=true&confirm=Create+RSS+Feed"
    return render_template('upload_data.html', feed_content=pull_feed(feed_url))


@portal_ui.route('/coverage.jsp')
@portal_ui.route('/coverage/', endpoint='coverage-canonical')
@invalid_usgs_view
def coverage():
    if request.path == '/coverage.jsp':
        return redirect(url_for('portal_ui.coverage-canonical')), 301
    return render_template('coverage.html')


@portal_ui.route('/wqp_description.jsp')
@portal_ui.route('/wqp_description/', endpoint='wqp_description-canonical')
@invalid_usgs_view
def wqp_description():
    if request.path == '/wqp_description.jsp':
        return redirect(url_for('portal_ui.wqp_description-canonical')), 301
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&" \
               "labelString=wqp_about&excludedSpaceKeys%3D&sort=modified&maxResults=1&timeSpan=3650&showContent=true&" \
               "confirm=Create+RSS+Feed"
    return render_template('wqp_description.html', feed_content=pull_feed(feed_url))


@portal_ui.route('/orgs.jsp')
@portal_ui.route('/orgs/', endpoint='orgs-canonical')
@invalid_usgs_view
def orgs():
    if request.path == '/orgs.jsp':
        return redirect(url_for('portal_ui.orgs-canonical')), 301
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&" \
               "labelString=contributing_orgs&excludedSpaceKeys%3D&sort=modified&maxResults=1&timeSpan=3650&" \
               "showContent=true&confirm=Create+RSS+Feed"
    return render_template('orgs.html', feed_content=pull_feed(feed_url))


@portal_ui.route('/apps_using_portal.jsp')
@portal_ui.route('/apps_using_portal/', endpoint='apps_using_portal-canonical')
@invalid_usgs_view
def apps_using_portal():
    if request.path == '/apps_using_portal.jsp':
        return redirect(url_for('portal_ui.apps_using_portal-canonical')), 301
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&" \
               "labelString=wqp_applications&excludedSpaceKeys%3D&sort=modified&maxResults=10&timeSpan=600&" \
               "showContent=true&confirm=Create+RSS+Feed"
    return render_template('apps_using_portal.html', feed_content=pull_feed(feed_url))


@portal_ui.route('/other_portal_links.jsp')
@portal_ui.route('/other_portal_links/', endpoint='other_portal_links-canonical')
@invalid_usgs_view
def other_portal_links():
    if request.path == '/other_portal_links.jsp':
        return redirect(url_for('portal_ui.other_portal_links-canonical')), 301
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&" \
               "labelString=other_portal_links&excludedSpaceKeys%3D&sort=modified&maxResults=1&timeSpan=3650&" \
               "showContent=true&confirm=Create+RSS+Feed"
    return render_template('other_portal_links.html', feed_content=pull_feed(feed_url))


@portal_ui.route('/public_srsnames.jsp')
@portal_ui.route('/public_srsnames/', endpoint='public_srsnames-canonical')
@authentication_required_when_configured
def public_srsnames():
    if request.path == '/public_srsnames.jsp':
        return redirect(url_for('portal_ui.public_srsnames-canonical')), 301

    resp = session.get(app.config['PUBLIC_SRSNAMES_ENDPOINT'] + '?mimeType=json')
    msg = create_request_resp_log_msg(resp)
    app.logger.info(msg)

    return render_template('public_srsnames.html', status_code=resp.status_code, content=resp.json())


# Exempting this from CSRF because it is intended for use with WQP internal.
# We may want to revisit if/when internal is resurrected
@csrf.exempt
@portal_ui.route('/wqp_download/<op>', methods=['POST'])
def wqp_download_proxy(op):
    '''
    Proxies the download request and adds the authorization header if an access_token is present.
    :param String op: The kind of download to request
    :return Response:
    '''
    target_url = app.config['SEARCH_QUERY_ENDPOINT'] + op + '/search'
    headers = {}
    access_token = request.cookies.get('access_token')
    if access_token:
        headers['Authorization'] = 'Bearer {0}'.format(access_token)
    resp = session.post(target_url, data=request.form, headers=headers, verify=proxy_cert_verification)
    if resp.status_code == 200:  # pylint: disable=R1705

        try:
            filename = resp.headers['Content-Disposition'].split('filename=')[1]
        except (IndexError, KeyError):
            filename = 'default_file'

        return send_file(BytesIO(resp.content),
                         mimetype=resp.headers['Content-Type'],
                         as_attachment=True,
                         attachment_filename=filename)
    else:
        return make_response(resp.content, resp.status_code, resp.headers.items())

@portal_ui.route('/wqp_geoserver/<op>', methods=['GET', 'POST'])
def wqp_geoserverproxy(op):
    target_url = app.config['WQP_MAP_GEOSERVER_ENDPOINT'] + '/' + op
    return geoserver_proxy_request(target_url, proxy_cert_verification)


@portal_ui.route('/sites_geoserver/<op>', methods=['GET', 'POST'])
def sites_geoserverproxy(op):
    target_url = app.config['SITES_MAP_GEOSERVER_ENDPOINT'] + '/' + op
    return geoserver_proxy_request(target_url, proxy_cert_verification)


@portal_ui.route('/crossdomain.xml')
@authentication_required_when_configured
def crossdomain():
    xml = render_template('crossdomain.xml')
    response = make_response(xml)
    response.headers["Content-Type"] = "application/xml"
    return response


@portal_ui.route('/kml/wqp_styles.kml')
@authentication_required_when_configured
def kml():
    xml = render_template('wqp_styles.kml')
    response = make_response(xml)
    response.headers["Content-Type"] = "application/vnd.google-earth.kml+xml"
    return response


@portal_ui.route('/img/<image_file>')
def images(image_file):
    return app.send_static_file('img/'+image_file)


@portal_ui.route('/provider/', endpoint='uri_base')
@invalid_usgs_view
def uri_base():
    providers = retrieve_providers()
    if not providers:
        abort(500)
    return render_template('provider_base.html', providers=sorted(providers))


@portal_ui.route('/provider/<provider_id>/', endpoint='uri_provider')
@invalid_usgs_view
def uri_provider(provider_id):
    organizations = retrieve_organizations(provider_id)
    if organizations is None:
        abort(500)
    elif not organizations:
        abort(404)
    return render_template('provider_page.html', provider=provider_id, organizations=organizations)


@portal_ui.route('/provider/<provider_id>/<organization_id>/', endpoint='uri_organization')
@invalid_usgs_view
def uri_organization(provider_id, organization_id):
    #Check for the information in redis first
    rendered_template = None
    if redis_config:
        redis_db_number = generate_redis_db_number(provider_id)
        redis_key = 'all_sites_' + provider_id + '_' + organization_id
        msg = create_redis_log_msg(redis_config['host'], redis_config['port'], redis_db_number)
        app.logger.debug(msg)
        redis_session = redis.StrictRedis(host=redis_config['host'], port=redis_config['port'],
                                          db=redis_db_number, password=redis_config.get('password'))
        redis_org_data = redis_session.get(redis_key)
        if redis_org_data:
            rendered_template = pickle.loads(redis_org_data)

    if rendered_template is None:
        # Check to see  if the organization_id/provider_id exists before making a search query
        organization = retrieve_organization(provider_id, organization_id)
        if organization is None:
            abort(500)
        elif not organization:
            abort(404)

        sites = retrieve_sites_geojson(provider_id, organization_id)
        if sites is None:
            abort(500)
        else:
            rendered_site_template = render_template('sites.html',
                                                     provider=provider_id,
                                                     organization=organization_id,
                                                     sites_geojson=sites,
                                                     total_site_count=len(sites['features']))

        if redis_config:
            redis_session.set(redis_key, pickle.dumps(rendered_template, protocol=2))

    return Response(rendered_site_template)


@portal_ui.route('/provider/<provider_id>/<organization_id>/<path:site_id>/', endpoint='uri_site')
@invalid_usgs_view
def uris(provider_id, organization_id, site_id):
    site_data = None
    if redis_config:
        redis_db_number = generate_redis_db_number(provider_id)
        redis_key = get_site_key(provider_id, organization_id, site_id)
        msg = create_redis_log_msg(redis_config['host'], redis_config['port'], redis_db_number)
        app.logger.debug(msg)
        redis_session = redis.StrictRedis(host=redis_config['host'],
                                          port=redis_config['port'],
                                          db=redis_db_number,
                                          password=redis_config.get('password'))
        redis_data = redis_session.get(redis_key)
        if redis_data:
            site_data = pickle.loads(redis_data)

    if site_data is None:
        site_data = retrieve_site(provider_id, organization_id, site_id)
        if site_data is None:
            abort(500)
        elif site_data:
            if redis_config:
                redis_session.set(redis_key, pickle.dumps(site_data, protocol=2))
        else:
            abort(404)

    additional_data = {}
    country = site_data.get('CountryCode')
    state = site_data.get('StateCode')
    county = site_data.get('CountyCode')

    if country == 'US' and state and county:
        county_data = retrieve_county(country, state, county)
        if county_data:
            additional_data = county_data

    if provider_id == 'NWIS':
        org_and_number = site_data['MonitoringLocationIdentifier'].split('-')
        additional_data['NWISOrg'] = org_and_number[0]
        additional_data['NWISNumber'] = org_and_number[1]

    if 'mimetype' in request.args and request.args.get('mimetype') == 'json':
        return jsonify(site_data)

    return render_template('site.html',
                           site=site_data,
                           site_data_additional=additional_data,
                           provider=provider_id,
                           organization=organization_id,
                           site_id=site_id,
                           cache_timeout=cache_timeout)  # Why are we using this here and nowhere else


@portal_ui.route('/clear_cache/<provider_id>/')
@authentication_required_when_configured
def clear_cache(provider_id=None):
    if redis_config:
        redis_db_number = generate_redis_db_number(provider_id)
        connect_msg = create_redis_log_msg(redis_config['host'], redis_config['port'], redis_db_number)
        r = redis.StrictRedis(host=redis_config['host'], port=redis_config['port'], db=redis_db_number,
                              password=redis_config.get('password'))
        r.flushdb()
        msg = 'site cache cleared for: ' + provider_id
    else:
        connect_msg = 'No redis cache to connect to.'
        msg = "no redis cache, no cache to clear"
    app.logger.debug(connect_msg)
    return msg


@portal_ui.route('/sites_cache_task/<provider_id>', methods=['POST'])
@authentication_required_when_configured
def sitescachetask(provider_id):
    providers = retrieve_providers()
    if provider_id not in providers:
        abort(404)
    task = load_sites_into_cache_async.apply_async(args=[provider_id])
    response_content = {'Location': '/'.join([app.config['LOCAL_BASE_URL'], "status", task.id])}
    # passing the content after the response code sets a custom header, which the task status javascript needs
    return jsonify(response_content), 202, response_content


@portal_ui.route('/status/<task_id>')
@authentication_required_when_configured
def taskstatus(task_id):
    task = load_sites_into_cache_async.AsyncResult(task_id)
    if task.state == 'PENDING':
        response = {
            'state': task.state,
            'current': 0,
            'total': 1,
            'status': 'Pending...'
        }
    elif task.state != 'FAILURE':
        response = {
            'state': task.state,
            'current': task.info.get('current', 0),
            'total': task.info.get('total', 1),
            'status': task.info.get('status', '')
        }
        if 'result' in task.info:
            response['result'] = task.info['result']
    else:
        # something went wrong in the background job
        response = {
            'state': task.state,
            'current': 1,
            'total': 1,
            'status': str(task.info),  # this is the exception raised
        }
    return jsonify(response)


@portal_ui.route('/manage_cache')
@authentication_required_when_configured
def manage_cache():
    provider_list = ['NWIS', 'STORET', 'STEWARDS', 'BIODATA']
    status_list = []
    if redis_config:
        for provider in provider_list:
            redis_db_number = generate_redis_db_number(provider)
            msg = create_redis_log_msg(redis_config['host'], redis_config['port'], redis_db_number)
            app.logger.debug(msg)
            r = redis.StrictRedis(host=redis_config['host'], port=redis_config['port'], db=redis_db_number,
                                  password=redis_config.get('password'))
            provider_site_load_status = r.get('{0}_sites_load_status'.format(provider))
            if provider_site_load_status:
                load_status = pickle.loads(provider_site_load_status, encoding='bytes')
                app.logger.debug('load_status: %s', str(load_status))
                time = arrow.get(load_status['time_utc'])
                load_status['time_zulu'] = time.format('YYYY-MM-DD HH:mm:ss ZZ')
                load_status['time_human'] = time.humanize()
                status_list.append(load_status)
    return render_template('cache_manager.html', status=status_list)


@portal_ui.route('/robots.txt')
def robots():
    return render_template('robots.txt')
