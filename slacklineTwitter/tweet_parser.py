import pyparsing as pp

"""
#slackanator #gps 37.254379960133264 -80.01617431640625 #length 100ft #beta Awesome is the only word that describes this.
"""
Float = pp.Combine( pp.Optional( "-" ) + pp.Word( pp.nums ) + "." + pp.Word( pp.nums ) )
Float.setParseAction( lambda s, l, t: float( t[0] ) )
GpsFloatPair = Float + Float
GpsFloatPair.setParseAction( lambda s, l, t: tuple( t )  )
Gps = pp.Keyword( "#gps" ) + GpsFloatPair
Gps.setParseAction( lambda s, l, t: { "gps": t[1] } )
Length = pp.Or( [ pp.Keyword( "#l" ), pp.Keyword( "#length" ) ] ) + pp.Combine( pp.Word( pp.nums ) + pp.Or( [ pp.Word( "mM" ), pp.Word( "ftFT'" ) ] ) )
Length.setParseAction( lambda s, l, t: { "length": t[1] } )
BetaSentence = pp.Group( pp.OneOrMore( pp.Word( pp.alphanums + "`~!@$%^&*()_+-=[]{};\"':,.<>/?" ) ) )
BetaSentence.setParseAction( lambda s, l, t: " ".join( t[0] ) )
Beta = pp.Or( [ pp.Keyword( "#b" ), pp.Keyword( "#beta" ) ] ) + BetaSentence
Beta.setParseAction( lambda s, l, t: { "beta": t[1] } )
Name = pp.Or( [ pp.Keyword( "#n" ), pp.Keyword( "#name" ) ] ) + BetaSentence
Name.setParseAction( lambda s, l, t: { "name": t[1] } )
HashTagParam = pp.Or( [ Gps, Length, Beta, Name ] )
Slackanator = pp.Keyword( "#slackanator" ).suppress()
TweetParser = Slackanator + pp.OneOrMore( HashTagParam )
TweetParser.setResultsName( "tweet" )
TweetParser.setParseAction( lambda s, l, t: { "tweet": dict( ( k, v ) for d in t for ( k, v ) in d.items() ) } )

if __name__ == "__main__":
	print TweetParser.parseString( "#slackanator #gps -1.0 1.0 #length 100ft #beta lol this is cool!" )
	print TweetParser.parseString( "#slackanator #gps 37.290442925478196 -79.97154235839844 #length 100ft #beta Awesome" )
	print TweetParser.parseString( "#slackanator #beta This IS AWEOSME! #gps 1.0 1.0" )
	print TweetParser.parseString( "#slackanator #b More Awesome #gps 0.0 0.0 #l 100FT" )
	print TweetParser.parseString( "#slackanator #b More Awesome #gps 0.0 0.0 #l 100'" )
	print TweetParser.parseString( "#slackanator #name This is a cool name #b More Awesome #gps 0.0 0.0 #l 100'" )
	print TweetParser.parseString( "#slackanator #b More Awesome #n Another cool name #gps 0.0 0.0 #l 100'" )
