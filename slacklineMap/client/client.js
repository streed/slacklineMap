Meteor.subscribe( "twitters" );

var addMarker = function( name, description, lat, lng, length, type, owner ) {
	if( type === undefined || type == "" )
		type = "Not Available";
	if( length === undefined || length == "" )
		length = "Not Available";
	if( description === undefined || description === "" )
		description = "No Beta :<";

	var description = "<fieldset><label>Length: " + length + "</label>" +
				"<label>Material: " + type + "</label>" +
				"<label>Beta: " + description + "</label></fieldset>";

	var color = "#f0a";
	if( Meteor.userId() == owner ) {
		description += "<a href='#'>Edit</a>";
		color = "#ffa";
	}

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
		'marker-color': color
		}
	}).addTo( Meteor.map );
};


Deps.autorun( function() {
	Meteor.subscribe( "slacklines", Session.get( "map.bounds" ), function() {
		Slacklines.find({}).fetch().forEach( function( d ) {
			var loc = d.loc;
			addMarker( d.name, d.description, loc.lat, loc.lng, d.length, d.type, d.owner );
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
					Session.set( "map.bounds", Meteor.map.getBounds() );
				});

				map.on( "locationerror", function() {
					Session.set( "map.bounds", Meteor.map.getBounds() );
				});

				map.on( "moveend", function() {
					Session.set( "map.bounds", Meteor.map.getBounds() );
				});

				map.on( "click", function( e ) {
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
			var length = $(".slacklineLength" ).val();
			var type = $( ".slacklineMaterial" ).find( ":selected" ).text();

			gps = gps.split( " " );
			var lat = parseFloat( gps[0] );
			var lng = parseFloat( gps[1] );

			createSlackline( {  name: name, lat: lat, lng: lng, description: description, type: type, length: length } );

			addMarker( name, description, lat, lng, length, type, Meteor.userId() );
		} else {
		}
	}
});

Template.navBar.events({
	"click #slacklineTools": function() {
		$( ".mapContainer" ).removeClass( "otherDrawer" );
		$( "#eventTools" ).removeClass( "otherDrawer" );
		$(".mapContainer").toggleClass( "drawer" );		
		$("#mapTools").toggleClass( "drawer" );
	},
	"click #eventToolsButton": function() {
		$( ".mapContainer" ).removeClass( "drawer" );
		$( "#mapTools" ).removeClass( "drawer" );
		$( ".mapContainer" ).toggleClass( "otherDrawer" );
		$( "#eventTools" ).toggleClass( "otherDrawer" );
	}
});

Template.myslackLines.mySlacklines = function() {
	return Slacklines.find( { owner: Meteor.userId() } );
};

Template.myslackLines.events({
	"click .mySlacklineName": function( e ) {
		$(e.srcElement.nextElementSibling).toggleClass( "hidden" );
	},
	"click .updateSlackline": function( e ) {
		var children = e.srcElement.parentElement.children;
		var name = children[1].value;
		var loc = children[3].value.split( " " );
		loc[0] = parseFloat( loc[0] );
		loc[1] = parseFloat( loc[1] );
		var length = children[5].value;
		var type = children[7].value;
		var description = children[9].value;
		var id = children[11].value;

		updateSlackline( id, { name: name, lat: loc[0], lng: loc[1], description: description, type: type, length: length } );
	}
});
