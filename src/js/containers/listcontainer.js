/* global window */
define(["base", "containers/inertialscrollcontainer", "templates"], function(Base, InertialScrollContainer, JST) {
  "use strict";

  /* TODO
  *  - IDEA: separar el scroll por un lado
  *         y un componente para mover los items por otro
  */

  // ListItem = any view + setData(data)
  // DataProvider = #at(index) (BBone collection)

  var ListItemView = Base.ItemView.extend({
    initialize: function(options) {
      this.vent = options.vent;
    },
    events: {
      "vtap": "select",
    },
    select: function() {
      /* window.alert("TAP @ " + this.data.text); */
      this.vent.trigger("list:item:selected", this.data, this);
    },
    className: "list-item button",
    template: JST["ejercicios/listitem"],
    setData: function(data) {
      if (!this.rendered) {
        this.render();
        this.rendered = true;
      }
      this.data = data;
      this.$(".tiny").text(data.tiny);
      this.$(".text").text(data.text);
      this.$(".subtext").text(data.subtext);
      if (data.img) { this.$("img").attr("src", data.img); }
    }
  });


  /*
  var ItemManager = Base.Class.extend({
  });
  */

  var ListScrollContainer = InertialScrollContainer.extend({
    constructor: function(options) {
      this.ItemView = options.itemView || this.itemViewType;
      this.dataProvider = options.dataProvider;
      if (!this.dataProvider) {
        throw new Error("Not enough options");
      }
      this.position = { x: 0, y: 0 };
      this.itemViews = [];
      this.itemViewPool = [];
      this.shown = {min: 0, max: 0};
      this.vent = new Base.Vent();
      ListScrollContainer["__super__"].constructor.apply(this, arguments);
    },
    itemViewType: ListItemView,
    itemViewAt: function(index) {
      var data = this.dataAt(index),
          view = this.getViewFor(data);
      view.setData(data);
      return view;
    },
    getViewFor: function() {
      return this.getItemViewInstance();
    },
    getItemViewInstance: function() {
      if (this.itemViewPool.length > 0) {
        return this.itemViewPool.pop();
      } else {
        return new this.ItemView({vent: this.vent});
      }
    },
    dataAt: function(index) {
      var data = this.dataProvider.at(index);
      if (data.toJSON) {
        data = data.toJSON();
      }
      return data;
    },
    freeItemViews: function(from, to) {
      var freed = this.itemViews.splice(from, to-from);
      this.itemViewPool.push.apply(this.itemViewPool, freed);
    },
    allocateItemViews: function(minIndex, maxIndex, before) {
      var views = [];
      for (var i=minIndex; i<=maxIndex; i++) {
        views.push(this.itemViewAt(i));
      }
      [][before? "unshift" : "push"].apply(this.itemViews, views);
    },
    start: function() {
      this.renderItemViews();
    },
    onResize: _.debounce(function(box) {
      if (!this.prevHeight || this.prevHeight !== box.height) {
        this.prevHeight = box.height;
        this.renderItemViews();
      }
    }, 300),
    onRemove: function() {
      // Stash and recover the childs when removed/resotred on a region
      this.stash = this.$el.children().detach();
    },
    onShow: function() {
      if (this.stash) {
        this.$el.append(this.stash);
        this.stash = undefined;
      }
    },
    renderItemView: function(index, containerWidth) {
      var itemView = this.itemViewAt(index);
      itemView.$el.css({position: "absolute", top: 0, width: containerWidth+"px"});
      this.$el.append(itemView.el);
      return itemView;
    },
    renderItemViews: function() {
      var itemView,
          minShown = this.shown.min,
          containerHeight = this.$el.height(),
          containerWidth = this.$el.width();
      this.$el.children().detach();
      this.itemHeight = 0;
      this.freeItemViews(0, this.itemViews.length);
      for (var i=minShown, _len=this.dataProvider.length; i<_len; i++) {
        itemView = this.renderItemView(i, containerWidth);
        this.itemViews.push(itemView);
        if (!this.itemHeight) {
          this.itemHeight = itemView.el.offsetHeight;
          this.contentHeight = this.dataProvider.length * this.itemHeight;
          this.itemsPerScreen = Math.ceil(containerHeight / this.itemHeight) + 1;
          this.shown.max = Math.min(this.shown.min + this.itemsPerScreen, _len) - 1;
          this.shown.min = (this.shown.max - this.itemsPerScreen) + 1;
        }
        if (i >= this.shown.max) { break; }
      }
      for (i=minShown-1; i >= this.shown.min; i--) {
        this.itemViews.unshift(this.renderItemView(i, containerWidth));
      }

      this.moveTo(this.position);
      this.onStop();
    },
    getContentSize: function() {
      return {
        max: { x: 0, y: 0 },
        min: { x: 0, y: this.$el.height() - this.contentHeight }
      };
    },
    getPosition: function() {
      return this.position;
    },
    moveTo: function(newPoint) {
      var posY = newPoint.y || 0,
          view,
          maxElement = this.dataProvider.length - 1,
          topElement = (-posY / this.itemHeight)<<0,
          lastElement = topElement + this.itemsPerScreen - 1;
      this.position.y = posY;
      posY = posY % this.itemHeight;
      if (topElement < 0) {
        posY += (-topElement) * this.itemHeight;
        topElement = 0;
        lastElement = this.itemsPerScreen - 1;
      } else if (lastElement > maxElement) {
        posY -= (lastElement - maxElement) * this.itemHeight;
        lastElement = this.dataProvider.length - 1;
        topElement = (lastElement - this.itemsPerScreen) + 1;
      }
      if (topElement > this.shown.min) {
        this.freeItemViews(0, topElement - this.shown.min);
        this.allocateItemViews(this.shown.max+1, lastElement);
      } else if (lastElement < this.shown.max) {
        this.freeItemViews(this.itemsPerScreen - (this.shown.max - lastElement), this.itemsPerScreen);
        this.allocateItemViews(topElement, this.shown.min-1, true);
      }
      this.shown.min = topElement;
      this.shown.max = lastElement;
      for (var i=0, _len=this.itemViews.length; i<_len; i++) {
        view = this.itemViews[i];
        view.el.style.webkitTransform = "translate(0,"+posY+"px)";
        posY += this.itemHeight;
      }
    },
  });

  ListScrollContainer.DefaultListItemView = ListItemView;

  return ListScrollContainer;
});
