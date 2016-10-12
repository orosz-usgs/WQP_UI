
from celery import Celery
from flask import Flask, jsonify, request
from flask_bower import Bower
from flask_swagger import swagger
from flask_swagger_ui import get_swaggerui_blueprint


app = Flask(__name__.split()[0], instance_relative_config=True)

Bower(app)

app.config['SWAGGER'] = {
    'swagger_version': '2.0',
    'specs': [
        {
            'version' : '1.0',
            'title' : 'NWIS site API',
            'description': 'Streaming NWIS Site service',
            'endpoint' : 'sites',
            'route': '/sites/'
        }
    ],
    'url_prefix' : '/wsgi/wqp_ui'
}

# Loads configuration information from config.py and instance/config.py
app.config.from_object('config')
app.config.from_pyfile('config.py')

import assets

celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)

from portal_ui.views import portal_ui
from sites.views import sites

app.register_blueprint(portal_ui, url_prefix='')
app.register_blueprint(sites,
                       url_prefix='/sites')

# Set up swagger endpoints
@app.route('/spec')
def spec():
    return jsonify(swagger(app,
                           from_file_keyword="swagger_from_file",
                           template={
                               "host": request.url_root,
                               "info": {
                                   "version": "1.0",
                                   "title": "WQP Sites service"
                               }
                           }))

# Create swagger ui blueprint
SWAGGER_URL = '/apidocs'
API_VIEW_FUNC= 'spec'

swaggerui_blueprint = get_swaggerui_blueprint(
    api_view_func=API_VIEW_FUNC
)
app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)


