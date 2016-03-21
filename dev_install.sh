#!/bin/bash

echo "You must have python 2.7 and virtualenv installed"
if [ ! -s instance/config.py ]; then
   echo "Please create a instance/config.py file before proceeding. See the README.md for what's required"
   return
fi
if [ "$1" == "--clean" ]; then
   echo "Cleaning the project, installing the javascript dependencies and running the javascript tests"
   mvn clean test
else
    echo "Installing the javascript dependencies and running the javascript tests"
    mvn test
fi
echo "Creating the virtualenv env and installing python requirements"
if [ ! -s env ]; then
    virtualenv --python=python2.7 env
fi
env/bin/pip install -r requirements.txt

echo "Finished installing and building WQP-UI"