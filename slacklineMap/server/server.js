Meteor.publish( "slacklines", function() {
	return Slacklines.find();
});

