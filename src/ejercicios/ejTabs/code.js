/* global window, navigator, document */
define(["jquery", "backbone", "hammer", "base", "containers", "templates"], function($, Backbone, hammer, Base, Containers, JST) {
  "use strict";


  function startApp() {

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

    var screen2 = new Screen2(),
        screen3 = new Screen3();

    var tabs = new Containers.TabContainer();
    tabs.addTab({title: "Uno"}, screen2);
    tabs.addTab({title: "Dos"}, screen3);

    var appWindow = new Base.Region({$el: $("body")});
    appWindow.show(tabs);

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
