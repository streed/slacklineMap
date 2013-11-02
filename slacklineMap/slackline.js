Slacklines = new Meteor.Collection( "slacklines" );

Slacklines.allow({
	insert: function( userId, slackline ) {
		return false;
	},
	update: function( userId, slackline, fields ) {
		if( userId != slackline.owner )
			return false;
		
		var allowed = [ "_id", "name", "lat", "lng", "description", "length", "type" ];
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

updateSlackline = function( id, options ) {
	Meteor.call( "updateSlackline", id, options );
};

Meteor.methods( {
	createSlackline: function( options ) {
		if( this.userId != null ) {
			var id = options._id || Random.id();
			Slacklines.insert( {
				_id: id,
				owner: this.userId,
				loc: { lat: options.lat, lng: options.lng },
				length: options.length,
				type: options.type,
				description: options.description,
				name: options.name });

			return id;
		} else {
			return null;
		}
	},
	updateSlackline: function( id, options ) {
		if( this.userId != null ) {
			Slacklines.update( id, { $set: options } );
		} else {
		}
	}
});

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

