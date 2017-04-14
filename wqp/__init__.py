import logging
import sys
import time

from celery import Celery
from flask import Flask, jsonify, request
from flask_bower import Bower
from flask_swagger import swagger
from flask_swagger_ui import get_swaggerui_blueprint
from requests import Session

__version__ = '4.13.0dev'


def create_log_handler(loglevel, logfile=None):
    """
    Create a logger object. The logs will be streamed
    to stdout if a logfile is not specifed. If a logfile
    is specified, logs will be written to the file.

    :param str logger_name: name of the logger
    :param str logfile: optional name of a file where logs can be written to
    :return: a logger
    :rtype: logging.Logger

    """
    if logfile is not None:
        handler = logging.TimedRotatingFileHandler(logfile, when='midnight', backupCount=10)
    else:
        handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter('%(asctime)s - {%(pathname)s:L%(lineno)d} - %(levelname)s - %(message)s')
    handler.setLevel(loglevel)
    handler.setFormatter(formatter)
    return handler


app = Flask(__name__.split()[0], instance_relative_config=True)

Bower(app)

# Loads configuration information from config.py and instance/config.py
app.config.from_object('config')
app.config.from_pyfile('config.py')

if app.config.get('LOGGING_ON'):
    logfile = app.config.get('LOGGING_LOCATION')
    loglevel = app.config.get('LOG_LEVEL')
    handler = create_log_handler(loglevel, logfile)
    app.logger.disabled = False
    app.logger.addHandler(handler)
else:
    app.logger.disabled = True

import assets

celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)


session = Session()
session.verify = app.config.get('VERIFY_CERT', True)

from portal_ui.views import portal_ui
from sites.views import sites
from wqx.views import wqx


app.register_blueprint(portal_ui, url_prefix='')
app.register_blueprint(sites,
                       url_prefix='/sites')
app.register_blueprint(wqx, url_prefix='/portal/schemas')

# Set up swagger endpoints
@app.route('/spec')
def spec():
    host = request.url_root.rstrip('/').replace(app.config['WSGI_STR'], '')
    return jsonify(swagger(app,
                           from_file_keyword="swagger_from_file",
                           template={
                               "host": host.replace('http://', ''),
                               "info": {
                                   "version": "1.0",
                                   "title": "WQP Sites service"
                               }
                           }))

# Create swagger ui blueprint
SWAGGER_URL = '/apidocs'
API_VIEW_FUNC = 'spec'

swaggerui_blueprint = get_swaggerui_blueprint(
    api_view_func=API_VIEW_FUNC
)
app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)
