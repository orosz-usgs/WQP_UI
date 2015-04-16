
import requests

from flask import render_template, request, make_response

from . import app
from .utils import pull_feed

@app.route('/index.jsp')
@app.route('/index/')
@app.route('/')
def home():
    return render_template('index.html')
 
@app.route('/contact_us.jsp')
@app.route('/contact_us/')
def contact_us():
    return render_template('contact_us.html')

@app.route('/portal.jsp')
@app.route('/portal/')
def portal():
    return render_template('portal.html')

@app.route('/portal_userguide.jsp')
@app.route('/portal_userguide/')
def portal_userguide():
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&labelString=wqp_user_guide&excludedSpaceKeys%3D&sort=modified&maxResults=1&timeSpan=3650&showContent=true&confirm=Create+RSS+Feed"
    return render_template('portal_userguide.html', feed_content=pull_feed(feed_url))

@app.route('/webservices_documentation.jsp')
@app.route('/webservices_documentation/')
def webservices_documentation():
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&labelString=wqp_web_services_guide&excludedSpaceKeys%3D&sort=modified&maxResults=1&timeSpan=3650&showContent=true&confirm=Create+RSS+Feed"
    return render_template('webservices_documentation.html', feed_content=pull_feed(feed_url))


@app.route('/faqs.jsp')
@app.route('/faqs/')
def faqs():
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&labelString=wqp_faqs&excludedSpaceKeys%3D&sort=modified&maxResults=1&timeSpan=3650&showContent=true&confirm=Create+RSS+Feed"
    return render_template('faqs.html', feed_content=pull_feed(feed_url))


@app.route('/upload_data.jsp')
@app.route('/upload_data/')
def upload_data():
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&labelString=wqp_upload_data&excludedSpaceKeys%3D&sort=modified&maxResults=1&timeSpan=3650&showContent=true&confirm=Create+RSS+Feed"
    return render_template('upload_data.html', feed_content=pull_feed(feed_url))



@app.route('/coverage.jsp')
@app.route('/coverage/')
def coverage():
    return render_template('coverage.html')


@app.route('/wqp_description.jsp')
@app.route('/wqp_description/')
def wqp_description():
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&labelString=wqp_about&excludedSpaceKeys%3D&sort=modified&maxResults=1&timeSpan=3650&showContent=true&confirm=Create+RSS+Feed"
    return render_template('wqp_description.html', feed_content=pull_feed(feed_url))


@app.route('/orgs.jsp')
@app.route('/orgs/')
def orgs():
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&labelString=contributing_orgs&excludedSpaceKeys%3D&sort=modified&maxResults=1&timeSpan=3650&showContent=true&confirm=Create+RSS+Feed"
    return render_template('orgs.html', feed_content=pull_feed(feed_url))


@app.route('/apps_using_portal.jsp')
@app.route('/apps_using_portal/')
def apps_using_portal():
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&labelString=wqp_applications&excludedSpaceKeys%3D&sort=modified&maxResults=10&timeSpan=600&showContent=true&confirm=Create+RSS+Feed"
    return render_template('apps_using_portal.html', feed_content=pull_feed(feed_url))


@app.route('/other_portal_links.jsp')
@app.route('/other_portal_links/')
def other_portal_links():
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&labelString=other_portal_links&excludedSpaceKeys%3D&sort=modified&maxResults=1&timeSpan=3650&showContent=true&confirm=Create+RSS+Feed"
    return render_template('other_portal_links.html', feed_content=pull_feed(feed_url))


@app.route('/public_srsnames.jsp')
@app.route('/public_srsnames/')
def public_srsnames():
    return render_template('public_srsnames.html')
    

@app.route('/geoserver/<op>', methods=['GET', 'POST'])
def geoserverproxy(op):
    target_url = app.config['GEOSERVER_ENDPOINT'] + '/' + op
    app.logger.info('geoserver url goes to ' + target_url + '?' + request.query_string)
    if request.method == 'GET':
        resp = requests.get(target_url + '?' + request.query_string)
        
        # This fixed an an ERR_INVALID_CHUNKED_ENCODING when the app was run on the deployment server.
        del resp.headers['transfer-encoding']
    else:
        resp = requests.post(target_url, data=request.data, headers=request.headers)  
        del resp.headers['content-encoding']
        
    fresp = make_response(resp.content, resp.status_code, resp.headers.items())
    return fresp
   
 
@app.route('/nwis_site_sld/')
def nwis_site_sld():
    resp = app.make_response(render_template('style_sheets/nwis_sites.sld')) 
    resp.headers['Content-Type'] = 'text/xml; charset=utf-8'
    return resp
 
        
    
    