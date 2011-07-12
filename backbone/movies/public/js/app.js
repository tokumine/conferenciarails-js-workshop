
  var Movie = Backbone.Model.extend({
    validate:function (attrs) {
      console.log(attrs);
      if (attrs.movie && "title" in attrs.movie && !attrs.movie.title.match(/\S/)) {
        return "Ey, the title cannot be empty!";
      }
      if (attrs.movie && "rating" in attrs.movie && !attrs.movie.rating) {
        return "Wow, you forgot to rate the film.";
      }
    }
  });

  var Movies = Backbone.Collection.extend({
    model: Movie,
    url: 'http://localhost:3000/movies'

    //localStorage: new Store("movies3")
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
      "worst": "worst",
      "all":  "all"
    },
    best:function (){},
    worst:function (){},
    all:function (){}
  });

  var App = Backbone.View.extend({
    el:"#movies",
    events:{
      'click input[type="submit"]':'onSubmit',
      'keypress input.title':'onEnterKey'
    },
    initialize: function () {

      $(this.el).append(this.make("ul"));

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
      var title   = $(this.el).find("input.title").val();
      var rating  = $(this.el).find("input.rating:checked").val();

      var success = this.movies.create({movie: {title: title, rating: rating}}, {error:this.showError});

      if (success) {
        $(this.el).find("input.title").val("");
        $(this.el).find("input.rating:checked").removeAttr("checked");
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
    },
    showWorstRated:function () {
      $(this.el).find("ul").empty();
      var b = this.movies.select(function(movie){return movie.get("rating") == 1});
      _.each(b, this.addMovie);
    }
  });

$(function(){
  var routes = new Routes;
  var app = new App;
  Backbone.history.start();
});
