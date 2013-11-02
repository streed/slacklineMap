from tweepy import OAuthHandler, StreamListener, Stream as TweepyStream

import os
import json
import shlex
import ConfigParser as configparser

from requests import post

from tweet_parser import TweetParser

class StreamerListener( StreamListener ):

	def on_status( self, tweet ):
		"""
			Takes the tweets and extracts the text and sends the
			tweet to a Queue.
		"""
		t = TweetParser.parseString( tweet.text )[0]
		t = t["tweet"]

		data = {}

		if "gps" in t:
			data["lat"] = t["gps"][0]
			data["lng"] = t["gps"][1]
			data["loc"] = { "lat": t["gps"][0], "lng": t["gps"][1] }
		else:
			return

		if "beta" in t or "b" in t:
			data["description"] = str( t["beta"] )

		if "length" in t or "l" in t:
			data["length"] = str( t["length"] )
		else:
			data["length"] = "N/A"

		if "type" in t or "t" in t:
			data["type"] = str( t["type"] )
		else:
			data["type"] = "N/A"

		if "name" in t or "n" in t:
			data["name"] = str( t["name"] )
		else:
			data["name"] = str( "%s's slackline" % tweet.author.screen_name )

		data["owner"] = tweet.author.screen_name

		res = post( "http://localhost:3000/slack/lines", data=json.dumps( data ) )

	def on_error( self, code ):
		print "Error:", code



class Streamer( object ):

	def __init__( self, queue, terms=[], consumer=None, consumer_secret=None,
			token=None, secret=None):

		if consumer == None or consumer_secret == None or token == None or secret == None:
			config = configparser.ConfigParser()
			config.readfp( open( os.path.expanduser( "~/.slackTwitter" ) ) )

			consumer = config.get( "twitter", "consumer" )
			consumer_secret = config.get( "twitter", "consumer_secret" )
			token = config.get( "twitter", "token" )
			secret = config.get( "twitter", "secret" )

		auth = OAuthHandler( consumer, consumer_secret )
		auth.set_access_token( token, secret )

		listener = StreamerListener()
		self.stream = TweepyStream( auth=auth, listener=listener )

		self._queue = queue
		self._terms = terms
	
	def start( self ):
		self.stream.filter( track=self._terms )
