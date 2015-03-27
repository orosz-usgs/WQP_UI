
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

@app.route('/geoserver/<op>', methods=['POST'])
def geoserverproxy(op):
    target_url = app.config['GEOSERVER_ENDPOINT'] + '/' + op
    resp = requests.post(target_url, data=request.data, headers=request.headers)
    del resp.headers['content-encoding']
    return (resp.text, resp.status_code, resp.headers.items())
    
        
    
    