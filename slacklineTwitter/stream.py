from tweepy import OAuthHandler, StreamListener, Stream as TweepyStream

import os
import shlex
import ConfigParser as configparser

from optparse import OptionParser
from tweet_parser import TweetParser

class StreamerListener( StreamListener ):

	def on_status( self, tweet ):
		"""
			Takes the tweets and extracts the text and sends the
			tweet to a Queue.
		"""

		tweet = TweetParser.parseString( tweet.text )

		print tweet


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
		print self._terms
		self.stream.filter( track=self._terms )
