/* global window, navigator, document */
define(["jquery", "backbone", "hammer", "base", "containers", "templates"], function($, Backbone, hammer, Base, Containers, JST) {
  "use strict";

  function startApp() {

    var FadeRegion = Base.Region.extend({
      open: function(view) {
        if (this.currentView) {
          this.currentView.$el.fadeOut("slow", _.bind(function() {
            view.$el.hide();
            this.$el.empty().append(view.el);
            view.$el.fadeIn("slow");
          }, this));
        } else {
          FadeRegion["__super__"].open.apply(this, arguments);
        }
      }
    });

    var LeftAnimatedRegion = Base.Region.extend({
      show: function(view, reverse) {
        this.forward = !reverse; // true or false
        LeftAnimatedRegion["__super__"].show.call(this, view);
      },
      open: function(view) {
        var from = this.currentView,
            dir = (this.forward? "+100%" : "-100%");

        if (!from) {
          LeftAnimatedRegion["__super__"].open.call(this, view);
        } else {
          view.$el.css({
            "-webkit-transform": "translate3d("+dir+",0,0)",
            "opacity":0,
            "-webkit-transition": "-webkit-transform .2s, opacity .5s",
          });
          LeftAnimatedRegion["__super__"].open.call(this, view);
          _.defer(function() {
            view.$el.css({"-webkit-transform": "translate(0)", opacity: 1});
          });
        }
      },
      close: function() {}
    });

    var FadeItemRegion = Base.Region.extend({
      open: function(view) {
        view.$el.css({"opacity": 0, "-webkit-transition": "opacity .3s"});
        FadeItemRegion["__super__"].open.call(this, view);
        _.defer(function() { view.$el.css({"opacity": 1}); });
      }
    });

    var AnimatedRegion = Base.FrameRegion.extend({
      show: function(view, reverse) {
        this.forward = !reverse; // true or false
        AnimatedRegion["__super__"].show.call(this, view);
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
          AnimatedRegion["__super__"].open.call(this, view);
        } else {
          width = from.$el.width();

          // ** DESCOMENTAR PARA ANIMACIONES SIN UIFRAME

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
            // MEJOR: AnimatedRegion["__super__"].close.call(this, from);
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

    var FadeStackContainer = Containers.StackContainer.extend({
      contentRegionType: AnimatedRegion,
      navBarRegionType: Base.FrameRegion
    });

    var AnimatedNavBar = Containers.StackContainer.DefaultNavBarView.extend({
      titleRegionType: LeftAnimatedRegion,
      leftButtonRegionType: FadeItemRegion
    });

    var FadeStackContainer2 = FadeStackContainer.extend({
      navBarType: AnimatedNavBar,
    });

    var sc = new FadeStackContainer2();

    sc.push(screen1);

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
