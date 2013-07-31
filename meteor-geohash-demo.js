if (Meteor.isClient) {

  ee = new EventEmitter2();

  ee.on('init geohash coords', function (data) {
    ee.emit('new geohash coords', data, {force: true});
  });

  ee.on('new geohash coords', function (data, opts) {
    if (typeof opts === 'undefined')
      var opts = {force:false};

    if (opts['force'] || typeof lock ==='undefined' || (Date.now()-lock)>1000) {
      lock = Date.now();
    } else {
      return;
    }
    console.log('new coords:'+data);
    var lat = data[0],
        lon = data[1];
    if ( (typeof newCenter ==='undefined')
      || (newCenter.lat() !== lat) || (newCenter.lng() !== lon) ) {
      
      newCenter = new google.maps.LatLng(lat, lon );
      newGeohash = geohash.encode(newCenter.lat(),newCenter.lng(), 5);
      newGeoCenter = geohash.decode(newGeohash);
      var ng = new google.maps.LatLng(newGeoCenter[0], newGeoCenter[1])

      if (typeof currGeohash == 'undefined')
        currGeohash = 'default';

      // Draw the marker only if changed geohash
      if ((typeof map !== 'undefined') && (newGeohash !== currGeohash)) {
        ee.emit('draw new marker', [ng.lat(), ng.lng(), newGeohash] );
        map.panTo( ng );
        currGeohash = newGeohash;
      }

      // Meteor.Router.to('/'+newGeohash);
    }
  });

  // Draw the new geohash position
  ee.on('draw new marker', function(data) {
    var lat = data[0],
        lon = data[1],
        label = data[2];
    console.log('draw: '+label);
    new MarkerWithLabel({
      title: lat+" "+lon,
      labelContent: label,
      labelAnchor: new google.maps.Point(22, 0),
      labelClass: "labels", // the CSS class for the label
      labelStyle: {opacity: 0.75},
      position: new google.maps.LatLng(lat, lon), map: map
    });
  });

  Template.map.rendered = function() {  
    var mapOptions = {
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("map-canvas"),
      mapOptions); 

    if (typeof newCenter !== 'undefined')
      var p2 = newCenter;
    else
      var p2 = new google.maps.LatLng('45.0878', '7.5585');

    ee.emit('draw new marker', [p2.lat(), p2.lng(), 'base']);
    map.panTo(p2);
 
    // GMaps events
    google.maps.event.addListener(map, 'center_changed', function() {
      Meteor.setTimeout(function() {
        ee.emit('new geohash coords', [map.getCenter().lat(), map.getCenter().lng()] );
      }, 2000); // move threasold
    });

    Session.set('map', true);
  };

}