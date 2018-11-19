NODE_VERSION=$(shell python3 -c "import json; print(json.loads(open('package.json').read())['engines']['node'])")

.PHONY: devenv test clean cleanenv watch

build:
	@echo 'Building assets...'
	npm run build

clean:
	@echo 'Cleaning assets...'
	rm -rf dist


#
# Development targets
#
test:
	@echo 'Running assets tests...'
	npm run test

watch:
	npm run watch

#
# Environment configuration targets
#
devenv: assert-node node-modules

# Assert that we're using the proper node.js version
assert-node:
ifeq ($(shell node --version), v$(NODE_VERSION))
	@echo 'Using node $(NODE_VERSION)'
else
	@echo 'Please use node.js version $(NODE_VERSION).'
	@echo 'Consider nvm to manage node versions: https://github.com/creationix/nvm'
	@exit 1
endif

node-modules:
	@echo 'Installing assets dependencies...'
	npm install

cleanenv: clean
	@echo 'Cleaning assets environment...'
	rm -rf node_modules
