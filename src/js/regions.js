define([
  "regions/slideitemregion",
  "regions/fadeitemregion",
  "regions/slideregion"
], function(SlideItemRegion, FadeItemRegion, SlideRegion) {
  "use strict";
  return {
    SlideItemRegion: SlideItemRegion,
    FadeItemRegion: FadeItemRegion,
    SlideRegion: SlideRegion
  };
});
