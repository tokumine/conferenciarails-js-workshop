//describe("Collection", function() {
//  beforeEach(function() {
//    this.mapStub = sinon.stub(window, "Map");
//    this.model = new Backbone.Model({
//      lat: 245,
//      lng: 123,
//      zoom: 23
//    });
//    this.mapStub.returns(this.model);
//    this.points = new Points();
//  });
//
//  afterEach(function() {
//    this.mapStub.restore();
//  });
//
//  it("should add a model", function() {
//    this.points.add({ id: 4, title: "Foo" });
//    this.points.add({ id: 5, title: "Foo" });
//    expect(this.points.length).toEqual(2);
//  });
//});
