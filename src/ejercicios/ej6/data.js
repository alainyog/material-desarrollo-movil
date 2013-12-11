define(["jquery", "backbone", "base"], function($, Backbone, Base) {
  "use strict";

  var nombres = ["Juan", "José", "Felipe", "Feredico", "Pedro", "Luis"],
      apellidos = ["Gómez", "García", "Perez", "Alonso", "Zamorano"];

  var Contact = Backbone.Model.extend({
    initialize: function() {
      this.set({
        name: _.sample(nombres)+" "+_.sample(apellidos)+" "+_.sample(apellidos),
        phone: "555-" + ((1000 + Math.random() * 8999)<<0),
        online: (Math.random() > 0.5),
        avatar: "/assets/img/avatar"+(Math.floor((Math.random()) * 6) + 1)+".png"
      });
    },
    defaults: {
      name: "Some Contact",
      phone: "555-0000",
      avatar: "/assets/img/avatar1.png"
    }
  });

  var Contacts = Backbone.Collection.extend({
    initialize: function() {
      for (var i=1000; i--;) { this.add(new Contact()); }
    },
    model: Contact
  });

  var ContactsAdapter = Base.Class.extend({
    initialize: function(options) {
      this.collection = options.collection;
      this.collection.on("change", this.recount, this);
      this.recount();
    },
    recount: function() {
      this.length = this.collection.length;
    },
    at: function(i) {
      var c = this.collection.at(i);
      return {
        tiny: (c.get("online") ? "online" : ""),
        text: c.get("name"),
        subtext: c.get("phone"),
        img: c.get("avatar"),
        full: c.toJSON()
      };
    }
  });

  return (new ContactsAdapter({collection: new Contacts()}));

});
