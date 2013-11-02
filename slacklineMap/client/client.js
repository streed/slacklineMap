var addSlacklineMarker = function( name, description, lat, lng, length, type, owner ) {
	colors = [ "#FFF", "#222" ];

	if( type === undefined || type == "" )
		type = "Not Available";
	if( length === undefined || length == "" )
		length = "Not Available";
	if( description === undefined || description === "" )
		description = "No Beta :<";

	var description = "<fieldset><label>Length: " + length + "</label>" +
				"<label>Material: " + type + "</label>" +
				"<label>Beta: " + description + "</label></fieldset>";

	var color = colors[0];
	if( Meteor.userId() == owner || Meteor.user().profile.name == owner ) {
		description += "<a href='#'>Edit</a>";
		color = colors[1];
	}

	return {
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
	};
};

var addEventMarker = function( name, description, lat, lng, date, facebook, owner ) {
	colors = [ "#FF0", "#555" ];

	if( date === undefined || date == "" )
		date = "Not Available";
	if( facebook === undefined || facebook == "" )
		facebook = "Not Available";
	if( description === undefined || description === "" )
		description = "No Beta :<";

	var description = "<fieldset><label>Name: " + name + "</label>" +
				"<label>Date: " + date + "</label>" +
				"<label>Beta: " + description + "</label>" +
				"<label><a href=\"" + facebook + "\">Facebook Link</a></fieldset>";

	var color = colors[0];
	if( Meteor.userId() == owner || Meteor.user().profile.name == owner ) {
		description += "<a href='#'>Edit</a>";
		color = colors[1];
	}

	return {
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
	};
};

Deps.autorun( function() {
	Meteor.subscribe( "slacklines", Session.get( "map.bounds" ), function() {
		var markers = [];
		Slacklines.find({}).fetch().forEach( function( d ) {
			var loc = d.loc;
			markers.push( addSlacklineMarker( d.name, d.description, loc.lat, loc.lng, d.length, d.type, d.owner ) );
		});

		//var markers = Meteor.map.markerLater.getGeoJSON().concat( markers );
		//Meteor.map.markerLayer.setGeoJSON( markers );
		var slacklineLayer = L.mapbox.markerLayer( markers );
		slacklineLayer.addTo( Meteor.map );
	});

	Meteor.subscribe( "slacklineevents", Session.get( "map.bounds" ), function() {
		var markers = [];
		SlacklineEvents.find({}).fetch().forEach( function( d ) { 
			var loc = d.loc;
			markers.push( addEventMarker( d.name, d.description, loc.lat, loc.lng, d.date, d.facebook, d.owner ) );
		});

		//var markers = Meteor.map.markerLater.getGeoJSON().concat( markers );
		//Meteor.map.markerLayer.setGeoJSON( markers );
		var eventsLayer = L.mapbox.markerLayer( markers );
		eventsLayer.addTo( Meteor.map );
	});
});

Meteor.startup( function() {
	Deps.autorun( function() {
		if( Meteor.isClient ) {
			if( !Meteor.map ) {
				var map = L.mapbox.map( "map", "streed.map-bu0r9jyo" );
				Meteor.map = map;

				map.locate();

				map.addControl( L.mapbox.geocoderControl( "streed.map-bu0r9jyo" ) );

				Meteor.autosubscribe( function() {
					Slacklines.find().observe({
						added: function( d ) {
							var loc = d.loc;
							addSlacklineMarker( d.name, d.description, loc.lat, loc.lng );
						}
					});
				});

				Meteor.autosubscribe( function() {
					SlacklineEvents.find().observe({
						added: function( d ) {
							var loc = d.loc;
							addEventMarker( d.name, d.description, loc.lat, loc.lng );
						}
					});
				});

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

				/*map.markerLayer.on( "click", function( e ) {
					map.panTo( e.layer.getLatLng() );

					e.layer.unbindPopup();

					var feature = e.layer.feature;
					var info = "<legend>" + feature.properties.title + "</legend>" + feature.properties.description;
					
					
					$( ".mapContainer" ).removeClass( "otherDrawer" );
					$( "#eventTools" ).removeClass( "otherDrawer" );
					$(".mapContainer").toggleClass( "drawer" );		
					$("#mapTools").toggleClass( "drawer" );
					
					$( ".slacklineInfo" ).html( "<div class='row-fluid'>" + info + "</div>" );
					
				});*/

				var precipitation = L.tileLayer.wms( "http://nowcoast.noaa.gov/wms/com.esri.wms.Esrimap/obs", {
					format: "image/png",
				    	transparent: true,
				    	layers: "RAS_RIDGE_NEXRAD",
					opacity: 0.5
				}).addTo( map );

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

			addSlacklineMarker( name, description, lat, lng, length, type, Meteor.userId() );
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

Template.createEvent.events({
	"click .saveEvent": function() {
		if( Meteor.user() != undefined ) {
			var name = $(".eventName" ).val();
			var gps = $( ".slacklineGPS" ).val();
			var description = $(".eventDescription" ).val();
			var date = $(".eventDate" ).val();
			var facebook = $(".eventFacebook" ).val();

			gps = gps.split( " " );
			var lat = parseFloat( gps[0] );
			var lng = parseFloat( gps[1] );

			console.log( createEvent( { name: name, description: description, loc: { lat: lat, lng: lng }, lat: lat, lng: lng, date: date, facebook: facebook } ) );
			addEventMarker( name, description, lat, lng, date, date, Meteor.userId() );
		} else {
		}
	}
});
