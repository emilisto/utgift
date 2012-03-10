var happySync = function(method, model, options) {
  console.log('meee');
  options = options || {};
  options.success = options.success || function() {};
  options.success();
};


this.Expense = Backbone.Model.extend({
  defaults: {
    date: '1 Jan',
    amount: 0,
    who: 'Emil',
    label: 'Unspecified',
    category: 'Misc'
  },
  sync: happySync
});

this.ExpenseList = Backbone.Collection.extend({
  model: Expense,
  // localStorage: new Store("expenses"),
  compareAttr: 'date',
  comparator: function(model) {
    return model.get(this.compareAttr);
  },
  sync: happySync
});


this.Expenses = new ExpenseList;


Synapse.addHooks(jQueryHook, BackboneModelHook);
this.ExpenseView = Backbone.View.extend({
  tagName: "tr",
  template: _.template( $('#expense-template').html() ),

  events: {
    'dblclick': 'edit',
    'click .save': 'save',
  },

  initialize: function() {
    if(!this.model) throw "must supply model";

    _.bindAll(this, 'render', 'edit', 'save', 'createSynapses');

    // this.model.bind('all', function(ev, val) {
    //   console.log('model ev: %s', ev, val);
    // });

    this.render();
    this.createSynapses();
  },

  edit: function(ev) {
    if(!$(this.el).hasClass('editable')) {
      $(this.el).addClass('editable');

      var $td;
      if(ev) {
        $td = ev.target.tagName === 'TD' ?
          $(ev.target) : $(ev.target).parents('td');
      } else {
        $td = $('td', this.el).first();
      }

      $('input', $td).focus();
    }
  },
  save: function() {
    $(this.el).removeClass('editable');
    this.model.collection.sort();
  },

  createSynapses: function() {
    var self = this;
    var modelSynapse = Synapse(this.model);
    _.each(['date', 'label', 'amount', 'category', 'who'], function(name) {
      var input = $('[name=' + name + ']', self.el),
          span = input.siblings('span');

      var synapse = Synapse(input);
      var spanSynapse = Synapse(span);

      modelSynapse.observe(synapse);
      spanSynapse.observe(synapse);
    });

  },

  render: function() {
    $(this.el).html( this.template(this.model.toJSON()) );
  }

});


this.FilteredExpenses = Backbone.Subset.extend({
  parent: function() {
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
    'dblclick th': 'sortColumn',
    'click .add-one': 'create'
  },

  initialize: function() {
    if(!this.collection) throw "must supply collection";

    _.bindAll(this, 'addOne', 'addAll', 'render', 'sortColumn', 'create');

    this._views = {};

    this.realCollection = this.collection;

    var coll = new FilteredExpenses();
    coll = this.realCollection;
    coll.liveupdate_keys = 'all';
    this.collection = coll;


    // FIXME: Add filtering here
    // expenses.sieve = function(model) {
    //   return (model.get('who')  === 'Katie');
    // }

    this.collection.bind('add', this.addOne);
    this.collection.bind('reset', this.render);

    this.collection.bind('all', function(ev) {
      console.log('collection ev: %s', ev);
    });

    this.render();
  },

  create: function() {
    var model = new Expense();
    this.collection.add(model);

    var view = this.findView(model);
    if(view) view.edit();
    console.log('meeee: %o', view);
  },

  sortColumn: function(ev) {
    var col = $(ev.target).parent('th').attr('rel');

    var columns = [ 'date', 'label', 'amount', 'category', 'who' ];

    if(columns.indexOf(col) >= 0) {
      this.realCollection.compareAttr = col;
      this.realCollection.sort();
    }
  },

  findView: function(model) {
    return this._views[model.cid];
  },

  addOne: function(model) {
    var view = new ExpenseView({ model: model });
    $('tbody', this.el).append(view.el);
    this._views[model.cid] = view;
    console.log('addOne();');
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

  events: {
  },

  initialize: function() {
    _.bindAll(this, 'render');

    this.collection = Expenses;
    this.expensesView = new ExpensesView({ collection: this.collection });

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
