Slacklines = new Meteor.Collection( "slacklines" );

Slacklines.allow({
	insert: function( userId, slackline ) {
		return false;
	},
	update: function( userId, slackline, fields ) {
		if( userId != slackline.owner )
			return false;
		
		var allowed = [ "name", "lat", "lng", "description", "length", "type" ];
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
				length: options.length,
				type: options.type,
				description: options.description,
				name: options.name });

			return id;
		} else {
			return null;
		}
	},
	createEvent: function( options ) {
		if( this.userId != null ) {
			var id = options._id || Random.id();
			Slacklines.insert( {
				_id: id,
				owner: this.userId,
				loc: { lat: options.lat, lng: options.lng },
				description: options.description,
				date: options.date,
				facebook: options.facebook
			});

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

Events = new Meteor.Collection( "events" );

Events.allow({
	insert: function( userId, e ) {
		return false;
	},
	update: function( userId, e, fields ) {
		if( userId != e.owner )
			return false;
		var allowed = [ "name", "owner", "lat", "lng", "description", "date", "facebook" ];
		if( _.different( fields, allowed ).length )
			return false;
		return true;
	},
	remove: function( userId, e ) {
		return userId == e.owner;
	}
});

createEvent = function( options ) {
	var id = Random.id();
	Meteor.call( "createEvent", _.extend( { _id: id }, options ) );
};

