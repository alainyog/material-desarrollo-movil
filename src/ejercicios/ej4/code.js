/* global window, navigator, document */
define(["jquery", "backbone", "hammer", "base", "activities/test.js"], function($, Backbone, hammer, Base, TestActivity) {
  "use strict";

    // Fragment es como activity, pero para trozos independientes del código
    // (inicialización parcial propia, como por ejemplo una vista ListContainer
    //  que lee los datos de cierto lugar etc...)

    // TODO: ActivityManager o FragmentManager para cargar descripciones?
    //      * También algo para seleccionar entre tablet/teléfono
    //      * También para seleccionar orientación
    //      * O sea, que puede cambiar dinámicamente?


  function startApp() {

    var win = Base.App.getWindow(),
        testScreen = new TestActivity();
    testScreen.start();
    win.show(testScreen.getMainView());

  }

  /* Initialize */

  function start() {
    hammer(document.body).on("swipeleft", function() {
      window.location.reload();
    });

    $("body").on("touchstart", ".topcoat-button, .button", function(e) {
      $(e.currentTarget).addClass("active");
    }).on("touchend", ".topcoat-button, .button", function(e) {
      $(e.currentTarget).removeClass("active");
    }).on("touchcancel", ".topcoat-button, .button", function(e) {
      $(e.currentTarget).removeClass("active");
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
