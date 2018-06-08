import argparse
from wqp import app as application


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', '-ht', type=str)
    parser.add_argument('--certfile', type=str)
    parser.add_argument('--privatekeyfile', type=str)
    args = parser.parse_args()
    host_val = args.host
    if host_val is not None:
        host = host_val
    else:
        host = '127.0.0.1'

    # If you want to run with https, you will need to specify a certfile and a privatekeyfile.
    # See here for reference: https://blog.miguelgrinberg.com/post/running-your-flask-application-over-https
    ssl_context = None  # pylint: disable=C0103
    if args.certfile and args.privatekeyfile:
        ssl_context = (args.certfile, args.privatekeyfile)  # pylint: disable=C0103

    application.run(host=host, port=5050, threaded=True, ssl_context=ssl_context)

    # run from the command line as follows
    # python run.py -ht <ip address of your choice>
