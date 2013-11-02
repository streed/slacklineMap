import pyparsing as pp

Float = pp.Combine( pp.Optional( "-" ) + pp.Word( pp.nums ) + "." + pp.Word( pp.nums ) )
Float.setParseAction( lambda s, l, t: float( t[0] ) )
GpsFloatPair = Float + Float
GpsFloatPair.setParseAction( lambda s, l, t: tuple( t )  )
Gps = pp.Keyword( "#gps" ) + GpsFloatPair
Gps.setParseAction( lambda s, l, t: { "gps": t[1] } )
Length = pp.Keyword( "#length" ) + pp.Combine( pp.Word( pp.nums ) + pp.Or( [ pp.Word( "mM" ), pp.Word( "ftFT" ) ] ) )
Length.setParseAction( lambda s, l, t: { "length": t[1] } )
BetaSentence = pp.Group( pp.OneOrMore( pp.Word( pp.alphanums + "`~!@$%^&*()_+-=[]{};\"':,.<>/?" ) ) )
BetaSentence.setParseAction( lambda s, l, t: " ".join( t[0] ) )
Beta = pp.Keyword( "#beta" ) + BetaSentence
Beta.setParseAction( lambda s, l, t: { "beta": t[1] } )
HashTagParam = pp.Or( [ Gps, Length, Beta ] )
Slackanator = pp.Keyword( "#slackanator" )
Slackanator.setParseAction( lambda s, l, t: { "slackanator": t[0] } )
TweetParser = Slackanator + pp.OneOrMore( HashTagParam )
TweetParser.setResultsName( "tweet" )
TweetParser.setParseAction( lambda s, l, t: { "tweet": dict( ( k, v ) for d in t for ( k, v ) in d.items() ) } )

if __name__ == "__main__":
	"""
	Expected output:
		[{'tweet': {'length': '100ft', 'beta': 'lol this is cool!', 'gps': (-1.0, 1.0)}}]
		[{'tweet': {'length': '100ft', 'beta': 'Awesome', 'gps': (37.290442925478196, -79.97154235839844)}}]
		[{'tweet': {'beta': 'This IS AWEOSME!', 'gps': (1.0, 1.0)}}]
		[{'tweet': {'beta': 'More Awesome', 'length': '100FT', 'gps': (0.0, 0.0)}}]
		[{'tweet': {'beta': 'More Awesome', 'length': "100'", 'gps': (0.0, 0.0)}}]
		[{'tweet': {'length': "100'", 'beta': 'More Awesome', 'name': 'This is a cool name', 'gps': (0.0, 0.0)}}]
		[{'tweet': {'length': "100'", 'beta': 'More Awesome', 'name': 'Another cool name', 'gps': (0.0, 0.0)}}]
	"""
	print Gps.parseString( "#gps 37.290442925478196 -79.97154235839844" )
	print Length.parseString( "#length 100m" )
	print Beta.parseString( "#beta this is a test" )
	print Beta.parseString( "#beta this, is a test.!! #gps 1.0 1.0" )
	print HashTagParam.parseString( "#gps 1.0 1.0" )
	print TweetParser.parseString( "#slackanator #gps -1.0 1.0 #length 100ft #beta lol this is cool!" )
	print TweetParser.parseString( "#slackanator #gps 37.290442925478196 -79.97154235839844 #length 100ft #beta Awesome" )
	print TweetParser.parseString( "#slackanator #beta This IS AWEOSME! #gps 1.0 1.0" )


