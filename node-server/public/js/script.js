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

  var Map = Backbone.Model.extend({
    defaults:{
      lat: 51.505,
      lng: -0.09,
      zoom: 15,
      maxZoom: 8
    },
    getLocation: function() {
      return new L.LatLng(this.get("lat"), this.get("lng"));
    }
  });

  var Log = Backbone.View.extend({
    el:"#log_container",
    template:_.template($("#log-template").html()),
    initialize: function(){
      var ul = this.make("ul");
      $(this.el).append(ul);
    },
    render:function(message){
      $(this.el).find("ul").prepend(this.template({message:message}));
    }
  });

  var AppView = Backbone.View.extend({
    el:"#content",
    initialize:function(){
      this.map = new Map;
      this.log = new Log;

      _.bindAll(this, "onReady", "onAnnouncement");

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
    },
    onAnnouncement:function (msg) {
      this.log.render(msg);
    },
    onUsernames:function(data){
      console.log(data);
      this.usernames = data;
      //updateUserlist();
    },
    initializeMap: function(){
      var DotIcon = L.Icon.extend({ iconUrl: 'js/images/blue_dot_circle.png', shadowUrl: null, iconSize: new L.Point(38, 38), iconAnchor: new L.Point(19, 19), popupAnchor: new L.Point(0, 0) });
      var blueIcon = new DotIcon();
      var redIcon = new DotIcon('js/images/red_dot_circle.png');
      var map = new L.Map('map'), cloudmadeUrl = 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', cloudmade = new L.TileLayer(cloudmadeUrl, {maxZoom: this.map.get("maxZoom"), attribution: "cloudmade"});

        map.setView(this.map.getLocation(), this.map.get("zoom")).addLayer(cloudmade),
      my_marker = new L.Marker(this.map.getLocation(), {icon: blueIcon});
      map.addLayer(my_marker);
      player_markers = {};
    }
  });

  var app = new AppView;
});
