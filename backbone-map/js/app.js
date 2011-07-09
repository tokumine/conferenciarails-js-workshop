$(function() {
  var PointView = Backbone.View.extend({
    initialize: function(){
      _.bindAll(this, "render", "dragMarker");

      this.model.bind('change', this.render);
      this.model.marker = new google.maps.Marker({ position: this.model.getLatLng(), map: canvas, draggable:true});

      google.maps.event.addListener(this.model.marker, 'dragend', this.dragMarker);
    },
    dragMarker: function (event) {
      this.model.save({lat:event.latLng.lat(), lng:event.latLng.lng()});
    },
    render:function(){
      this.model.marker.setPosition(this.model.getLatLng());
    }
  });

  var MapView = Backbone.View.extend({
    el: $("#map"),
    initialize: function(){
      this.map = new Map;

      this.points = new Points;
      this.render();

      _.bindAll(this, 'addOne', 'addAll');

      this.points.bind('reset', this.addAll);
      this.points.fetch();

      var that = this;
      google.maps.event.addListener(canvas, 'click', function(event) {
        that.clickMap(event.latLng);
      });
    },
    addAll: function() {
      this.points.each(this.addOne);
    },
    addOne: function(point) {
      var view = new PointView({ model: point });
      view.render();
    },
    clickMap:function(latLng){
      var point = new Point({lat:latLng.lat(), lng:latLng.lng()});
      this.points.create(point);

      var view = new PointView({ model: point });
      view.render();
    },
    render: function() {
      canvas = new google.maps.Map(document.getElementById(this.el.attr("id")), this.map.getOptions());
    }
  });

  window.mapView = new MapView;
});
