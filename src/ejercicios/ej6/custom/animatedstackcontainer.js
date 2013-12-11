define(["base", "containers", "regions"], function(Base, Containers, Regions) {
  "use strict";

  var AnimatedNavBar = Containers.StackContainer.DefaultNavBarView.extend({
    titleRegionType: Regions.SlideItemRegion,
    leftButtonRegionType: Regions.FadeItemRegion
  });

  var AnimatedStackContainer = Containers.StackContainer.extend({
    contentRegionType: Regions.SlideRegion,
    navBarRegionType: Base.FrameRegion,
    navBarType: AnimatedNavBar,
  });

  return AnimatedStackContainer;
});
