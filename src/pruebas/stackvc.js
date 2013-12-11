/* global window, navigator, document */
define(["jquery", "backbone", "hammer", "base", "containers"], function($, Backbone, hammer, Base, Containers) {
  "use strict";

  function startApp() {
    var SomeView = Base.ItemView.extend({
      initialize: function(options) {
        this.template = _.template("<h1>"+options.msg+"</h1>");
      },
    });

    var appWindow = new Base.Region({$el: $("body")});

    /*

    var tc2 = new Containers.TabContainer();
    tc2.addTab({title: "Tab 1"}, new SomeView({msg: "One"}));
    tc2.addTab({title: "Tab 2"}, new SomeView({msg: "Two"}));
    tc2.addTab({title: "Tab 3"}, new SomeView({msg: "Three"}));
    // tc2.tabBar.childVent.on("all", console.log.bind(console));

    */

    var tc = new Containers.TabContainer();
    tc.addTab({title: "Tab 1"}, new SomeView({msg: "Uno"}));
    tc.addTab({title: "Tab 2"}, new SomeView({msg: "Dos"}));
    tc.addTab({title: "Tab 3"}, new SomeView({msg: "Tres"}));

    var sc = new Containers.StackContainer();
    tc.title = "Pestañas";
    var sv = new SomeView({msg: "Vista"});
    sv.title = "Some View";
    sc.push(sv);
    sc.push(tc);

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
