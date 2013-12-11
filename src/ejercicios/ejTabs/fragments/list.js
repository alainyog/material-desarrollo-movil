define(["jquery", "backbone", "base", "containers", "../data.js"], function($, Backbone, Base, Containers, contactsAdapter) {
  "use strict";

  var SelectableItemView = Containers.ListContainer.DefaultListItemView.extend({
    setData: function() {
      this.$el.removeClass("active");
      return SelectableItemView["__super__"].setData.apply(this, arguments);
    },
    className: "list-item"
  });

  var ContactList = Containers.ListContainer.extend({
    initialize: function() {
      this.vent.on("list:item:selected", this.onListItemSelected, this);
    },
    itemViewType: SelectableItemView,
    clearSelected: function() {
      this.$(".list-item").removeClass("active");
    },
    onListItemSelected: function(data, view) {
      this.clearSelected();
      view.$el.addClass("active");
    },
    onShow: function() {
      ContactList["__super__"].onShow.apply(this, arguments);
      this.clearSelected();
    }
  });

  return Base.Activity.extend({
    start: function() {
      var contactList = new ContactList({
        dataProvider: contactsAdapter
      });

      this.mainView = contactList;

      return this;
    }
  });

});
