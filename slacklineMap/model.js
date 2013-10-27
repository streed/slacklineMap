Slacklines = new Meteor.Collection( "slacklines" );

Slacklines.allow({
	insert: function( userId, slackline ) {
		return false;
	},
	update: function( userId, slackline, fields ) {
		if( userId != slackline.owner )
			return false;
		
		var allowed = [ "name", "lat", "lng", "description" ];
		if( _.difference( fields, allowed ).length )
			return false;

		return true;
	},
	remove: function( userId, slackline ) {
		return userId == slackline.owner;
	}
});

createSlackline = function( options ) {
	var id = Random.id();
	Meteor.call( "createSlackline", _.extend( { _id: id }, options ) );

	return id;
};

Meteor.methods( {
	createSlackline: function( options ) {
		if( this.userId != null ) {
			var id = options._id || Random.id();
			Slacklines.insert( {
				_id: id,
				owner: this.userId,
				loc: { lat: options.lat, lng: options.lng },
				description: options.description,
				name: options.name });

			return id;
		} else {
			return null;
		}
	}});

displayName = function( user ) {
	if( user.profile && user.profile.name )
		return user.profile.name;
	return user.emails[0].address;
};

var contactEmail = function( user ) {
	if( user.emails && user.emails.length )
		return user.emails[0].address;
	if( user.services && user.services.facebook && user.services.facebook.email )
		return user.services.facebook.email;
	return null;
};
