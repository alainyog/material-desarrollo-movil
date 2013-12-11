define(["base"], function(Base) {
  "use strict";

  /* NOTE:
  *  Each subclass should override only the methods without _:
  *
  *   SCROLL MECHANICS
  *   - getPosition()
  *   - getBoundaries()
  *   - scrolTo()
  *   - moveTo()
  *   - direction
  *
  *   FANCY CLIENTS/FX
  *   - onScroll()
  *   - onStop()
  *   - onStart()
  */

  var SimpleScrollContainer = Base.FrameLayout.extend({
    constructor: function() {
      SimpleScrollContainer["__super__"].constructor.apply(this, arguments);
      this.speed = {x: 0, y: 0};
    },
    events: {
      "touchstart": "_onTouchStart",
      "touchmove": "_onTouchMove",
      "touchend": "_onTouchEnd",
      "touchcancel": "_onTouchEnd",
    },
    regions: {
      "main": ".scroll-main"
    },
    template: _.template("<div class='scroll-main'></div>"),
    show: function(view) {
      this.$content = view.$el;
      this.regions.main.show(view);
    },
    // touch
    _onTouchStart: function(e) {
      e.preventDefault();
      var ev = e.originalEvent,
          touch = ev.touches? ev.touches[0] : ev;
      this._setReference({x: touch.pageX, y: touch.pageY});
      this.onStart(e);
    },
    _onTouchMove: _.throttle(function(e) {
      e.preventDefault();
      var ev = e.originalEvent,
          touch = ev.touches? ev.touches[0] : ev;
      this._scrollAction({x: touch.pageX, y: touch.pageY});
    }, 30),
    _onTouchEnd: function(e) {
      this.onStop(e);
    },
    // onScroll
    direction: -1,
    getPosition: function() {
      return {
        x: this.$el.scrollLeft(),
        y: this.$el.scrollTop()
      };
    },
    getBoundaries: function() {
      return {
        min: { x: 0, y: 0 },
        max: {
          x: this.$content.width() - this.$el.width(),
          y: this.$content.height() - this.$el.height() + 50
        }
      };
    },
    _setReference: function(point) {
      // Calculate the expensive CSS things only once per touch cycle
      this.boundaries = this.getBoundaries();
      this.position = this.getPosition();
      this.reference = point;
      this.startPoint = point;
      this.speed = {x: 0, y: 0};
    },
    _scrollAction: function(newPoint) {
      var delta = {
          x: newPoint.x - this.reference.x,
          y: newPoint.y - this.reference.y
        },
        d = this.direction,
        newPos = {
          x: this.position.x + delta.x * d,
          y: this.position.y + delta.y * d
        },
        box = this.boundaries;
      if (newPos.x >= box.min.x && newPos.x < box.max.x ||
          newPos.y >= box.min.y && newPos.y < box.max.y) {
        newPos.x = Math.min(box.max.x, Math.max(box.min.x, newPos.x));
        newPos.y = Math.min(box.max.y, Math.max(box.min.y, newPos.y));
        this.reference = newPoint;
        this.destination = newPos;
        this.speed = delta;
        this.scrollTo(this.destination, delta);
      }
    },
    scrollTo: function(destination, speed) {
      this.position = destination;
      this.moveTo(destination, speed);
      this.onScroll(destination, speed);
    },
    onStart: function() {
    },
    onScroll: function() {
    },
    onStop: function() {
    },
    // movement
    moveTo: function(newPoint) {
      this.$el.scrollLeft(newPoint.x);
      this.$el.scrollTop(newPoint.y);
    },
  });

  return SimpleScrollContainer;
});
