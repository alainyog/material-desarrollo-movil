/* global window, navigator, document */
define(["jquery", "backbone", "hammer", "base", "containers", "templates"], function($, Backbone, hammer, Base, Containers, JST) {
  "use strict";

  function startApp() {

    var vent = new Base.Vent();

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

    var screen1 = new Screen1(),
        screen2 = new Screen2(),
        screen3 = new Screen3();

    var sc = new Containers.StackContainer();
    sc.push(screen1);

    vent.fordwardAll([screen1, screen2, screen3]);

    vent.on("all", console.log.bind(console));

    vent.on("to:screen2", function() {
      sc.push(screen2);
    });

    vent.on("to:screen3", function() {
      sc.push(screen3);
    });

    var appWindow = new Base.Region({$el: $("body")});
    appWindow.show(sc);

  }

  /* Initialize */

  function start() {
    hammer(document.body).on("swipeleft", function() {
      window.location.reload();
    });

    startApp();
  }

  $(function() {
    if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android)/) && !window.deviceReady) {
      start();
      document.addEventListener("deviceready", start, false);
    } else {
      start();
    }
  });

});
