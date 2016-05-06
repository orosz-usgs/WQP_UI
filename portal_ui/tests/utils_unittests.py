from portal_ui.utils import generate_redis_db_number, check_org_id
import unittest
import requests
import requests.mock


class RedisDbNumberTestCase(unittest.TestCase):
    """Tests for generate redis_db_number"""
    def test_will_nwis_return_1(self):
        """will NWIS give back a db value of 1?"""
        assert generate_redis_db_number('NWIS') == 1

    def test_will_storet_return_2(self):
        """will NWIS give back a db value of 2?"""
        assert generate_redis_db_number('STORET') == 2

    def test_will_stewards_return_3(self):
        """will STEWARDS give back a db value of 3?"""
        assert generate_redis_db_number('STEWARDS') == 3

    def test_will_biodata_return_4(self):
        """will BIODATA give back a db value of 4?"""
        assert generate_redis_db_number('BIODATA') == 4

    def test_will_other_return_0(self):
        """will any other value give back a db value of 0?"""
        assert generate_redis_db_number('RANDOM') == 0

class CheckOrgIdTestCase(unittest.TestCase):
    """tests for check_org_id"""
    def test_when_an_org_exists(self):
        """will an org that exists return what is expected"""



