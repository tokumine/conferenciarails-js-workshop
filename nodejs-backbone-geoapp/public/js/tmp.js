// Map setup
// custom markers

  // Socket.io Setup
  var usernames;
  var socket = io.connect(); // SET this to your IP :) (192.168.1.35)

  // register user with server
  var me = prompt('Hi there! Please enter your username')
  socket.emit('username', me);

  // when the user is all registered, setup geolocation
  socket.on('ready', function () {
    logger('You are now connected!');

    navigator.geolocation.getCurrentPosition(geoOk, geoErr, {maximumAge: 100, enableHighAccuracy: true});

    setInterval(function(){
      navigator.geolocation.getCurrentPosition(geoOk, geoErr, {maximumAge: 100, enableHighAccuracy: true});
    }, 5000);
  });

  // handle new users joining
  socket.on('announcement', function (msg){
    logger(msg);
  });

  // handle entire player list
  socket.on('usernames', function (data){
    usernames = data;
    updateUserlist();
  });

  // handle player list changing
  socket.on('location_data', function (user, data){
    usernames[user] = data;

    // add markers or update player marker location
    var p_loc = new L.LatLng(data.latitude, data.longitude);
    if (player_markers[user] !== undefined) {
      player_markers[user].setLatLng(p_loc);
    } else {
      var p_marker = new L.Marker(p_loc, {icon: redIcon});
      map.addLayer(p_marker);
      player_markers[user] = p_marker;
    }

    // update user list log
    updateUserlist();
  });

  function logger(message){
    $('#log').append('<li>' + message + '</li>')
  }

  function geoOk(position){
    // show your location in log
    $('#my_location').html(positionToString(position.coords));

    // centre map on your location
    var you = new L.LatLng(position.coords.latitude, position.coords.longitude);
    map.setView(you, map.getZoom());

    // update your marker position
    my_marker.setLatLng(you);

    // sent your location to all the other users
    socket.emit('update_location', position.coords);
  }

  function geoErr(){
    logger('Unable to determine your location.');
  }

  function positionToString(pos){
    return "lat: " + pos.latitude + ", long: " + pos.longitude + ", accuracy: " + pos.accuracy
  }

  function updateUserlist(){
    $('#users').html('');

    _.each(usernames, function(position, user){
      if (user !== me){
        $('#users').append(user + ": " + positionToString(position) + '<br/>');
      }
    });
  }

