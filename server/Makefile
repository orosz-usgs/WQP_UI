COVERAGE := coverage
PIP := pip
PYTHON := python

.PHONY: build devenv test clean cleanenv watch

build:
	@echo 'Building server...'
	$(PYTHON) setup.py bdist_wheel

clean:
	@echo 'Cleaning server...'
	rm -rf dist
	rm -rf build


#
# Development targets
#
test:
	$(COVERAGE) run -m unittest
	$(COVERAGE) xml

watch:
	$(PYTHON) run.py


#
# Environment configuration targets
#

devenv: env instance/config.py requirements

env:
	@echo 'Creating the virtualenv env'
	virtualenv --python=python3.6 --no-download env

requirements: env
	@echo 'Installing requirements.txt'
	$(PIP) install -r requirements.txt -r requirements-dev.txt

instance/config.py:
	@echo 'Creating instance/config.py...'
	cp instance/config.py.sample instance/config.py

cleanenv: clean
	@echo 'Cleaning server environment...'
	rm -rf env
