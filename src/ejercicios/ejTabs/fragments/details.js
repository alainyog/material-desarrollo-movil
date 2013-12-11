define(["jquery", "backbone", "base", "containers", "templates"], function($, Backbone, Base, Containers, JST) {
  "use strict";

  var DetailView = Base.ItemView.extend({
    setData: function(data) {
      this.title = data.full.name.split(" ")[0];
      this.$(".name").html(data.full.name);
      this.$(".phone").html(data.full.phone);
      this.$(".avatar").attr("src", data.full.avatar);
    },
    render: function() {
      if (!this.rendered) {
        DetailView["__super__"].render.apply(this, arguments);
        this.rendered = true;
      }
      return this;
    },
    template: JST["ejercicios/details"]
  });

  return Base.Activity.extend({
    start: function() {
      this.mainView = new DetailView();
      return this;
    }
  });

});
