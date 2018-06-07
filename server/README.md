# WQP_UI Flask Server

This project produces server-rendered HTML pages for the Water Quality Portal.

## Install dependencies

1. Create a virtualenv and install the project's Python requirements.

```bash
virtualenv --python=python3.6 env
env/bin/pip install -r requirements.txt
```

2. To override any Flask configuration parameters, modify `instance/config.py`.
These will override any values in the project's `config.py`. There is a sample
available:

```bash
mkdir -p instance
cp config.py.sample instance/config.py
```

## Run a development server

To run the Flask development server at
[http://localhost:5050](http://localhost:5050):

```bash
env/bin/python run.py
```

If you want to run with https (which is needed if authorization is enabled), you will need to create a self-signed
certificate and private key. See https://blog.miguelgrinberg.com/post/running-your-flask-application-over-https for
reference. Run the developement server as follows (

```bash
env/bin/python run.py --certfile path/to/certfile --privatekeyfile part/to/private/key/file
```

## Running tests

The Python tests can be run as follows:

```bash
env/bin/python -m unittest
```

## Installing Redis for local development
Note that Redis does not support Windows, but there is a Windows port (see the link below)). These instructions
are for Linux or MacOS. There is a brew recipe for MacOS which I have not tested

Get the latest stable release from https://redis.io/download. You will install it as follows.

`% tar xzf redis-3.2.8.tar.gz`
`% make` will make in the current directory, or `sudo make install` to but the executable in /usr/local/bin

You can run the redis server by using the redis_server executable in the src directory.
`% src/redis-server`

Test by running `src/redis-cli ping`. The response should be `PONG`.

To use redis in the application set the following in your instance/config.py:
```python
REDIS_CONFIG = {
    'host': 'localhost',
    'port': 6379,
    'db': 0
}
```

## Running Celery worker for local development
You will need to set the following in your instance/config.py to allow Celery to use Redis as the broker and backend.
```python
CELERY_BROKER_URL = 'redis://localhost:6379/10'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/11'
```
The celery worker can be started from the project home directory with the following command:
`% env/bin/celery worker -A wqp:celery --loglevel=info`
