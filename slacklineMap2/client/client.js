Meteor.subscribe( "twitters" );

var addMarker = function( name, description, lat, lng ) {
	L.mapbox.markerLayer({
		type: "Feature",
		geometry: {
			type: "Point",
		coordinates: [ lng, lat ]
		},
		properties: { 
			title: name,
		description: description,
		'marker-size': "medium",
		'marker-color': "#f0a"
		}
	}).addTo( Meteor.map );
};


Deps.autorun( function() {
	Meteor.subscribe( "slacklines", function() {
		Slacklines.find().fetch().forEach( function( d ) {
			var loc = d.loc;
			addMarker( d.name, d.description, loc.lat, loc.lng );
		});
	});

});

Meteor.startup( function() {
	Deps.autorun( function() {
		if( Meteor.isClient ) {
			if( !Meteor.map ) {
				var map = L.mapbox.map( "map", "streed.map-bu0r9jyo" );
				Meteor.map = map;

				//lets get the location of the user if possible.
				map.on( "locationfound", function( e ) { 
					Meteor.map.fitBounds( e.bounds );
					Session.set( "map", Meteor.map.getCenter() );
				});

				map.on( "locationerror", function() {
					Session.set( "map", Meteor.map.getCenter() );
				});

				map.on( "moveend", function() {
					Session.set( "map", Meteor.map.getCenter() );
				});

				map.on( "click", function( e ) {
					console.log( e );
					var str = e.latlng.lat + " " + e.latlng.lng;
					$(".slacklineGPS").val( str );
				});

				map.locate();

				map.addControl( L.mapbox.geocoderControl( "streed.map-bu0r9jyo" ) );

				Meteor.autosubscribe( function() {
					Slacklines.find().observe({
						added: function( d ) {
							var loc = d.loc;
							addMarker( d.name, d.description, loc.lat, loc.lng );
						}
					});
				});
			}
		}
	});
});

Template.createSlackline.events({
	"click .saveSlackline": function() {
		if( Meteor.user() != undefined ) {
			var name = $( ".slacklineName" ).val();
			var gps = $( ".slacklineGPS" ).val();
			var description = $( ".slacklineDescription" ).val();

			gps = gps.split( " " );
			var lat = parseFloat( gps[0] );
			var lng = parseFloat( gps[1] );

			createSlackline( {  name: name, lat: lat, lng: lng, description: description } );

			addMarker( name, description, lat, lng );
		} else {
		}
	}
});
