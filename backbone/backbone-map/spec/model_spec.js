function validateAttr(ob, p, msg) {

  var eventSpy = sinon.spy();
  ob.bind("error", eventSpy);

  ob.set(p);

  expect(eventSpy).toHaveBeenCalledOnce();
  expect(eventSpy).toHaveBeenCalledWith(ob, msg);
}

describe("Map", function() {

  beforeEach(function() {
    this.map = new Map;

    // custom functions
    this.validateAttr = validateAttr;
  });

  it('should have a default lat', function() {
    expect(this.map.get('lat')).toBeDefined();
  });

  it('should have a default lng', function() {
    expect(this.map.get('lng')).toBeDefined();
  });

  it('should have a default zoom', function() {
    expect(this.map.get('zoom')).toBeDefined();
  });

  it('should have a default mapType', function() {
    expect(this.map.get('mapType')).toBeDefined();
  });

  it("should store a valid lat", function() {
    this.validateAttr(this.map, {lat: "hello"}, "Error, lat should be a number");
  });

  it("should store a valid lng", function() {
    this.validateAttr(this.map, {lng: "hello"}, "Error, lng should be a number");
  });

  it("should be able to store the current location of the user", function() {
    this.map.set({lat:123, lng:234});
    expect(this.map.get("lat")).toEqual(123);
    expect(this.map.get("lng")).toEqual(234);
  });

  it("should return the options", function() {
    this.map.set({zoom:12, lat:1, lng:2});
    var options = { zoom: 12, center: new google.maps.LatLng(1,2), mapTypeId: google.maps.MapTypeId.ROADMAP }
    expect(this.map.getOptions()).toEqual(options);
  });

});

describe("Point", function() {
  beforeEach(function() {
    this.point = new Point;
    this.validateAttr = validateAttr;
  });

  it("should store a valid lat", function() {
    this.validateAttr(this.point, {lat: "hello"}, "Error, lat should be a number");
  });

  it("should store a valid lng", function() {
    this.validateAttr(this.point, {lng: "hello"}, "Error, lng should be a number");
  });
});

describe("Collection", function() {
  beforeEach(function() {
    this.points = new Points();

    // Point stub
    // this.pointStub = sinon.stub(window, "Point");
    // this.model = new Backbone.Model({ lat: 245, lng: 123 });
    // this.pointStub.returns(this.model);
  });

  afterEach(function() {
    // this.pointStub.restore();
  });

  it("should be able to add models", function() {
    this.points.add({ lat: 123, lng:245 });
    this.points.add({ lat: 123, lng:245 });
    expect(this.points.length).toEqual(2);
  });

  it("should be able to add models", function() {
    this.points.add({ lat: 123, lng:"x245" });
    this.points.add({ lat: 123, lng:245 });
    expect(this.points.length).toEqual(1);
  });
});
