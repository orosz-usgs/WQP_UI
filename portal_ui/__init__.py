
import logging

from flask import Flask, request

app = Flask(__name__.split()[0], instance_relative_config=True)

# Loads configuration information from config.py and instance/config.py
app.config.from_object('config')
app.config.from_pyfile('config.py')

FORMAT = '%(asctime)s %(message)s'
fmt = logging.Formatter(FORMAT)
handler = logging.FileHandler('wqp_ui.log')
handler.setLevel(logging.INFO)
handler.setFormatter(fmt)

app.logger.addHandler(handler)

@app.before_request
def log_request():
        request_str = str(request)
        request_headers = str(request.headers)
        log_str = 'Request: ({0}); Headers: ({1})'.format(request_str, request_headers)
        app.logger.info(log_str)




import assets
import views
