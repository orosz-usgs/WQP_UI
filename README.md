# WQP_UI
Water Quality Portal User Interface

To run this application locally, you will need to do the following:

1. Create a virtualenv using python 2.7 and install the requirements in requirements.txt. This can be done as follows while in the project directory:
  1. Run `virtualenv --python=python2.7 env`
  2. Activate your virtualenv (depends on whether linux or windows)
  3. Run `pip install -r requirements.txt`
2. Change to the `instance` directory and create config.py. It should contain the following:
```python
DEBUG = True

# Do not use the same key as any of the deployment servers
SECRET_KEY = 'local_secret_key'

# points to the geoserver endpoint you want to use. 
GEOSERVER_ENDPOINT = ''

#points to the sld endpoint you want to use.
SLD_ENDPOINT = ''
``

Now you can run the application within the virtualenv by executing:
`python run.py`

The application can be accessed at 127.0.0.1:5050/index.