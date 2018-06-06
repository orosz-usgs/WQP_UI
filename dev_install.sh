#!/bin/bash

ARG1=${1:-"--update"};

echo "You must have npm, python 3.x and virtualenv installed"
if [ ! -s server/instance/config.py ]; then
	echo "Please create an instance/config.py file before proceeding. See the README.md for what's required."
	return
fi

if [ "$ARG1" == '--clean' ]; then
	echo "Cleaning out current dependencies";

    rm -rf assets/node_modules;
	rm -rf server/wqp/static;
	rm -rf server/env;
fi

echo "Installing npm dependencies";
pushd assets
npm install;
popd

if [ ! -s server/env ]; then
    echo "Creating the virtualenv env";
	virtualenv --python=python3 --no-download server/env;
fi
echo "Installing python requirements";
server/env/bin/pip install -r server/requirements.txt;

echo "Running Javascript tests";
assets/node_modules/karma/bin/karma start assets/test/js/karma.conf.js;

echo "Running Python tests";
server/env/bin/python -m unittest

echo "Finished setting up WQP-UI";
