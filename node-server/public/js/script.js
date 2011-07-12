$(function(){

  var User = Backbone.Model.extend({
    defaults:{
      me: false
    },
    initialize:function() {
      this.bind("change:username", function(){
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
        var username = e.target.value;
        this.model.set({username:username});

        $(this.el).find("input").fadeOut("slow", function() {
          $(this).parent().append("Welcome, " + username);
        });
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

  var MapView = Backbone.View.extend({
    initialize: function(){
      this.map = new Map;

      var DotIcon = L.Icon.extend({
        iconUrl: 'js/images/blue_dot_circle.png',
        shadowUrl: null,
        iconSize: new L.Point(38, 38),
        iconAnchor: new L.Point(19, 19),
        popupAnchor: new L.Point(0, 0)
      });

      this.blueIcon = new DotIcon();
      this.redIcon  = new DotIcon('js/images/red_dot_circle.png');

      cloudmadeUrl = 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png';
        cloudmadeLayer = new L.TileLayer(cloudmadeUrl, {maxZoom: this.map.get("maxZoom"), attribution: "cloudmade"});

      this.canvas = new L.Map('map'), cloudmadeUrl, cloudmadeLayer;

      this.setView(this.map.getLocation(), this.map.get("zoom")).addLayer(cloudmadeLayer),
      this.my_marker = new L.Marker(this.map.getLocation(), {icon: this.blueIcon});

      this.addLayer(this.my_marker);
    },
    addLayer:function(layer){
      this.canvas.addLayer(layer);
    },
    setView:function(location, zoom){
      return this.canvas.setView(location, zoom);
    },
    getZoom:function () {
      return this.canvas.getZoom();
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
      $(this.el).append(this.template(user.toJSON()));
      return this;
    }
  });

  /* LOG SYSTEM */
  var LogItem = Backbone.Model.extend({});

  var LogList = Backbone.Collection.extend({
    model:LogItem
  });

  var Log = Backbone.View.extend({
    el:"#log_container",
    template:_.template($("#log-template").html()),
    initialize: function(){

      _.bindAll(this, "onAdd", "onReset");

      this.collection = new LogList;
      this.collection.bind("add", this.onAdd);
      this.collection.bind("reset", this.onReset);

      $(this.el).append(this.make("ul"));
    },
    add:function(message){
      this.collection.add({message: message});
      this.render(message);
    },
    onAdd:function () {
      if (this.collection.length > 25) {
        this.collection.reset();
      }
    },
    onReset:function () {
      $(this.el).find("ul").html("");
    },
    render:function(message){
      $(this.el).find("ul").prepend(this.template({message:message}));
    }
  });

  /* NAVIGATOR */
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
      app.map.setView(you, app.map.getZoom());

      // update your marker position
      app.map.my_marker.setLatLng(you);

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
      this.map = new MapView;

      this.player_markers = {};
      this.log = new Log;
      this.userList = new UserList;
      this.userListView = new UserListView({collection:this.userList});

      _.bindAll(this, "onReady", "onAnnouncement", "onUsernames", "onLocationData", "addUser");

      // Socket configuration && bindings
      this.socket = io.connect('localhost'); // if remote SET this to your IP :) ('192.168.1.35')
      this.socket.on('ready', this.onReady);
      this.socket.on('announcement', this.onAnnouncement);
      this.socket.on('usernames', this.onUsernames);
      this.socket.on("location_data", this.onLocationData);

      this.user = new User({me:true});
      this.userView = new UserView({model:this.user});

    },
    onReady:function(){
      this.log.add('You are now connected!');
      this.navigator = new Navigator;
    },
    onAnnouncement:function (msg) {
      this.log.add(msg);
    },
    onUsernames:function(data){
      this.updateUserList(data);
    },
    updateUserList:function(usernames){
      this.userList.reset();
      _.each(usernames, this.addUser);
    },
    onLocationData:function(user, data){
      // add markers or update player marker location
      var p_loc = new L.LatLng(data.latitude, data.longitude);

      if (this.player_markers && this.player_markers[user] !== undefined) {
        this.player_markers[user].setLatLng(p_loc);
      } else {
        var p_marker = new L.Marker(p_loc, {icon: this.map.redIcon});
        this.map.addLayer(p_marker);
        this.player_markers[user] = p_marker;
      }
    },
    addUser:function(status, username){
      var user = {username:username, status:status};
      this.userList.add(user);
      this.userListView.refresh();
    },
  });

  var app = new AppView;
});
