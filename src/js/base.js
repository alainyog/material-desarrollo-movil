define(["backbone"], function(Backbone) {
  "use strict";

  // Base.Class

  var Class = function() {
    if (this.initialize) {
      this.initialize.apply(this, arguments);
    }
  };

  Class.extend = Backbone.Model.extend;

  var Vent = Class.extend({
    // forward
    triggerMethod: function(event) {
      var args = [].slice.call(arguments, 1),
          methodName = event.split(":").reduce(function(a, e) {
            return a + e[0].toUpperCase() + e.slice(1);
          }, "on");
      console.log(methodName);
      this.trigger.apply(this, [event].concat(args));
      if (typeof(this[methodName]) === "function") {
        this[methodName].apply(this, args);
      }
    }
  });
  _.extend(Vent.prototype, Backbone.Events);

  Backbone.Events.triggerMethod = Vent.prototype.triggerMethod;
  Backbone.View.prototype.triggerMethod = Vent.prototype.triggerMethod;
  Backbone.Model.prototype.triggerMethod = Vent.prototype.triggerMethod;
  Backbone.Collection.prototype.triggerMethod = Vent.prototype.triggerMethod;


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
      if (typeof this.helpers === "function") {
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
      CollectionView["__super__"].constructor.apply(this, arguments);
      if (this.collection && this.collection.on) {
        this.listenTo(this.collection, "add", this.addChildView);
      }
    },
    serializeModel: function() {
      return (this.model? this.model.toJSON() : {});
    },
    collectionIterator: function(fn, ctx) {
      this.collection.each(fn, ctx);
    },
    createItemView: function(model) {
      return new this["itemView"]({model: model, parent: this});
    },
    addChildView: function(model) {
      if (!this.$container) { return; }
      var itemView = this.createItemView(model);
      this.$container.append(itemView.render().el);
      return itemView;
    },
    render: function() {
      CollectionView["__super__"].render.apply(this, arguments);
      if (!this.$container) {
        this.$container = this.itemContainer? this.$(this.itemContainer) : this.$el;
      }
      this.$container.empty();
      this.collectionIterator(this.addChildView, this);
      return this;
      // 2. Sepa como instanciar las vistas de individuos
      // 3. Sepa donde meterlas
    }
  });

  return {
    Class: Class,
    Vent: Vent,
    View: View,
    ItemView: ItemView,
    CollectionView: CollectionView
  };
});
