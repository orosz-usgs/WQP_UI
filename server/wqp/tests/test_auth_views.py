
from unittest import TestCase, mock

from flask import session

from .. import app
from ..auth.views import auth, authentication_required_when_configured

class TestAuthenticationRequiredWhenConfigured(TestCase):
    mock_time = mock.Mock()
    mock_time.return_value = 1234567

    def setUp(self):
        app.register_blueprint(auth)
        self.app_client = app.test_client()

    def test_no_authentication(self):
        view_mock = mock.Mock()
        app.config['WATERAUTH_AUTHORIZE_URL'] = ''
        with app.test_request_context('/mock') as c:
            authentication_required_when_configured(view_mock)()

        view_mock.assert_called()

    def test_with_authentication_no_expire_time(self):
        view_mock = mock.Mock()
        app.config['WATERAUTH_AUTHORIZE_URL'] = 'https://fake.auth.com'
        with app.test_request_context('/mock') as c:
            authentication_required_when_configured(view_mock)()

        view_mock.assert_not_called()

    @mock.patch('time.time', mock_time)
    def test_with_authentication_expire_time_earlier_then_current_time(self):
        view_mock = mock.Mock()
        app.config['WATERAUTH_AUTHORIZE_URL'] = 'https://fake.auth.com'
        with app.test_request_context('/mock') as c:
            session['access_token_expires_at'] = 1234566
            authentication_required_when_configured(view_mock)()

        view_mock.assert_not_called()

    @mock.patch('time.time', mock_time)
    def test_with_authentication_expire_time_later_then_current_time(self):
        view_mock = mock.Mock()
        app.config['WATERAUTH_AUTHORIZE_URL'] = 'https://fake.auth.com'
        with app.test_request_context('/mock') as c:
            session['access_token_expires_at'] = 1234568
            authentication_required_when_configured(view_mock)()

        view_mock.assert_called()