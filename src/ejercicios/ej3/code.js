/* global window, navigator, document */
define(["jquery", "backbone", "hammer", "base", "containers", "templates", "custom/components.js"], function($, Backbone, hammer, Base, Containers, JST, Components) {
  "use strict";

  function startApp() {

    var Animation = Base.Class.extend({
      initialize: function(options) {
        this.from = options.from;
        this.to = options.to;
        this.delta = (this.to - this.from);
        this.onStepCallback = options.onStep;
        this.onFinishCallback = options.onFinish;
        this.duration = options.duration;
        this.start = Date.now();
        this.intervalId = window.setInterval(_.bind(this.onStep, this), 15);
        this.t = 0;
        this.tStep = (1/this.duration)*15;
      },
      onStep: function() {
        this.t += this.tStep;
        var finished = false,
            t = this.t,
            // TODO: Abstract this with Easing and Bezier (implement!)
            progress = t*(2-t);
        if (this.t >= 1) {
          this.value = this.to;
          finished = true;
        } else {
          this.value = this.from + (this.delta * progress);
        }
        if (this.onStepCallback) { this.onStepCallback(this.value); }
        if (finished) {
          this.stop();
          if (this.onFinishCallback) { this.onFinishCallback(this.value); }
        }
      },
      stop: function() {
        window.clearInterval(this.intervalId);
      }
    });

    /* TODO: DONT USE THIS!!! USE THE ONE IN THE RIGHT FILE! */

    var SimpleScrollContainer = Base.Layout.extend({
      initialize: function() {
        this.top = 0;
      },
      events: {
        "touchstart": "onTouchStart",
        "touchmove": "onTouchMove",
        "touchend": "onTouchEnd"
      },
      regions: {
        "main": ".scroll-main"
      },
      template: _.template("<div class='scroll-main'></div>"),
      show: function(view) {
        this.regions.main.show(view);
      },
      onTouchStart: function(e) {
        e.preventDefault();
        var ev = e.originalEvent,
            touch = ev.touches? ev.touches[0] : ev;
        this.top = this.getTopReference(e);
        this.reference = {
          x: touch.pageX,
          y: touch.pageY
        };
      },
      getTopReference: function() {
        return this.$el.scrollTop();
      },
      onTouchMove: _.throttle(function(e) {
        // TODO: Look into: TouchMove is only firing events on whole pixels!!
        e.preventDefault();
        var ev = e.originalEvent,
            touch = ev.touches? ev.touches[0] : ev,
            deltaX = touch.pageX - this.reference.x,
            deltaY = touch.pageY - this.reference.y;
        this.reference.x = touch.pageX;
        this.reference.y = touch.pageY;
        this.moveTo(deltaX, deltaY);
      }, 30),
      moveTo: function(deltaX, deltaY) {
        this.left -= deltaX;
        this.top -= deltaY;
        this.$el.scrollLeft(this.left);
        this.$el.scrollTop(this.top);
      },
      onTouchEnd: function() {
      }
    });

    var InertialScrollContainer = SimpleScrollContainer.extend({
      initialize: function() {
        this.top = 0;
        this.speed = 0;
      },
      getTopReference: function() {
        return this.top;
      },
      show: function(view) {
        this.scrollEl = view.el;
        this.scrollEl.style.webkitTransform = "translate(0,0)";
        InertialScrollContainer["__super__"].show.call(this, view);
      },
      onTouchStart: function(e) {
        var wt = window.getComputedStyle(this.scrollEl).webkitTransform,
            mat = new window.WebKitCSSMatrix(wt),
            x = mat.m41,
            y = mat.m42;
        // Reset styles
        this.scrollEl.style.webkitTransform = "translate("+x+"px,"+y+"px)";
        this.scrollEl.style.webkitTransition = "";
        // Reset info
        // TODO: Find a BETTER (more consistent) way to calculate SPEED
        this.speed = 0;
        this.top = y;
        this.left = x;
        // Limits: X
        this.contentWidth = this.scrollEl.clientWidth;
        this.containerWidth = +this.$el.width();
        this.minX = -this.conentWidth+this.containerWidth;
        // Limits: Y
        this.contentHeight = this.scrollEl.clientHeight;
        this.containerHeight = +this.$el.height();
        this.minY = -this.contentHeight+this.containerHeight-100;
        // super
        InertialScrollContainer["__super__"].onTouchStart.call(this, e);
      },
      addDeltas: function(deltaX, deltaY) {
        this.top = Math.min(0, this.top + deltaY);
        this.top = Math.max(this.minY, this.top);
        this.left = Math.min(0, this.left + deltaX);
        this.left = Math.max(this.minX, this.left);
      },
      moveTo: function(deltaX, deltaY) {
        if (deltaY >= this.speed) {
          this.speed = deltaY;
        } else {
          this.speed = (this.speed*2 + deltaY) / 3;
        }
        this.addDeltas(0, deltaY);
        this.scrollEl.style.webkitTransform = "translate(0,"+this.top+"px)";
      },
    });

    var CSSInertialScrollContainer = InertialScrollContainer.extend({
      onTouchEnd: function(e) {
        e.preventDefault();
        var accel = Math.abs(this.speed),
            inc,
            currentTop,
            prop;
        if (accel > 10) {
          currentTop = this.top;
          inc = this.speed * accel;
          this.addDeltas(0, inc);
          prop = (this.top-currentTop)/(inc);
          this.scrollEl.style.webkitTransition = "-webkit-transform " + prop*accel/30 + "s ease-out";
          this.scrollEl.style.webkitTransform = "translate(0,"+this.top+"px)";
        }
      }
    });

    var JSInertialScrollContainer = InertialScrollContainer.extend({
      onTouchStart: function(e) {
        if (this.animation) { this.animation.stop(); }
        JSInertialScrollContainer["__super__"].onTouchStart.call(this, e);
      },
      onTouchEnd: function(e) {
        e.preventDefault();
        var accel = Math.abs(this.speed);
        if (accel > 0) {
          this.animation = new Animation({
            from: this.top,
            to: this.top + (this.speed * accel),
            duration: accel * 30,
            onStep: _.bind(function(top) {
              if (top > 0) {
                top = 0;
                this.animation.stop();
              } else if (top <= this.minY) {
                top = this.minY;
                this.animation.stop();
              }

              this.top = top;
              this.scrollEl.style.webkitTransform = "translate(0,"+this.top+"px)";
            }, this),
          });
        }
      }
    });

    var vent = new Base.Vent();

    var Screen1 = Base.ItemView.extend({
      template: JST["ejercicios/ej1/screen1"],
      title: "Pantalla 1",
      className: "vertical box",
      triggers: {
        "touchstart #to-scrn-2": "to:screen2",
        "touchstart #to-scrn-3": "to:screen3",
      },
    });

    var Screen2 = Base.ItemView.extend({
      template: JST["ejercicios/ej1/screen2"],
      title: "Pantalla 2",
      className: "vertical box",
    });

    var Screen3 = Base.ItemView.extend({
      template: JST["ejercicios/ej1/screen3"],
      title: "Pantalla 3",
      className: "vertical box",
    });

    var screen1 = new Screen1(),
        screen2 = new Screen2(),
        screen3 = new Screen3();


    var sc = new Components.AnimatedStackContainer();

    var scroll = new JSInertialScrollContainer();
    scroll.show(screen1);
    scroll.title = screen1.title;

    sc.push(scroll);

    vent.forwardAll([screen1, screen2, screen3]);

    vent.on("to:screen2", function() {
      sc.push(screen2);
    });

    vent.on("to:screen3", function() {
      sc.push(screen3);
    });

    var appWindow = new Base.UIWindow();
    sc.setFrame(appWindow.getFrame());
    appWindow.show(sc);

  }

  /* Initialize */

  function start() {

    $("body").on("touchstart", ".topcoat-button, .button", function(e) {
      $(e.currentTarget).addClass("active");
    }).on("touchend", ".topcoat-button, .button", function(e) {
      $(e.currentTarget).removeClass("active");
    }).on("touchcancel", ".topcoat-button, .button", function(e) {
      $(e.currentTarget).removeClass("active");
    });

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
