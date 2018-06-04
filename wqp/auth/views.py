
from functools import wraps
import time

from flask import redirect, url_for, Blueprint, session, request

from .. import app, oauth

auth = Blueprint('auth', __name__)


def authorization_required_when_usgs(f):
    '''
    View decorator used to decorate any view that requires authorization when the usgs theme is used
    :param function f: view function
    :return: Decorated function
    :rtype: function
    '''
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if app.config['UI_THEME'] == 'usgs' and (session.get('access_token_expires_at', 0) < int(time.time())):
            #print('Token is: {0}'.format(request.cookies.get('access_token')))
            #print('Token expires at {0}. Now is {1}'.format(session.get('access_token_expires_at', 0),
            #                                                int(time.time())))
            return redirect('{0}?next={1}'.format(url_for('auth.login'), request.url))
        return f(*args, **kwargs)

    return decorated_function


@auth.route('/login')
def login():
    redirect_uri = '{0}?next={1}'.format(url_for('auth.authorize', _external=True), request.args.get('next'))
    return oauth.waterauth.authorize_redirect(redirect_uri)

@auth.route('/authorize')
def authorize():
    token = oauth.waterauth.authorize_access_token(verify=False)

    response = redirect(request.args.get('next'))
    response.set_cookie('access_token', token.get('access_token'), secure=True)
    session['access_token_expires_at'] = token.get('expires_at')
    #print('IN AUTHORIZE: Expires_at: {0}'.format(token.get('expires_at')))
    return response


