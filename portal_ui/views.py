
import requests

from flask import render_template, request, make_response, redirect, url_for, send_file

from . import app
from .utils import pull_feed, geoserver_proxy_request

@app.route('/index.jsp')
@app.route('/index/')
@app.route('/', endpoint='home-canonical')
def home():
    if request.path == '/index.jsp' or request.path == '/index/':
        return redirect(url_for('home-canonical')), 301
    return render_template('index.html')
 
@app.route('/contact_us.jsp')
@app.route('/contact_us/', endpoint='contact-canonical')
def contact_us():
    if request.path == '/contact_us.jsp':
        return redirect(url_for('contact-canonical')), 301
    return render_template('contact_us.html')

@app.route('/portal.jsp')
@app.route('/portal/', endpoint='portal-canonical')
def portal():
    if request.path == '/portal.jsp':
        return redirect(url_for('portal-canonical')), 301
    return render_template('portal.html')

@app.route('/portal_userguide.jsp')
@app.route('/portal_userguide/', endpoint='portal_userguide-canonical')
def portal_userguide():
    if request.path == '/portal_userguide.jsp':
        return redirect(url_for('portal_userguide-canonical')), 301
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&labelString=wqp_user_guide&excludedSpaceKeys%3D&sort=modified&maxResults=1&timeSpan=3650&showContent=true&confirm=Create+RSS+Feed"
    return render_template('portal_userguide.html', feed_content=pull_feed(feed_url))

@app.route('/webservices_documentation.jsp')
@app.route('/webservices_documentation/', endpoint= 'webservices_documentation-canonical')
def webservices_documentation():
    if request.path == '/webservices_documentation.jsp':
        return redirect(url_for('webservices_documentation-canonical')), 301
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&labelString=wqp_web_services_guide&excludedSpaceKeys%3D&sort=modified&maxResults=1&timeSpan=3650&showContent=true&confirm=Create+RSS+Feed"
    return render_template('webservices_documentation.html', feed_content=pull_feed(feed_url))


@app.route('/faqs.jsp')
@app.route('/faqs/', endpoint='faqs-canonical')
def faqs():
    if request.path == '/faqs.jsp':
        return redirect(url_for('faqs-canonical')), 301
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&labelString=wqp_faqs&excludedSpaceKeys%3D&sort=modified&maxResults=1&timeSpan=3650&showContent=true&confirm=Create+RSS+Feed"
    return render_template('faqs.html', feed_content=pull_feed(feed_url))


@app.route('/upload_data.jsp')
@app.route('/upload_data/', endpoint='upload_data-canonical')
def upload_data():
    if request.path == '/upload_data.jsp':
        return redirect(url_for('upload_data-canonical')), 301
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&labelString=wqp_upload_data&excludedSpaceKeys%3D&sort=modified&maxResults=1&timeSpan=3650&showContent=true&confirm=Create+RSS+Feed"
    return render_template('upload_data.html', feed_content=pull_feed(feed_url))



@app.route('/coverage.jsp')
@app.route('/coverage/', endpoint='coverage-canonical')
def coverage():
    if request.path == '/coverage.jsp':
        return redirect(url_for('coverage-canonical')), 301
    return render_template('coverage.html')


@app.route('/wqp_description.jsp')
@app.route('/wqp_description/', endpoint='wqp_description-canonical')
def wqp_description():
    if request.path == '/wqp_description.jsp':
        return redirect(url_for('wqp_description-canonical')), 301
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&labelString=wqp_about&excludedSpaceKeys%3D&sort=modified&maxResults=1&timeSpan=3650&showContent=true&confirm=Create+RSS+Feed"
    return render_template('wqp_description.html', feed_content=pull_feed(feed_url))


@app.route('/orgs.jsp')
@app.route('/orgs/', endpoint='orgs-canonical')
def orgs():
    if request.path == '/orgs.jsp':
        return redirect(url_for('orgs-canonical')), 301
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&labelString=contributing_orgs&excludedSpaceKeys%3D&sort=modified&maxResults=1&timeSpan=3650&showContent=true&confirm=Create+RSS+Feed"
    return render_template('orgs.html', feed_content=pull_feed(feed_url))


@app.route('/apps_using_portal.jsp')
@app.route('/apps_using_portal/', endpoint='apps_using_portal-canonical')
def apps_using_portal():
    if request.path == '/apps_using_portal.jsp':
        return redirect(url_for('apps_using_portal-canonical')), 301
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&labelString=wqp_applications&excludedSpaceKeys%3D&sort=modified&maxResults=10&timeSpan=600&showContent=true&confirm=Create+RSS+Feed"
    return render_template('apps_using_portal.html', feed_content=pull_feed(feed_url))


@app.route('/other_portal_links.jsp')
@app.route('/other_portal_links/', endpoint='other_portal_links-canonical')
def other_portal_links():
    if request.path == '/other_portal_links.jsp':
        return redirect(url_for('other_portal_links-canonical')), 301
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&labelString=other_portal_links&excludedSpaceKeys%3D&sort=modified&maxResults=1&timeSpan=3650&showContent=true&confirm=Create+RSS+Feed"
    return render_template('other_portal_links.html', feed_content=pull_feed(feed_url))


@app.route('/public_srsnames.jsp')
@app.route('/public_srsnames/', endpoint='public_srsnames-canonical')
def public_srsnames():
    if request.path == '/public_srsnames.jsp':
        return redirect(url_for('public_srsnames-canonical')), 301
    return render_template('public_srsnames.html')
    

@app.route('/coverage_geoserver/<op>', methods=['GET', 'POST'])
def coverage_geoserverproxy(op):
    target_url = app.config['COVERAGE_MAP_GEOSERVER_ENDPOINT'] + '/' + op
    return geoserver_proxy_request(target_url);
    

@app.route('/sites_geoserver/<op>', methods=['GET', 'POST'])
def sites_geoserverproxy(op):
    target_url = app.config['SITES_MAP_GEOSERVER_ENDPOINT'] + '/' + op
    return geoserver_proxy_request(target_url);
   
 
@app.route('/nwis_site_sld/')
def nwis_site_sld():
    resp = app.make_response(render_template('style_sheets/nwis_sites.sld')) 
    resp.headers['Content-Type'] = 'text/xml; charset=utf-8'
    return resp
 

@app.route('/crossdomain.xml')
def crossdomain():
    xml = render_template('crossdomain.xml')
    response = make_response(xml)
    response.headers["Content-Type"] = "application/xml"  
    return response   
    

@app.route('/kml/wqp_styles.kml')
def kml():
    xml = render_template('wqp_styles.kml')
    response = make_response(xml)
    response.headers["Content-Type"] = "application/vnd.google-earth.kml+xml"
    return response


@app.route('/img/<image_file>')
def images(image_file):
    return app.send_static_file('img/'+image_file)

