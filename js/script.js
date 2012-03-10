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


this.FilteredExpenses = Backbone.Subset.extend({
  parent: function() {
    console.log(this._parent);
    return this._parent || Expenses;
  },

  sieve: function(model) {
    return true;
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
    'click th': 'sortColumn'
  },

  initialize: function() {
    if(!this.collection) throw "must supply collection";

    _.bindAll(this, 'addOne', 'addAll', 'render', 'sortColumn');

    this.collection.bind('add', this.addOne);
    this.collection.bind('reset', this.render);

    this.collection.bind('all', function(ev) {
      console.log('collection ev: %s', ev);
    });

    this.render();
  },

  sortColumn: function(ev) {
    var col = $(ev.target).parent('th').attr('rel');

    var columns = [ 'date', 'label', 'amount', 'category', 'who' ];

    if(columns.indexOf(col) >= 0) {
      this.collection.compareAttr = col;
      this.collection.sort();
    }
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

    var expenses = new FilteredExpenses();

    // expenses.sieve = function(model) {
    //   return (model.get('who')  === 'Katie');
    // }

    this.expensesView = new ExpensesView({ collection: expenses });

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

  Expenses.add({
    date     : '1 Jan',
    label    : 'Food',
    amount   : 90000,
    category : 'Food',
    who      : 'Emil'
  });
  Expenses.add({
    date     :  '3 Jan',
    label    :  'Gearshifter',
    amount   :  19.50,
    category :  'Bikes',
    who      :  'Katie'
  });
  Expenses.add({
    date     :  '1 Jan',
    label    :  'Oil',
    amount   :  1234,
    category :  'Food',
    who      :  'Emil'
  });
  Expenses.add({
    date     : '3 Jan',
    label    : 'Food',
    amount   : 19.50,
    category : 'Bikes',
    who      : 'Katie'
  });
  Expenses.add({
    date     :  '1 Jan',
    label    :  'Phone',
    amount   :  1234,
    category :  'Food',
    who      :  'Emil'
  });
  Expenses.add({
    date     :  '3 Jan',
    label    :  'Dishcloth',
    amount   :  19.50,
    category :  'Bikes',
    who      :  'Katie'
  });

});
