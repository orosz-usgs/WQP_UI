
from celery import Celery
from flasgger import Swagger
from flask import Flask
from flask_bower import Bower

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
            'route': '/api/'
        }
    ]
}
Swagger(app)

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
