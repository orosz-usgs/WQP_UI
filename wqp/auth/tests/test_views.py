
from unittest import TestCase, mock

from ... import app
from ..views import auth, authentication_required_when_configured

class TestAuthenticationRequiredWhenConfigured(TestCase):

    def setUp(self):
        app.register_blueprint(auth)
        self.app_client = app.test_client()

    def test_no_authentication(self):
        view_mock = mock.Mock()
        authentication_required_when_configured(view_mock)

        view_mock.assert_called()