
from flask import Flask, request
from flask.ext.bower import Bower
from celery import Celery

app = Flask(__name__.split()[0], instance_relative_config=True)

Bower(app)

# Loads configuration information from config.py and instance/config.py
app.config.from_object('config')
app.config.from_pyfile('config.py')

import assets
import views

celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)