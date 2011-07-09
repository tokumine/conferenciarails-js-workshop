var canvas;
$(function() {
  var PointView = Backbone.View.extend({
    initialize: function(){
      _.bindAll(this, "render", "dragMarker", "openInfowindow");

      this.model.bind('change', this.render);
      this.model.marker = new google.maps.Marker({ position: this.model.getLatLng(), map: canvas, draggable:true});

      google.maps.event.addListener(this.model.marker, 'dragend', this.dragMarker);
      google.maps.event.addListener(this.model.marker, 'click', this.openInfowindow);
    },
    dragMarker: function (event) {
      this.model.save({lat:event.latLng.lat(), lng:event.latLng.lng()});
    },
    closeInfowindow: function (event) {
      if (this.model.infowindow) {
        this.model.infowindow.close();
      }
    },
    openInfowindow: function (event) {
      this.model.collection.closeInfowindows();

      if (!this.model.infowindow) {
        this.model.infowindow = new google.maps.InfoWindow({ content: "<input type='text' class='t' /><br />"  + JSON.stringify(this.model) });
      }
      this.model.infowindow.open(canvas,this.model.marker);
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
