$(function(){

  var User = Backbone.Model.extend({
    defaults:{
      me: false
    },
    initialize:function() {
      this.bind("change", function(){
        app.socket.emit('username', this.get("username"));
      });
    }
  });

  var UserView = Backbone.View.extend({
    el:"#user",
    events: {
      "keypress input":"onEnterKey"
    },
    initialize:function(){
      _.bindAll(this, "onEnterKey");
    },
    onEnterKey:function (e) {
      if (e.keyCode == 13) { // 13 == Enter
        this.model.set({username:e.target.value});
        $(this.el).find("input").fadeOut("slow");
      }
    }
  });

  var UserList = Backbone.Collection.extend({
    model:User
  });

  var Map = Backbone.Model.extend({
    defaults:{
      lat: 51.505,
      lng: -0.09,
      zoom: 15,
      maxZoom: 20
    },
    getLocation: function() {
      return new L.LatLng(this.get("lat"), this.get("lng"));
    }
  });

  var UserListView = Backbone.View.extend({
    el:"#users",
    template:_.template($("#userlist-template").html()),
    initialize: function(){
      _.bindAll(this, "render", "refresh");
    },
    refresh:function(){
      $(this.el).html("");
      this.collection.each(this.render);
    },
    render:function(user){
      console.log(user);
       $(this.el).append(this.template(user.toJSON()));
      return this;
    }
  });

  var Log = Backbone.View.extend({
    el:"#log_container",
    template:_.template($("#log-template").html()),
    initialize: function(){
      $(this.el).append(this.make("ul"));
    },
    render:function(message){
      $(this.el).find("ul").prepend(this.template({message:message}));
    }
  });

  var Navigator = Backbone.View.extend({
    initialize:function(){
      _.bindAll(this, "locate", "geoOk", "geoErr");

      this.locate();
      setInterval(this.locate, 5000);
    },
    locate:function(){
      navigator.geolocation.getCurrentPosition(this.geoOk, this.geoErr, {maximumAge: 100, enableHighAccuracy: true});
    },
    geoOk:function(position){
      // show your location in log
      $('#my_location').html(this.positionToString(position.coords));

      // centre map on your location
      var you = new L.LatLng(position.coords.latitude, position.coords.longitude);
      console.log(app.mapCanvas.getZoom());
      app.mapCanvas.setView(you, app.mapCanvas.getZoom());

      // update your marker position
      app.my_marker.setLatLng(you);

      // sent your location to all the other users
      app.socket.emit('update_location', position.coords);
    },
    geoErr:function(){
      app.log.render('Unable to determine your location.');
    },
    positionToString:function(pos){
      return "lat: " + pos.latitude + ", long: " + pos.longitude + ", accuracy: " + pos.accuracy
    }
  });

  var AppView = Backbone.View.extend({
    el:"#content",
    initialize:function(){
      this.map = new Map;
      this.log = new Log;
      this.userList = new UserList;
      this.userListView = new UserListView({collection:this.userList});

      _.bindAll(this, "onReady", "onAnnouncement", "onUsernames", "addUser");

      this.socket = io.connect(); // SET this to your IP :) (192.168.1.35)
      this.socket.on('ready', this.onReady);
      this.socket.on('announcement', this.onAnnouncement);
      this.socket.on('usernames', this.onUsernames);

      this.user = new User({me:true});
      this.userView = new UserView({model:this.user});

      this.initializeMap();
    },
    onReady:function(){
      this.log.render('You are now connected!');
      this.navigator = new Navigator;
    },
    onAnnouncement:function (msg) {
      this.log.render(msg);
    },
    onUsernames:function(data){
      this.userList.reset();
      _.each(data, this.addUser);
    },
    addUser:function(status, username){
      var user = {username:username, status:status};
      this.userList.add(user);
      this.userListView.refresh();
    },
    initializeMap: function(){
      var DotIcon = L.Icon.extend({ iconUrl: 'js/images/blue_dot_circle.png', shadowUrl: null, iconSize: new L.Point(38, 38), iconAnchor: new L.Point(19, 19), popupAnchor: new L.Point(0, 0) });
      var blueIcon = new DotIcon();
      var redIcon = new DotIcon('js/images/red_dot_circle.png');

      this.mapCanvas = new L.Map('map'), cloudmadeUrl = 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', cloudmade = new L.TileLayer(cloudmadeUrl, {maxZoom: this.map.get("maxZoom"), attribution: "cloudmade"});

        this.mapCanvas.setView(this.map.getLocation(), this.map.get("zoom")).addLayer(cloudmade),
      this.my_marker = new L.Marker(this.map.getLocation(), {icon: blueIcon});
      this.mapCanvas.addLayer(this.my_marker);
      player_markers = {};
    }
  });

  var app = new AppView;
});
