'''
Unit tests for portal_ui_blueprint views
'''

from unittest import TestCase, mock

import requests

from ... import app

class TestWqpDownloadProxy(TestCase):

    def setUp(self):
        self.app_client = app.test_client()
        app.config['SEARCH_QUERY_ENDPOINT'] = 'https://fakeservice.com/data/'

    @mock.patch('wqp.portal_ui_blueprint.views.session.post')
    @mock.patch('wqp.portal_ui_blueprint.views.make_response')
    def test_no_access_token(self, mock_make_resp, mock_post):
        mock_resp = mock.Mock(requests.Response)
        mock_resp.status_code = 200
        mock_resp.content = b'dummy contents'
        mock_resp.headers = {'Content-Type': 'text', 'Content-Disposition': 'attachment; filename=this.txt'}
        mock_post.return_value = mock_resp

        mock_make_resp.return_value = 'Dummy text'

        self.app_client.post('/wqp_download/Station')

        mock_post.assert_called()
        self.assertEqual(mock_post.call_args[0][0], 'https://fakeservice.com/data/Station/search')
        self.assertEqual(mock_post.call_args[1]['headers'], {})

    @mock.patch('wqp.portal_ui_blueprint.views.session.post')
    @mock.patch('wqp.portal_ui_blueprint.views.make_response')
    def test_access_token(self, mock_make_resp, mock_post):
        mock_resp = mock.Mock(requests.Response)
        mock_resp.status_code = 200
        mock_resp.content = b'dummy contents'
        mock_resp.headers = {'Content-Type': 'text', 'Content-Disposition': 'attachment; filename=this.txt'}
        mock_post.return_value = mock_resp

        mock_make_resp.return_value = 'Dummy text'

        self.app_client.set_cookie('localhost', 'access_token', 'dummy_token')
        self.app_client.post('/wqp_download/Result')

        mock_post.assert_called()
        self.assertEqual(mock_post.call_args[0][0], 'https://fakeservice.com/data/Result/search')
        self.assertEqual(mock_post.call_args[1]['headers'], {'Authorization': 'Bearer dummy_token'})


