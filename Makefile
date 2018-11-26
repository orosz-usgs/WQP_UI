#
# Entrypoint Makefile for Water Quality Portal
#

default: build

help:
	@echo  'Water Quality Portal Makefile targets:'
	@echo  '  build (default) - Produce the build artifact for each project'
	@echo  '  devenv - Create a local development environment'
	@echo  '  test - Run all project tests'
	@echo  '  clean - Remove all build artifacts'
	@echo  '  cleanenv - Remove all environment artifacts'

.PHONY: help env test clean cleanenv coverage

MAKEPID:= $(shell echo $$PPID)

devenv:
	cd assets && make devenv
	cd server && make devenv
test:
	cd assets && make test
	cd server && make test
clean:
	cd assets && make clean
	cd server && make clean
cleanenv:
	cd assets && make cleanenv
	cd server && make cleanenv
build: devenv
	cd assets && make build
	cd server && make build
