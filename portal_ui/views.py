
from flask import render_template

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