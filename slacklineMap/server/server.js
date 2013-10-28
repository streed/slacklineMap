Meteor.publish( "slacklines", function( bounds ) {	
	var sw = bounds._southWest;
	var ne = bounds._northEast;
	bounds = [ [ ne.lat, ne.lng ], [ sw.lat, sw.lng ] ];
	var lines = Slacklines.find( { loc: { $within: { $box: bounds } } });

	return lines;
});

Meteor.publish( "events", function( bounds ) {
	var sw = bounds._southWest;
	var ne = bounds._northEast;
	bounds = [ [ ne.lat, ne.lng ], [ sw.lat, sw.lng ] ];
	var lines = Events.find( { loc: { $within: { $box: bounds } } });

	return lines;
});

Meteor.startup( function() {
	if( Meteor.isServer ) {
		Slacklines._ensureIndex( { loc: "2d" } );
	}
});

