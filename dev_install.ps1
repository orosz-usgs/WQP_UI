param([String]$arg1="--update")

Write-Output "You must have node, karma, Python 2.7, and virtualenv installed and available via the system path."

$configExists = Test-Path instance\config.py
if (-Not $configExists) {
	Write-Output "Please create an instance\config.py file before proceeding. See the README.md for what's required."
	Exit
}

if ($arg1 -eq "--update") {
	Write-Output "Updating npm and bower dependencies"
	npm update
	bower update
}

if ($arg1 -eq "--clean") {
	Write-Output "Clearing old dependencies."
	Remove-Item node_modules -Force -Recurse
	Remove-Item portal_ui\bower_components -Force -Recurse
	Write-Output "Installing dependencies"
	npm install
	bower install
}

Write-Output "Running Javascript tests."
node node_modules\karma\bin\karma start test\js\karma.conf.js

Write-Output "Creating the virtualenv and installing Python requirements"
if ($arg1 -eq "--clean") {
	Remove-Item env -Force -Recurse
}

$envExists = Test-Path env
if (-Not $envExists) {
	Write-Output "Creating a virtualenv."
	virtualenv env
}
else {
	Write-Output "Virtualenv already exists."
}
env\Scripts\pip install -r requirements.txt

Write-Output "Finished setting up WQP-UI."
