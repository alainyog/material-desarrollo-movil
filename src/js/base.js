define(["backbone"], function(Backbone) {
  "use strict";

  var Class = function() {
    if (this.initialize) { this.initialize.apply(this, arguments); }
  };
  Class.extend = Backbone.Model.extend;

  var triggerMethod = function(event) {
    var args = [].slice.call(arguments, 1),
        methodName = event.split(":").reduce(function(acc, el) {
          return acc + el[0].toUpperCase() + el.slice(1);
        }, "on");
    this.trigger.apply(this, arguments);
    if (typeof(this[methodName]) === "function") {
      this[methodName].apply(this, args);
    }
  };

  Backbone.Events.triggerMethod = triggerMethod;
  Backbone.Model.prototype.triggerMethod = triggerMethod;
  Backbone.View.prototype.triggerMethod = triggerMethod;
  Backbone.Collection.prototype.triggerMethod = triggerMethod;

  var Vent = Class.extend({
  });
  _.extend(Vent.prototype, Backbone.Events);

  var View = Backbone.View.extend({
    constructor: function() {
      View["__super__"].constructor.apply(this, arguments);
    },
    serializeModel: function() {
      var data = {};
      if (this.model) { _.extend(data, this.model.toJSON()); }
      if (this.collection) { _.extend(data, this.collection.toJSON()); }
      return data;
    },
    serializeData: function() {
      var data = this.serializeModel();
      if (typeof(this.helpers) === "function") {
        _.extend(data, this.helpers());
      } else {
        _.extend(data, this.helpers);
      }
      return data;
    },
    render: function() {
      var data = this.serializeData(),
          html = this.template(data);
      this.$el.empty().append(html);
      return this;
    }
  });

  var ItemView = View.extend({
    constructor: function() {
      ItemView["__super__"].constructor.apply(this, arguments);
    }
  });

  var CollectionView = View.extend({
    constructor: function() {
      this.childVent = new Vent();
      CollectionView["__super__"].constructor.apply(this, arguments);
      if (this.collection && this.collection.on) {
        this.listenTo(this.collection, "add", this.addChildView);
      }
    },
    serializeModel: function() {
      return (this.model? this.model.toJSON() :  {});
    },
    collectionIterator: function(fn, ctx) {
      this.collection.each(fn, ctx);
    },
    createItemView: function(model) {
      return new this["itemView"]({model: model, parent: this});
    },
    addChildView: function(model) {
      var childView = this.createItemView(model);
      this.listenTo(
        childView,
        "all",
        _.bind(this._childTrigger, this, childView)
      );
      this.$container.append(childView.render().el);
      this._childViews.push(childView);
      return childView;
    },
    _childTrigger: function(itemView, event) {
      var args = [].slice.call(arguments, 2),
          triggerArgs = [event, itemView].concat(args);
      this.childVent.trigger.apply(this.childVent, triggerArgs);
    },
    delegateEvents: function() {
      CollectionView["__super__"].delegateEvents.apply(this, arguments);
      _.invoke(this._childViews, "delegateEvents");
    },
    render: function() {
      CollectionView["__super__"].render.apply(this, arguments);
      if (!this.$container) {
        this.$container = this.itemContainer? this.$(this.itemContainer) : this.$el;
      }
      this.$container.empty();
      this._childViews = [];
      this.collectionIterator(this.addChildView, this);
      return this;
    }
  });

  var Region = Class.extend({
    constructor: function(options) {
      options = options || {};
      this.$el = options.$el;
      Region["__super__"].constructor.apply(this, arguments);
    },
    setElement: function($el) {
      this.$el = $el;
      if (this.currentView) {
        this.currentView.$el.detach();
        this.$el.empty().append(this.currentView.$el);
      } else if (this._pendingView) {
        this.show(this._pendingView);
        delete this._pendingView;
      }
    },
    show: function(view) {
      if (!this.$el || this.$el.length === 0) {
        return this._pendingView = view;
      }
      if (this.currentView) {
        this.currentView.triggerMethod("remove");
        this.close();
      }
      this.open(view.render());
      view.delegateEvents();
      this.currentView = view;
      view.triggerMethod("show");
    },
    open: function(view) {
      this.$el.empty().append(view.el);
    },
    close: function() {
      this.currentView.remove();
    },
    delegateEvents: function() {
      if (this.currentView) {
        this.currentView.delegateEvents();
      }
    }
  });

  var Layout = View.extend({
    constructor: function(options) {
      options = options || {};
      var regions = this.regions || options.regions || {};
      this._regions = [];
      this.regions = {};
      this.addRegions(regions);
      Layout["__super__"].constructor.apply(this, arguments);
    },
    addRegions: function(regions) {
      _.each(regions, this.addRegion, this);
    },
    addRegion: function(desc, nombre) {
      var RegionType = desc.regionType || this.regionType,
          selector = typeof(desc) === "string"? desc:desc.selector,
          region = new RegionType();
      if (this.$el) {
        region.setElement(this.$(selector));
      }
      this._regions.push({selector: selector, region: region});
      this.regions[nombre] = region;
    },
    regionType: Region,
    reattachRegions: function() {
      _.chain(this._regions)
      .map(function(regData) {
        return {regData: regData, $el: this.$(regData.selector)};
      }, this)
      .each(function(data) {
        data.regData.region.setElement(data.$el);
      });
    },
    render: function() {
      Layout["__super__"].render.apply(this, arguments);
      this.reattachRegions();
    },
    setElement: function() {
      Layout["__super__"].setElement.apply(this, arguments);
      this.reattachRegions();
    },
    delegateEvents: function() {
      Layout["__super__"].delegateEvents.apply(this, arguments);
      _.each(this._regions, function(regData) {
        regData.region.delegateEvents();
      });
    }
  });

  return {
    Class: Class,
    Vent: Vent,
    View: View,
    ItemView: ItemView,
    CollectionView: CollectionView,
    Region: Region,
    Layout: Layout
  };
});
