define(["jquery", "backbone", "base", "containers", "templates", "../fragments/list.js", "../fragments/details.js"], function($, Backbone, Base, Containers, JST, ListFragment, DetailFragment) {
  "use strict";

  var TabletLayout = Base.FrameLayout.extend({
    initialize: function() {
    },
    regions: {
      list: {
        selector: ".list",
        regionType: Base.FrameRegion
      },
      details: {
        selector: ".details",
        regionType: Base.FrameRegion
      },
    },
    onResize: function(box) {
      var listW = 0.35 * box.width,
          listFrame = this.regions.list.getFrame(),
          detailFrame = this.regions.details.getFrame();
      listFrame.setBox({width: listW, height: box.height});
      detailFrame.setBox({
        width: box.width - listW,
        height: box.height,
        y: 0,
        x: listW
      });
    },
    template: JST["ejercicios/testtabletlayout"]
  });

  return Base.Activity.extend({
    start: function() {
      var sc = new Containers.StackContainer(),
          vent = new Base.Vent(),
          tLayout = new TabletLayout(),
          list = (new ListFragment()).start().getMainView(),
          detail = (new DetailFragment()).start().getMainView().render();

      tLayout.title = "Spanish Cylons";
      sc.push(tLayout);

      vent.forwardAll([list.vent, detail]);

      vent.on("list:item:selected", function(data) {
        detail.setData(data);
        tLayout.regions.details.show(detail);
      });

      tLayout.regions.list.show(list);

      sc.on("show", function() {
        list.start();
      });

      this.mainView = sc;
    },
  });

});
