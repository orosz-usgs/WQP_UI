
from flask import render_template

from . import app

@app.route('/index.jsp')
@app.route('/index/')
def home():
    return render_template('index.html', author='Mary')