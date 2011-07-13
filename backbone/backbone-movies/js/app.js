var Movie = Backbone.Model.extend({
  validate:function (attrs) {
    if ("title" in attrs && !attrs.title.match(/\S/)) {
      return "Ey, the title cannot be empty!";
    }
    if ("rating" in attrs && !attrs.rating) {
      return "Wow, you forgot to rate the film.";
    }
  }
});

var Movies = Backbone.Collection.extend({
  model: Movie,
  localStorage: new Store("movies")
});

var MovieView = Backbone.View.extend({
  tagName:"li",
  events:{
    'click span.remove':'remove'
  },
  template:_.template($("#movie-template").html()),
  initialize:function() {
    _.bindAll(this, "onSuccessRemoving");
    this.render();
  },
  render:function(){
    $(this.el).append(this.template(this.model.toJSON()));
    return this;
  },
  remove:function () {
    this.model.destroy({success:this.onSuccessRemoving});
  },
  onSuccessRemoving: function () {
    $(this.el).fadeOut();
  }

});

var Routes = Backbone.Router.extend({
  routes: {
    "best": "best",
    "worst": "worst",
    "all":  "all"
  },
  best:function (){},
  worst:function (){},
  all:function (){}
});

var App = Backbone.View.extend({
  el:$("#movies"),
  events:{
    'click input[type="submit"]':'onSubmit',
    'keypress input.title':'onEnterKey'
  },
  initialize: function () {

    this.el.append(this.make("ul"));

    _.bindAll(this, "addMovie", "addAllMovies", "showBestRated", "showWorstRated", "showAll");

    this.router = new Routes;
    this.router.bind("route:best",  this.showBestRated);
    this.router.bind("route:worst", this.showWorstRated);
    this.router.bind("route:all",   this.showAll);

    this.movies = new Movies;
    this.movies.bind("add", this.addMovie);
    this.movies.bind("reset", this.addAllMovies);
    this.movies.fetch();
  },
  onEnterKey:function (event) {
    if (event.keyCode == 13) { // 13 == Enter
      this.onSubmit();
    }
  },
  onSubmit:function () {
    var title   = this.$("input.title").val();
    var rating  = this.$("input.rating:checked").val();

    var success = this.movies.create({title: title, rating: rating}, {error:this.showError});

    if (success) {
      this.$("input.title").val("");
      this.$("input.rating:checked").removeAttr("checked");
    }
    this.router.navigate("all", true);
  },
  addAllMovies:function(){
    this.movies.each(this.addMovie);
  },
  addMovie:function(movie){
    var view = new MovieView({model:movie});
    $(this.el).find("ul").prepend(view.el);
  },
  showError:function(model, error) {
    alert(error);
  },
  showAll:function () {
    this.$("ul").empty();
    this.addAllMovies();
  },
  showBestRated:function () {
    this.$("ul").empty();
    var b = this.movies.select(function(movie){return movie.get("rating") == 5});
    _.each(b, this.addMovie);
  },
  showWorstRated:function () {
    this.$("ul").empty();
    var b = this.movies.select(function(movie){return movie.get("rating") == 1});
    _.each(b, this.addMovie);
  }
});

$(function(){
  var app = new App;
  Backbone.history.start();
});
