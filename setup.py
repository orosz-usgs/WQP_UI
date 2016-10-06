"""
Created on Aug 26, 2016

@author: ayan
"""
import ConfigParser
from setuptools import setup, find_packages


BUMPVERSION_CFG = '.bumpversion.cfg'


def get_package_version():
    """
    Read the .bumpversion.cfg file return
    the current version number listed therein.
    Version number only needs to be maintained
    in the .bumpversion.cfg file.

    :return: current package version
    :rtype: str

    """
    config = ConfigParser.ConfigParser()
    config.read(BUMPVERSION_CFG)
    current_version = config.get('bumpversion', 'current_version')
    return current_version


def read_requirements():
    """
    Get application requirements from
    the requirements.txt file.

    :return: portal_ui Python requirements
    :rtype: list

    """
    with open('requirements.txt', 'r') as req:
        requirements = req.readlines()
    install_requires = [r.strip() for r in requirements if r.find('git+') != 0]
    dependency_links = [r.strip() for r in requirements if r.find('git+') == 0]
    return {'install_requires' : install_requires, 'dependency_links' : dependency_links}


def read(filepath):
    """
    Read the contents from a file.

    :param str filepath: path to the file to be read
    :return: file contents
    :rtype: str

    """
    with open(filepath, 'r') as f:
        content = f.read()
    return content

parsed_requirements = read_requirements()

setup(name='usgs_flask_wqp_ui',
      version=get_package_version(),
      description='USGS Flask Water Quality Portal User Interface',
      author='Mary Bucknell, James Kreft, Andrew Yan',
      author_email='jkreft@usgs.gov',
      packages=find_packages(),
      include_package_data=True,
      long_description=read('README.md'),
      install_requires=parsed_requirements['install_requires'],
      tests_require=parsed_requirements['install_requires'],
      platforms='any',
      test_suite='nose.collector',
      zip_safe=False,
      dependency_links=parsed_requirements['dependency_links']
      )
