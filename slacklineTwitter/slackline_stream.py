from tweepy import OAuthHandler, API, StreamListener, Stream

TOKEN = ""
SECRET = ""
CONSUMER = ""
CONSUMER_SECRET = ""

class MyListener( StreamListener ):
	def on_status( self, tweet ):
#		if tweet.geo != None:
		print tweet.text, tweet.geo

	def on_error( self, code ):
		return False

auth = OAuthHandler( CONSUMER, CONSUMER_SECRET )
auth.set_access_token( TOKEN, SECRET )

listener = MyListener()
streamer = Stream( auth=auth, listener=listener )

tracks = [ "nipples" ]

print streamer.filter( track=tracks )
