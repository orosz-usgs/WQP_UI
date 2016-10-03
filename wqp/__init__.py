
from celery import Celery
from flask import Flask
from flask_bower import Bower

app = Flask(__name__.split()[0], instance_relative_config=True)

Bower(app)

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
