# WQP_UI
===================

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/b4640bae0bcc4a279222f9c422da9ac5)](https://app.codacy.com/app/usgs_wma_dev/WQP_UI?utm_source=github.com&utm_medium=referral&utm_content=NWQMC/WQP_UI&utm_campaign=badger)
[![Build Status](https://travis-ci.org/NWQMC/WQP_UI.svg?branch=master)](https://travis-ci.org/NWQMC/WQP_UI)
[![Coverage Status](https://coveralls.io/repos/github/NWQMC/WQP_UI/badge.svg?branch=master)](https://coveralls.io/github/NWQMC/WQP_UI?branch=master)

Water Quality Portal User Interface

This application should be built using python 3.6.x and node version > 8.x.x.

## Local development - Docker

Two containers are provided - one for node-based build tooling, the second for
a Python server container.

### Build

```bash
docker-compose build
```

### Development server

```bash
# Run in the foreground
docker-compose up

# Run in the background
docker-compose up -d

# Run just the Python dev server on port 5050
docker-compose up server

# Run just the node.js build server on port 9000
docker-compose up assets
```

### Run tests

```bash
# Run Python server tests
docker-compose run server make test

# Run Javascript tests
docker-compose run assets npm test
```

## Local development - Makefile configuration

### Install dependencies

The repository contains a make target to configure a local development environment:

```bash
make env
```

To manually configure your environment, please see the READMEs of each separate project.

### Development server

To run all development servers in a watch mode at the same time, use the make target:

```bash
make watch
```

... and to run each dev server individually:

```bash
make watch-server
make watch-assets
```

See the specific project READMEs for additional information, including how to use Redis
and Celery with local development.

- [Flask Server README](./server/README.md)
- [Assets README](./assets/README.md)

### Run tests

To run all project tests:

```bash
make test
```

### Production build

```bash
make build
```

### Clean targets

```bash
make clean      ; clean build artifacts
make cleanenv   ; clean environment configuration and build artifacts
```

`make` supports chaining targets, so you could also `make clean watch`, etc.
