
  var Movie = Backbone.Model.extend({
    validate:function (attrs) {
      if ("title" in attrs && !attrs.title.match(/\S/)) {
        return "Error, title cannot be empty";
      }
    }
  });

  var Movies = Backbone.Collection.extend({
    model: Movie,
    localStorage: new Store("movies_")
  });

  var MovieView = Backbone.View.extend({
    tagName:"li",
    events:{
      'click span.remove':'remove'
    },
    template:_.template($("#movie-template").html()),
    initialize:function() {
      this.render();
    },
    render:function(){
      $(this.el).append(this.template(this.model.toJSON()));
      return this;
    },
    remove:function() {
      $(this.el).remove();
      this.model.destroy();
    }
  });

  var Routes = Backbone.Router.extend({
    routes: {
      "best": "best",
      "all":  "all"
    },
    best:function (){
    },
    all:function (){
    }
  });

  var App = Backbone.View.extend({
    el:"#movies",
    events:{
      'click input[type="submit"]':'onSubmit',
      'keypress input.title':'onEnterKey'
    },
    initialize: function () {

      $(this.el).append(this.make("ul"));

      _.bindAll(this, "addMovie", "addAllMovies", "showBestRated", "showAll");

      this.router = new Routes;
      this.router.bind("route:best", this.showBestRated);
      this.router.bind("route:all", this.showAll);

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
      var title   = $(this.el).find("input.title").val();
      var rating  = $(this.el).find("input.rating:checked").val();

      var success = this.movies.create({title: title, rating: rating}, {error:this.showError});

      if (success) {
        $(this.el).find("input.title").val("");
        $(this.el).find("input.rating").eq(0).click();
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
      $(this.el).find("ul").empty();
      this.addAllMovies();
    },
    showBestRated:function () {
      $(this.el).find("ul").empty();
      var b = this.movies.select(function(movie){return movie.get("rating") == 5});
      _.each(b, this.addMovie);
    }
  });

$(function(){
  var routes = new Routes;
  var app = new App;
  Backbone.history.start();
});
