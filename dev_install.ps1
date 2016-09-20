param([String]$update="")

Write-Output "You must have node, Python 2.7, and virtualenv installed."

$configExists = Test-Path instance/config.py
if (-Not $configExists) {
	Write-Output "Please create an instance/config.py file before proceeding. See the README.md for what's required."
	Exit
}

if ($update -eq "--update") {
	Write-Output "Updating npm and bower dependencies"
	npm update
	bower update
}
else {
	Write-Output "Installing npm and bower dependencies"
	npm install
	bower install
}

Write-Output "Creating the virtualenv and installing Python requirements"
$envExists = Test-Path env
if (-Not $envExists) {
	Write-Output "Creating a virtualenv."
	virtualenv env
}
else {
	Write-Output "Virtualenv already exists."
}
env/Scripts/pip install -r requirements.txt

Write-Output "Finished setting up WQP-UI."
