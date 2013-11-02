SlacklineEvents = new Meteor.Collection( "slacklineevents" );

SlacklineEvents.allow( {
	insert: function( userId, e ) {
		return false;
	},
	update: function( userId, e, fields ) {
		if( userId != e.owner )
			return false;
		var allowed = [ "_id", "name", "lat", "lng", "description", "date", "facebook", "owner" ];

		if( _.difference( fields, allowed ).length )
			return false;
		
		return true;
	},
	remove: function( userId, e ) {
		return userId == e.owner;
	}
});

Meteor.methods( {
	createEvent: function( options ) {
		if( this.userId != null ) {
			var id = options._id || Random.id();
			SlacklineEvents.insert( {
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
	},
	updateEvent: function( id, options ) {
		if( this.userId != null ) {
			SlacklineEvents.update( id, { $set: options } );
		} else {
		}
	}
});

createEvent = function( options ) {
	var id = Random.id();
	Meteor.call( "createEvent", _.extend( { _id: id }, options ) );

	return id
};

updateEvent = function( id, options ) {
	Meteor.call( "updateEvent", id, options );
};

