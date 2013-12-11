/* global window */
define(["base", "containers/simplescrollcontainer"], function(Base, SimpleScrollContainer) {
  "use strict";

  var InertialScrollContainer = SimpleScrollContainer.extend({
    onStart: function() {
      if (this.animation) {
        this.animation.halt();
      }
    },
    onStop: function() {
      // Change accel to modify friction!
      var accel = Math.min(30, Math.abs(this.speed.y)),
          pos = this.getPosition(),
          swipeDir = this.speed.y/Math.abs(this.speed.y),
          to = pos.y + (accel * accel * swipeDir * this.direction);
      // CAREFUL: to can be NaN sometimes (when speed.y = 0 => division by 0)!
      this.animatedScrollTo({x: pos.x, y: to || pos.y}, accel * 30);
    },
    animatedScrollTo: function(destination, duration) {
      var box = this.getBoundaries(),
          pos = this.getPosition();
      this.animation = new Base.Animation({
        from: pos.y,
        to: destination.y,
        duration: duration,
        easing: "easeOutQuad",
        onStep: _.bind(this.onAnimationStep, this, box, pos),
        onFinish: _.bind(this.onAnimationFinish, this)
      });
    },
    onAnimationStep: function(box, pos, top) {
      var newPos = Math.max(box.min.y, Math.min(box.max.y, top));
      this.speed.y = (top - this.position.y);
      this.scrollTo({x: pos.x, y: newPos});
      if (top !== newPos) {
        this.animation.stop();
      }
    },
    onAnimationFinish: function() {
    }
  });

  var TranslateInertialScrollContainer = InertialScrollContainer.extend({
    direction: 1,
    getPosition: function() {
      var wt = this.$content.css("-webkit-transform"),
          mat = new window.WebKitCSSMatrix(wt);
      return {
        x: mat.m41,
        y: mat.m42
      };
    },
    getBoundaries: function() {
      return {
        min: {
          x: this.$el.width() - this.$content.width(),
          y: this.$el.height() - this.$content.height() - 50
        },
        max: { x: 0, y: 0 }
      };
    },
    moveTo: function(newPoint) {
      this.$content.css({
        "webkitTransform": "translate(" + newPoint.x + "px," + newPoint.y + "px)"
      });
    }
  });

  /*

  var Translate3DInertialScrollContainer = TranslateInertialScrollContainer.extend({
    moveTo: function(newPoint) {
      this.$content.css({
        "webkitTransform": "translate3d(" + newPoint.x + "px," + newPoint.y + "px, 0)"
      });
    },
  });

  var StarWarsInertialScrollContainer = TranslateInertialScrollContainer.extend({
    initialize: function() {
      this.$el.css({"webkitTransform": "rotateX(0)"});
    },
    moveTo: function() {
      this.$el.css({
        "webkitTransform": "rotateX("+(-this.speed.y/3)+"deg)"
      });
      StarWarsInertialScrollContainer["__super__"].moveTo.apply(this, arguments);
    },
    onAnimationFinish: function() {
      this.$el.css({ "webkitTransform": "rotateX(0)" });
    }
  });

  */

  var RubberBandScrollContainer = TranslateInertialScrollContainer.extend({
    getBoundaries: function() {
      var bound = this.getContentSize(),
          h = this.$el.height();
      return {
        original: bound,
        max: {x: bound.max.x, y: bound.max.y + h/2},
        min: {x: bound.min.x, y: bound.min.y - h/2},
      };
    },
    getContentSize: function() {
      return RubberBandScrollContainer["__super__"].getBoundaries.apply(this, arguments);
    },
    onAnimationFinish: function() {
      var bound = this.getBoundaries(),
          pos = this.getPosition(),
          duration = 200;
      if (pos.y < bound.original.min.y) {
        this.animatedScrollTo({x: pos.x, y: bound.original.min.y}, duration);
      } else if (pos.y > bound.original.max.y) {
        this.animatedScrollTo({x: pos.x, y: bound.original.max.y}, duration);
      }
    }
  });

  /*

  var PullScrollContainer = TranslateInertialScrollContainer.extend({
    initialize: function() {
      this.originalGetBoundaries = this.getBoundaries;
      this.getBoundaries = this.extendedGetBoundaries;
      this.updateThreshold = 100;
    },
    extendedGetBoundaries: function() {
      var bound = PullScrollContainer["__super__"].getBoundaries.apply(this, arguments),
          h = this.updateThreshold + 30;
      bound.max.y += h;
      console.log(bound.max);
      return bound;
    },
    animatedScrollTo: function() {
      this.getBoundaries = this.originalGetBoundaries;
      PullScrollContainer["__super__"].animatedScrollTo.apply(this, arguments);
      this.getBoundaries = this.extendedGetBoundaries;
    },
    onStop: function() {
      PullScrollContainer["__super__"].onStop.apply(this, arguments);
      if (this.position.y > this.updateThreshold) {
        this.onPull();
      }
    },
    onPull: function() {
      window.alert("Pulled!");
    }
  });

  */

  /*

  var ParallaxScrollContainer = RubberBandScrollContainer.extend({
    initialize: function(options) {
      this.subViews = [];
    },
    addView: function(view, posY, speed) {
      this.subViews.push({view: view, y: posY, speed: speed});
      view.render().$el.css({position: "absolute", top: 0, left: 0});
      this.moveSubviewTo(view, {x: 0, y: posY});
    },
    onShow: function() {
      for (var i=this.subViews.length; i--;) {
        this.$el.append(this.subViews[i].view.el);
      }
    },
    moveTo: function(newPoint) {
      var s, off, posY;
      for (var i=this.subViews.length; i--;) {
        s = this.subViews[i].speed;
        off = this.subViews[i].y;
        posY = newPoint.y*s + off;
        this.moveSubviewTo(this.subViews[i].view, {x: newPoint.x, y: posY});
      }
      ParallaxScrollContainer["__super__"].moveTo.apply(this, arguments);
    },
    moveSubviewTo: function(view, newPoint) {
      view.$el.css({
        "webkitTransform": "translate("+newPoint.x+"px,"+newPoint.y+"px)"
      });
    }
  });

  */
  /*

  var CSSInertialScrollContainer = TranslateInertialScrollContainer.extend({
    onStart: function() {
      this.scrollTo(this.getPosition());
      this.$content.css({ "-webkit-transition": "" });
      CSSInertialScrollContainer["__super__"].onStart.apply(this, arguments);
    },
    onStop: function() {
      // Change accel to modify friction!
      var accel = Math.min(30, Math.abs(this.speed.y)),
          pos = this.getPosition(),
          box = this.getBoundaries(),
          swipeDir = this.speed.y/Math.abs(this.speed.y),
          to = pos.y + (accel * accel * swipeDir * this.direction),
          duration = accel * 30,
          ratio = 1;
      // reduction of movement = reduction of duration to mantain speed!!
      if (to < box.min.y) {
        ratio = (box.min.y-pos.y)/(to-pos.y);
        to = box.min.y;
      } else if (to > box.max.y) {
        ratio = (box.max.y-pos.y)/(to-pos.y);
        to = box.max.y;
      }
      duration = duration * ratio;
      // change the bondary to scroll
      if (accel > 0) {
        this.animatedScrollTo({x: pos.x, y: to}, duration);
      }
    },
    animatedScrollTo: function(destination, duration) {
      this.$content.css({
        "-webkit-transition": "-webkit-transform " + duration/1000 + "s ease-out"
      });
      this.scrollTo(destination);
    }
  });

  */

  return RubberBandScrollContainer;

});
