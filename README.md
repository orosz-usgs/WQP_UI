# WQP_UI
Water Quality Portal User Interface

To run this application locally, you will need to do the following:

1. Install node.js and lessc on your desktop. You can install lessc by executing `npm install -g less`. 
2. Create a virtualenv using python 2.7 and install the requirements in requirements.txt. This can be done as follows while in the project directory:
  1. Run `virtualenv --python=python2.7 env`
  2. Activate your virtualenv (depends on whether linux or windows)
  3. Run `pip install -r requirements.txt`
3. Change to the `instance` directory and create config.py. It should contain the following:
	```python
	DEBUG = True
	
	ASSETS_DEBUG = True # This will disable minimizing js and css assets but less files will still compile.
	
	# Do not use the same key as any of the deployment servers
	SECRET_KEY = 'local_secret_key'
	
	# points to the geoserver endpoint you want to use. 
	COVERAGE_MAP_GEOSERVER_ENDPOINT = ''
	SITES_MAP_GEOSERVER_ENDPOINT = ''
	
	#points to the sld endpoint you want to use.
	SLD_ENDPOINT = ''
	
	#points to the codes endpoint
	CODES_ENDPOINT = ''
	
	#points to the query endpoint. Does not include the type of data or 'search' part of the endpoint
	SEARCH_QUERY_ENDPOINT = ''
	
	#points to the public srsnames endpoint you want to use.
	PUBLIC_SRSNAMES_ENDPOINT = ''
	```

Now you can run the application within the virtualenv by executing:
`python run.py`

The application can be accessed at 127.0.0.1:5050/index.

The jasmine tests can be run by executing `mvn jasmine:bdd` and accessing `localhost:8234`

The packaging, jasmine tests, and coverage report generation can be run by executing `mvn clean package`