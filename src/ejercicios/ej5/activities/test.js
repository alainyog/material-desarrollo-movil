define(["jquery", "backbone", "hammer", "base", "containers", "templates", "custom/components.js"], function($, Backbone, hammer, Base, Containers, JST, Components) {
  "use strict";

  var Screen1 = Base.ItemView.extend({
    template: JST["ejercicios/ej1/screen1"],
    title: "Pantalla 1",
    className: "vertical box",
    triggers: {
      "touchstart #to-scrn-2": "to:screen2",
      "touchstart #to-scrn-3": "to:screen3",
    },
  });

  var Screen2 = Base.ItemView.extend({
    template: JST["ejercicios/ej1/screen2"],
    title: "Pantalla 2",
    className: "vertical box",
  });

  var Screen3 = Base.ItemView.extend({
    template: JST["ejercicios/ej1/screen3"],
    title: "Pantalla 3",
    className: "vertical box",
  });

  return Base.Activity.extend({
    start: function() {
      var screen1 = new Screen1(),
          screen2 = new Screen2(),
          screen3 = new Screen3();

      var sc = new Components.AnimatedStackContainer();

      var scroll = new Containers.InertialScrollContainer();
      scroll.show(screen1);
      scroll.title = screen1.title;

      sc.push(scroll);

      this.vent.forwardAll([screen1, screen2, screen3]);

      this.vent.on("to:screen2", function() {
        sc.push(screen2);
      });

      this.vent.on("to:screen3", function() {
        sc.push(screen3);
      });

      this.mainView = sc;
    },
  });

});
