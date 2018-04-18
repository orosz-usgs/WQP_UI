import logging
import os
import sys

from celery import Celery
from celery.signals import after_setup_task_logger
from flask import Flask, jsonify, request
from flask_swagger import swagger
from requests import Session

from .flask_swagger_blueprint import get_swaggerui_blueprint


__version__ = '5.7.0dev'


def _create_log_handler(log_directory=None, log_name=__name__):
    """
    Create a handler object. The logs will be streamed
    to stdout if a logfile is not specified using a StreamHandler.
    If a logfile is specified, a handler will be created so logs
    will be written to the file.

    :param str log_directory: optional path of a directory where logs can be written to
    :return: a handler
    :rtype: logging.Handler

    """
    if log_directory is not None:
        log_file = '{}.log'.format(log_name)
        log_path = os.path.join(log_directory, log_file)
        log_handler = logging.FileHandler(log_path)
    else:
        log_handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - {%(pathname)s:L%(lineno)d} - %(message)s')
    log_handler.setFormatter(formatter)
    return log_handler


def _custom_celery_handler(logger=None, *args, **kwargs):
    """
    Function to modify the logger object used by Celery.
    
    This function should be passed to celery's logging
    setup signals.
    
    :param logging.logger logger: Logger object provided by a celery signal

    """
    log_directory = app.config.get('LOGGING_DIRECTORY')
    log_level = app.config.get('LOGGING_LEVEL')
    celery_handler = _create_log_handler(log_directory,
                                         log_name=Celery.__name__.lower()+'_tasks'
                                         )
    logger.setLevel(log_level)
    logger.addHandler(celery_handler)


app = Flask(__name__.split()[0], instance_relative_config=True)

# Loads configuration information from config.py and instance/config.py
app.config.from_object('config')
app.config.from_pyfile('config.py')

celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)


if app.config.get('LOGGING_ENABLED'):
    log_directory = app.config.get('LOGGING_DIRECTORY')
    loglevel = app.config.get('LOGGING_LEVEL')
    handler = _create_log_handler(log_directory)
    # Do not set logging level in the handler.
    # Otherwise, if Flask's DEBUG is set to False,
    # all logging will be disabled.
    # Instead, set the level in the logger object.
    app.logger.setLevel(loglevel)
    app.logger.addHandler(handler)
    # celery uses two loggers: one global/worker logger and a second task logger
    # global/worker logs are handled by the celeryd process running the VM
    # this configures a handler for the task logger:
    after_setup_task_logger.connect(_custom_celery_handler)


@app.before_request
def log_before():
    url = request.path
    method = request.method
    app.logger.debug('Request of type {method} made to {url}'.format(method=method, url=url))


@app.after_request
def log_after(response):
    resp_status = response.status
    resp_headers = response.headers
    app.logger.debug('Response: {0}, {1}'.format(resp_status, resp_headers))
    return response


import wqp.assets

session = Session()
session.verify = app.config.get('VERIFY_CERT', True)

from .portal_ui.views import portal_ui
from .sites.views import sites_blueprint
from .wqx.views import wqx


app.register_blueprint(portal_ui, url_prefix='')
app.register_blueprint(sites_blueprint, url_prefix='/sites')
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
