
import feedparser
import requests

from bs4 import BeautifulSoup
from flask import request, make_response

def pull_feed(feed_url):
    """
    pull page data from a my.usgs.gov confluence wiki feed
    :param feed_url: the url of the feed, created in confluence feed builder
    :return: the html of the page itself, stripped of header and footer
    """
    feed = feedparser.parse(feed_url)

    # Process html to remove unwanted mark-up and fix links
    post = ''
    if len(feed['entries']) > 0:
        soup = BeautifulSoup(feed['entries'][0].summary)

        # Remove edited by paragraph
        soup.p.extract()

        # Remove final div in the feed
        feed_div = soup.find('div', class_='feed')
        children_divs = feed_div.findAll('div')
        children_divs[len(children_divs) - 1].extract()

        # Translate any in page links to use relative URL
        base = feed['entries'][0].summary_detail.base
        links = feed_div.select('a[href^="' + base + '"]')
        for link in links:
            link['href'] = link['href'].replace(base, '')
        post = unicode(soup)

    return post

def geoserver_proxy_request(target_url):
    if request.method == 'GET':
        resp = requests.get(target_url + '?' + request.query_string)
        # This fixed an an ERR_INVALID_CHUNKED_ENCODING when the app was run on the deployment server.
        if 'transfer-encoding' in resp.headers:
            del resp.headers['transfer-encoding']
            
    else:
        resp = requests.post(target_url, data=request.data, headers=request.headers)
        if 'content-encoding' in resp.headers: 
            del resp.headers['content-encoding']
        
    return make_response(resp.content, resp.status_code, resp.headers.items())    

