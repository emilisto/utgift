this.Expense = Backbone.Model.extend({

});

this.ExpenseList = Backbone.Collection.extend({
  model: Expense,
  localStorage: new Store("expenses"),
  compareAttr: 'date',
  comparator: function(model) {
    return model.get(this.compareAttr);
  }
});


this.Expenses = new ExpenseList;

this.ExpenseView = Backbone.View.extend({

  tagName: "tr",

  events: {
    // "click .todo-check"      : "toggleDone",
    "click .btn-group" : "edit",
    // "click .todo-destroy"    : "clear",
    // "keypress .todo-input"   : "updateOnEnter",
    // "blur .todo-input"       : "close"
  },

  alive : function(){
  },


  edit: function(ev) {
    // $(this.el).addClass("editing");
    // this.input.focus();
    console.log('edit(): %o', ev);
  },

  // close: function() {
  //   this.model.save({content: this.input.attr("value")});
  //   $(this.el).removeClass("editing");
  // },

  // updateOnEnter: function(e) {
  //   if (e.which === 13) this.close();
  // },

  // clear: function() {
  //   this.model.destroy();
  // }

});

this.AppView = Backbone.View.extend({
  id: "appview",
  events: {
    "click": "test"
  },

  initialize: function() {
    _.bindAll(this, 'test');
    this.model = Expenses;
    this.dependencies({
    });

  },
  test: function() {
    alert('test()');
  },

  alive : function() {
  },

});


$(function(){
  var app = new Backbone.Backrub($("#app-template").html());
  $('body').append(app.render());

  // Backrub method
  app.makeAlive();

  Expenses.add({
    date     : '1 Feb',
    label    : 'Food',
    amount   : 90000,
    category : 'Food',
    who      : 'Emil'
  });
  Expenses.add({
    date     :  '3 Feb',
    label    :  'Gearshifter',
    amount   :  19.50,
    category :  'Bikes',
    who      :  'Katie'
  });
  Expenses.add({
    date     :  '1 Feb',
    label    :  'Oil',
    amount   :  1234,
    category :  'Food',
    who      :  'Emil'
  });
  Expenses.add({
    date     : '3 Feb',
    label    : 'Food',
    amount   : 19.50,
    category : 'Bikes',
    who      : 'Katie'
  });
  Expenses.add({
    date     :  '1 Feb',
    label    :  'Phone',
    amount   :  1234,
    category :  'Food',
    who      :  'Emil'
  });
  Expenses.add({
    date     :  '3 Feb',
    label    :  'Dishcloth',
    amount   :  19.50,
    category :  'Bikes',
    who      :  'Katie'
  });
});
