define(["jquery", "backbone", "base", "../custom/components.js", "../fragments/list.js", "../fragments/details.js"], function($, Backbone, Base, Components, ListFragment, DetailFragment) {
  "use strict";


  return Base.Activity.extend({
    start: function() {

      var sc = new Components.AnimatedStackContainer(),
          vent = new Base.Vent(),
          list = (new ListFragment()).start().getMainView(),
          detail = (new DetailFragment()).start().getMainView().render();

      list.title = "Spanish Cylons";
      sc.push(list);

      vent.forwardAll([list.vent, detail]);

      vent.on("list:item:selected", function(data) {
        detail.setData(data);
        sc.push(detail);
      });

      sc.on("show", function() {
        list.start();
      });

      this.mainView = sc;
    },
  });

});
