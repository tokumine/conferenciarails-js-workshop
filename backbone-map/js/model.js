var Map = Backbone.Model.extend({
  defaults: {
    lat:"-34.397",
    lng:"150.644",
    zoom: 8,
    mapType: google.maps.MapTypeId.ROADMAP
  },
  validate:function(attrs){
    if ("lat" in attrs && !isNumber(attrs.lat)) {
      return "Error, lat should be a number";
    }
    if ("lng" in attrs && !isNumber(attrs.lng)) {
      return "Error, lng should be a number";
    }
  },
  initialize: function(){
    this.bind("error", function(model, message) {
      console.log(message);
    });
  },
  getOptions:function(){
    return { zoom: this.get("zoom"), center: new google.maps.LatLng(this.get("lat"), this.get("lng")), mapTypeId: this.get("mapType") };
  }
});

var Point = Backbone.Model.extend({
  validate:function(attrs){
    if ("lat" in attrs && !isNumber(attrs.lat)) {
      return "Error, lat should be a number";
    }
    if ("lng" in attrs && !isNumber(attrs.lng)) {
      return "Error, lng should be a number";
    }
  },
  getLatLng:function() {
    return new google.maps.LatLng(this.get("lat"), this.get("lng"));
  },
});

var Points = Backbone.Collection.extend({
  model:Point,
  localStorage: new Store("points")
});
