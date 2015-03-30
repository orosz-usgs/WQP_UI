
import requests

from flask import render_template, request, Response


from . import app

@app.route('/index.jsp')
@app.route('/index/')
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

@app.route('/coverage.jsp')
@app.route('/coverage/')
def coverage():
    return render_template('coverage.html')

@app.route('/geoserver/<op>', methods=['GET', 'POST'])
def geoserverproxy(op):
    target_url = app.config['GEOSERVER_ENDPOINT'] + '/' + op
    if request.method == 'GET':
        resp = requests.get(target_url + '?' + request.query_string)
    else:
        resp = requests.post(target_url, data=request.data, headers=request.headers)  
        del resp.headers['content-encoding']
        
    return Response(resp.content, status=resp.status_code, headers=resp.headers.items())
    
        
    
    