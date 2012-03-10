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
  template: _.template( $('#expense-template').html() ),

  events: {
  },

  initialize: function() {
    if(!this.model) throw "must supply model";

    _.bindAll(this, 'render');

    this.render();
  },
  render: function() {
    $(this.el).html( this.template(this.model.toJSON()) );
  }

});

this.ExpensesView = Backbone.View.extend({

  /*
   * FIXME:
   *
   * - cleanup - memory leaks
   * - faster adding, dont run add on each individual item
   *
   */

  id: 'view-expenses',
  template: _.template( $('#expenses-template').html() ),

  events: {
    'click td': 'test'
  },

  initialize: function() {
    if(!this.collection) throw "must supply collection";

    _.bindAll(this, 'addOne', 'addAll', 'render');

    this.collection.bind('add', this.addOne);
    this.collection.bind('reset', this.render);

    this.collection.bind('all', function(ev) {
      console.log('collection ev: %s', ev);
    });

    this.render();
  },

  test: function(ev) {
    console.log('click: %o', ev);
  },

  addOne: function(model) {
    var view = new ExpenseView({ model: model });
    $('tbody', this.el).append(view.el);
  },
  addAll: function() {
    this.collection.each(this.addOne);
  },
  render: function() {
    $(this.el).html( this.template() );
    this.addAll();
  }
});

this.AppView = Backbone.View.extend({
  id: "appview",
  template: _.template( $('#app-template').html() ),

  initialize: function() {
    _.bindAll(this);
    this.model = Expenses;

    this.expensesView = new ExpensesView({ collection: Expenses });

    this.render();
  },

  render: function() {
    $(this.el).html( this.template( { test: 1234 } ) );

    _.defer(_.bind(function() {
      $('#ExpensesView').append(this.expensesView.el);
    }, this));
  }

});


$(function(){
  var app = new AppView();
  $('body').append(app.el);

  window.app = app;

  // Backrub method
  

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
