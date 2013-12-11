define(["base", "containers"], function(Base, Containers) {
  "use strict";

  var ListScrollContainer = Containers.InertialScrollContainer.extend({
    // TODO in SimpleScroll or InertialScrollContainer
    // 1. The base class manages the scroll by itself, and calls #onScroll
    //   - The default #onScroll does the translation
    //   - Bounded in #getBoundaries()
    //   - In X and/or Y, defined by some options

    // TODO in ListScrollContainer
    // 2. #onScroll recieves the coordinates!
    //   - ListScrollContainer calculates the height of a children
    //   - Intersects the visible region with the "shown" children
    //   - Moves the visible window with "translate()"

    // TODO: For parallax: Just use a dummy ParallaxScrollContainer which:
    //  1. His content is a Layout
    //  2. onScroll: Doesn't do anything! Just calls the onScroll of the Layout
    //    - wich, in turn, will move its own regions
    //    - this regions will be absolutely positioned, overlapping
    //    - Tada!

    // TODO: For rubber-banding: Easy!
    // 1. Override the getBoundaries() to give one more "screen-size"
    //    - before and after the real boundaries
    // 2. #onStop will then program an animation to fit the boundaries

    // TODO: Don't forget to update the /ej3 folder!!
  });

  var ListContainer = Base.FrameLayout.extend({
  });

  return ListContainer;

});
