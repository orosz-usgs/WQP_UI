# WQP_UI
Water Quality Portal User Interface

This application should be built using python 2.7.x. You also should have node installed on your development machine.

You will need to create a config.py file in the `instance` directory. It should contain the following:
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


To build this application on a linux or Mac OS you can use the dev_install.sh script. If you want a fresh install type in:
`source dev_install.sh --clean`
This will remove the previous javascript and python dependencies. If you don't want to install from scratch, type in:
`source dev_install.sh`
This will update your javascript and python dependencies. Both commands will run the jasmine tests.

To build on a windows machine (or you want to build by hand), you will need to run the follow commands at a command prompt.
1. Run `mvn clean test` or `mvn test` (Use the former if you want dependencies to be freshly installed rather than just updated)
2. Run `virtualenv --python=python2.7`
3. Activate your virtualenv
4. Run `pip install -r requirements.txt`

If you don't have maven installed, you can do the following steps:
1. If you want to clean, remove the env, node, node_modules, portal_ui/bower_components, portal_ui/static/gen, and portal_ui/static/.webassets-cache directories
2. Install node (if you don't already have it installed.
3. Run `npm install`
4. Run `bower install`
5. Run `karma start test/js/karma.conf.js` (optional this runs the tests)
6. Run `virtualenv --python=python2.7`
7. Activate your virtualenv
8. Run `pip install -r requirements.txt`


Now you can run the application within the virtualenv by executing:
`python run.py`

The application can be accessed at 127.0.0.1:5050/index.

For developer level testing, you can use the npm test script to run in no-single-step mode. Note that this
script will have to modified for Windows users.

