Meteor.publish( "slacklines", function() {
	return Slacklines.find();
});


if( Meteor.isServer ) {
	var twitter = new Twitter();

	Meteor.methods({
		test: function() {
			console.log( twitter );
		}
	});
}

