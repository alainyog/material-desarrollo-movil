define(["base"], function(Base) {
  "use strict";

  var SlideRegion = Base.FrameRegion.extend({
    show: function(view, dir) {
      this.forward = !dir; // true or false
      SlideRegion["__super__"].show.call(this, view);
    },
    animationClass: "slide",
    open: function(view) {
      this.el = this.$el.get(0);
      var from = this.currentView,
          anim = this.animationClass,
          inName = (this.forward? "in" : "out"),
          outName = (this.forward? "out" : "in"),
          offsetWidth,
          width;

      view.$el.addClass("trans");

      if (!from) {
        SlideRegion["__super__"].open.call(this, view);
      } else {
        width = from.$el.width();

        // from.$el.css({width: width + "px"});
        // view.$el.css({width: width + "px"});

        this.$el.append(view.render().el);
        view.$el.removeClass("center " + outName).addClass(anim + " trans " + inName);
        view.el.scrollTop = 0;
        /* Force reflow */
        offsetWidth = this.el.offsetWidth;
        from.$el.one("webkitTransitionEnd", _.bind(function() {
          // from.$el.css("width", "");

          from.stopListening();
          from.remove();
        }, this));
        view.$el.one("webkitTransitionEnd", function() {
          // view.$el.css("width", "");

          view.$el.removeClass("center").addClass("final");
        });
        view.$el.removeClass(inName).addClass("center");
        from.$el.removeClass("center " + inName).addClass(anim + " trans " + outName);
      }
    },
    close: function() {
      return "Here to override parent";
    }
  });

  return SlideRegion;
});
