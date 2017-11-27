#!/bin/bash

ARG1=${1:-"--update"};

echo "You must have npm, python 2.7 and virtualenv installed"
if [ ! -s instance/config.py ]; then
	echo "Please create an instance/config.py file before proceeding. See the README.md for what's required."
	return
fi

if [ "$ARG1" == '--clean' ]; then
	echo "Cleaning out current dependencies";

    rm -rf node_modules;
	rm -rf wqp/static;
	rm -rf env;
fi

echo "Installing npm dependencies";
npm install;

if [ ! -s env ]; then
    echo "Creating the virtualenv env";
	virtualenv --python=python2.7 --no-download env;
fi
echo "Installing python requirements";
env/bin/pip install -r requirements.txt;

echo "Running Javascript tests";
node_modules/karma/bin/karma start test/js/karma.conf.js;

echo "Running Python tests";
env/bin/nosetests --logging-clear-handlers

echo "Finished setting up WQP-UI";