/*global window, navigator, document*/
define(["backbone", "jquery", "hammer"], function(Backbone, $, hammer) {
  "use strict";

  /* Initialize */

  function start() {
    hammer(document.body).on("swipeleft", function() {
      window.location.reload();
    });
  }

  $(function() {
    if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android)/) && !window.deviceReady) {
      document.addEventListener("deviceready", start, false);
    } else {
      start();
    }
  });
});
