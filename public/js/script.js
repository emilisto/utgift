
/////////////////////////////
// Views

this.SummedExpensesView = Backbone.View.extend({
  template: _.template( $('#summed-expenses-template').html() ),

  initialize: function() {
    if(!this.collection) throw "must supply collection";

    _.bindAll(this, 'render', 'add', 'reset', 'remove');

    this._field = 'amount';
    this._total = 0;

    this.collection.bind('add', this.add);
    this.collection.bind('remove', this.remove);
    this.collection.bind('reset', this.reset);

    this.render();
  },
  add: function(model) {
    this._total += model.get(this._field);
    this.render();
  },
  remove: function(model) {
    this._total -= model.get(this._field);
    this.render();
  },
  reset: function(coll) {
    this._total = 0;
    coll.each(this.add);
  },
  render: function() {
    $(this.el).html(this.template({
      // Round to two decimals
      total: Math.round( this._total * 100 ) / 100
    }));
  }

});

this.Expenses = new ExpenseList;


this.ExpenseView = Backbone.View.extend({
  tagName: "tr",
  template: _.template( $('#expense-template').html() ),

  events: {
    'dblclick': 'edit',
    'click .save': 'save',
    'click .btn-remove': 'remove',
    'click .btn-edit': 'edit',
    'keyup input': 'keyCommand'
  },

  initialize: function() {
    if(!this.model) throw "must supply model";

    _.bindAll(this, 'render', 'edit', 'save', 'createSynapses', 'keyCommand');

    this.model.bind('change', this.render);

    var view = this;
    this.model.bind('destroy', function() {
      $(view.el).remove();
    });

    this.render();
  },

  keyCommand: function(ev) {
    if(!ev) return;

    /*console.log('keyCode: %d shiftKey: %o metaKey: %o',
                ev.keyCode, ev.shiftKey, ev.metaKey);*/

    var field = $(ev.target).parent('td').attr('rel');

    if(
      (ev.shiftKey && [38, 40].indexOf(ev.keyCode) >= 0) ||
      (!ev.shiftKey && ev.keyCode === 13)
    ) {
      this.save();

      var el = ev.keyCode === 38 ?
        $(this.el).prev() : $(this.el).next()

      if(el && el.length) $('td[rel=' + field + ']', el).dblclick();

    } else if(ev.shiftKey && ev.keyCode === 13) {
      this.save();
    }
  },

  edit: function(ev) {
    if(!$(this.el).hasClass('editable')) {
      $(this.el).siblings().removeClass('editable');
      $(this.el).addClass('editable');

      var $input;
      if(ev) {
        var $td = ev.target.tagName === 'TD' ?
          $(ev.target) : $(ev.target).parents('td');

        $input = $('input', $td);
      }

      if(!$input || !$input.length) {
        $input = $('td input', this.el).first();
      }

      $input.focus();
    }
  },
  remove: function() {
    this.model.destroy();
  },
  save: function() {
    var self = this;

    var attrs = {};

    _.each(['label', 'amount', 'category', 'who'], function(name) {
      var input = $('[name=' + name + ']', self.el),
          span = input.siblings('span');

      $(span).html(input.val());
      attrs[name] = input.val();

    });

    this.model.save(attrs);

    $(this.el).removeClass('editable');

    // FIXME: Fix sorting that doesn't reset the view state
    //this.model.collection.sort();
  },

  // No longer used
  createSynapses: function() {
    var self = this;
    var modelSynapse = Synapse(this.model);

    var modelObservees = ['label', 'amount', 'who'];

    _.each(['label', 'amount', 'category', 'who'], function(name) {
      var input = $('[name=' + name + ']', self.el),
          span = input.siblings('span');

      var synapse = Synapse(input);
      var spanSynapse = Synapse(span);

      if(modelObservees.indexOf(name) >= 0) {
        modelSynapse.observe(synapse);
      }
      spanSynapse.observe(synapse);
    });

  },

  render: function() {
    var json = this.model.toJSON();

    var date = new Date(this.model.get('date'));
    json.date = date.format('d mmm');
    $(this.el).html( this.template(json) );
  }

});


this.ClassFilterView = Backbone.View.extend({
  tagName: 'ul',
  className: 'nav nav-pills nav-stacked',
  events: {
    'click li': 'clickClass'
  },

  initialize: function(options) {
    _.bindAll(this, 'render', 'clickClass');

    options = options || {};

    if(!options.collection) throw "must supply collection";
    this.collection = options.collection;

    if(!options.attr) throw "must supply attr";

    var attr = this.attr = options.attr;
    this.label = options.label || 'Filter: ' + this.attr;

    var eventFilter = _.bind(function(attr) {
      if(attr === this.attr) this.render();
    }, this);
    this.collection.bind('index:add', eventFilter);
    this.collection.bind('index:remove', eventFilter);

    this.render();
  },

  clickClass: function(ev) {
    var filterValue = $(ev.target).attr('rel');
    var $li = $(ev.target).parent('li');

    if($li.hasClass('active')) {
      this.collection.clearFilter(this.attr);
      $('li', this.el).removeClass('active');
    } else {
      this.collection.setFilter(this.attr, filterValue);
      $('li', this.el).removeClass('active');
      $li.addClass('active');
    }
  },

  render: function() {
    var html = '<li class="nav-header">' + this.label + '</li>';

    var classes = this.collection.getValues(this.attr);
    _.each(classes, function(className) {
      html += '<li><a href="#" rel="' + className + '">' + className + '</a></li>\n';
    });

    $(this.el).html(html);

    this.delegateEvents();
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

    _.bindAll(this, 'addOne', 'removeOne', 'addAll', 'render', 'sortColumn');

    this._views = {};

    this.collection.bind('add', this.addOne);
    this.collection.bind('remove', this.removeOne);
    this.collection.bind('reset', this.render);

    this.collection.bind('all', function(ev) {
      // console.log('collection ev: %s', ev);
    });

    this.render();
  },


  sortColumn: function(ev) {
    var col = $(ev.target).parent('th').attr('rel');

    var columns = [ 'date', 'label', 'amount', 'category', 'who' ];

    if(columns.indexOf(col) >= 0) {
      // FIXME: make this toggle asc/desc sorting
      // if(this.collection.compareAttr === col)
      //   this.collection.order *= -1;
      // else
      //   this.collection.order = 1;

      this.collection.compareAttr = col;
      this.collection.sort();
    }
  },

  findView: function(model) {
    return this._views[model.cid];
  },

  addOne: function(model) {
    var view = new ExpenseView({ model: model });
    $('tbody', this.el).prepend(view.el);
    this._views[model.cid] = view;
  },
  removeOne: function(model) {
    var view = this._views[model.cid];
    if(view) $(view.el).remove();
  },
  addAll: function() {
    this.collection.each(this.addOne);
  },
  render: function() {
    $(this.el).html( this.template() );
    this.addAll();
    this.delegateEvents();
  }
});

this.AggregatedExpenseView = Backbone.View.extend({
  tagName: "tr",
  template: _.template( $('#aggregated-expense-template').html() ),

  events: {
  },

  initialize: function() {
    if(!this.model) throw "must supply model";

    _.bindAll(this, 'render');

    this.model.bind('change', this.render);

    var view = this;
    this.model.bind('destroy', function() {
      $(view.el).remove();
    });

    this.render();
  },

  remove: function() {
    this.model.destroy();
  },

  render: function() {
    var json = this.model.toJSON();
    $(this.el).html( this.template(json) );
  }

});


this.AggregatedExpensesView = Backbone.View.extend({
  /*
   * FIXME:
   *
   * - cleanup - memory leaks
   * - faster adding, dont run add on each individual item
   *
   */

  id: 'view-aggregated-expenses',
  template: _.template( $('#aggregated-expenses-template').html() ),

  events: {
    'click th': 'sortColumn'
  },

  initialize: function() {
    if(!this.collection) throw "must supply collection";

    _.bindAll(this, 'addOne', 'addAll', 'render', 'sortColumn');

    this._views = {};

    this.collection.bind('reset', this.render);
     this.collection.bind('add', this.addOne);
    // this.collection.bind('reset', this.render);

    // this.collection.bind('all', function(ev) {
    //   console.log('collection ev: %s', ev);
    // });

    this.render();
  },


  sortColumn: function(ev) {
    var col = $(ev.target).parent('th').attr('rel');

    var columns = [ 'date', 'label', 'amount', 'category', 'who' ];

    if(columns.indexOf(col) >= 0) {
      // if(this.collection.compareAttr === col)
      //   this.collection.order *= -1;
      // else
      //   this.collection.order = 1;

      this.collection.compareAttr = col;
      this.collection.sort();
    }
  },

  findView: function(model) {
    return this._views[model.cid];
  },

  addOne: function(model) {
    var view = new AggregatedExpenseView({ model: model });
    $('tbody', this.el).prepend(view.el);
    this._views[model.cid] = view;
  },
  addAll: function() {
    this.collection.each(this.addOne);
  },
  render: function() {
    $(this.el).html( this.template({
      keys: this.collection._aggregateFields
    }));

    this.addAll();

    this.delegateEvents();
  }
});


this.AppView = Backbone.View.extend({
  id: "appview",
  template: _.template( $('#app-template').html() ),

  events: {
    'click .add-one': 'create',
    'click .add-batch': 'showAddBatch'
  },

  initialize: function() {
    _.bindAll(this, 'render', 'create', 'showAddBatch');

    this.collection = Expenses;
    // this.filteredCollection = new FilteredExpenses([], {
    //   parent: this.collection,
    //   liveupdate_keys: 'all'
    // });
    this.filteredExpenses = window.Filtered = new FilteredCollection([], {
      parent: Expenses
    });

    this.expensesView = new ExpensesView({ collection: this.filteredExpenses });

    this.aggregatedCollection = new AggregateCollection({ collection: Expenses });
    this.aggregatedCollection.setAggregateKeys(['who', 'category']);

    this.aggregateView = new AggregatedExpensesView({ collection: this.aggregatedCollection });
    this.summedView = new SummedExpensesView({ collection: this.filteredExpenses });

    window.ac = this.aggregatedCollection;

    this.categoryFilter = new ClassFilterView({
      label: 'Categories',
      attr: 'category',
      collection: this.filteredExpenses
    });

    this.whoFilter = new ClassFilterView({
      label: 'Who',
      attr: 'who',
      collection: this.filteredExpenses
    });

    this.monthFilter = new ClassFilterView({
      label: 'Months',
      attr: 'period',
      collection: this.filteredExpenses
    });

    this.render();

  },

  showAddBatch: function() {
    new AddBatchView;
  },

  create: function() {
    var model = new Expense({
      date: new Date()
    });
    this.collection.create(model);

    var view = this.expensesView.findView(model);
    if(view) view.edit();
  },

  render: function() {
    $(this.el).html( this.template() );

    _.defer(_.bind(function() {
      $('#ExpensesView').append(this.expensesView.el);
      $('#ExpensesView').append(this.aggregateView.el);
      $('#SummedExpensesView').append(this.summedView.el);
      $('#filters').append(this.categoryFilter.el)
      $('#filters').append(this.monthFilter.el)
      $('#filters').append(this.whoFilter.el)
    }, this));
  }

});

this.AddBatchView = Backbone.View.extend({
  /*
   * FIXME:
   *
   * - cleanup - memory leaks
   * - faster adding, dont run add on each individual item
   *
   */

  id: 'modal-add-batch',
  className: 'modal',
  template: _.template( $('#add-batch-template').html() ),

  events: {
    'paste textarea': 'batchAdd',
    'click .btn': 'close',
    'keyup #who': 'editWho'
  },

  initialize: function() {

    _.bindAll(this, 'render', 'batchAdd', 'close', 'editWho');

    this.collection = new ExpenseList;
    this.expensesView = new ExpensesView({ collection: this.collection });

    $(this.el).appendTo('body');
    $(this.el).modal({ show: true });

    this.editWho = _.throttle(this.editWho, 300);

    // this.collection.bind('all', function(ev) {
    //   console.log('coll ev: %s', ev);
    // });

    this.render();

    $('textarea', this.el).focus();

    var view = this;
    $(this.el).on('hidden', function() {
      console.log('removing element');
      $(view.el).remove();
    });

  },

  editWho: function(ev) {
    var val = $(ev.target).val();
    this._who = val;

    this.collection.each(function(model) {
      model.set({ who: val });
    });
  },

  batchAdd: function() {
    $textarea = $('textarea', this.el);
    _.defer(_.bind(function() {
      var str = $textarea.val();
      var parser = new AccountParser;
      var expenses = parser.parse(str);

      var who = this._who;
      if(who) {
        expenses = _.map(expenses, function(expense) {
          return _.extend({ who: who }, expense);
        });
      }

      this.collection.add(expenses);

      console.log(this.collection);

      $textarea.val('');

    }, this));
  },

  close: function(ev) {
    if(ev && $(ev.target).hasClass('btn-primary')) {
      this.collection.each(function(model) {
        Expenses.create(model.toJSON());
      });
    }

    $(this.el).modal('hide');
  },

  render: function() {
    $(this.el).html( this.template() );

    _.defer(_.bind(function() {
      $('#ExpensesView', this.el).append(this.expensesView.el);
    }, this));
  }
});

function random_date() {
  // 1 Jan 2012
  var start = 1325397600000;
  var now = new Date().getTime();
  return new Date(start + Math.floor( Math.random()  * (now - start) ));
}


$(function(){

  var socket = window.socket = io.connect('emilisto.local');
  // window.Test = new AggregateCollection({ collection: Expenses });

  // Filtered.bind('all', function(ev) {
  //   console.log('Filtered: %s %o', ev, arguments);
  // });

  Expenses.fetch();
  Expenses.bind('reset', function() {
    console.log('reset: script.js()');
  });

  //Expenses.bind('all', function(ev) {
    // if(!ev.match(/index:/)) {
      //console.log('Expenses: %s %o', ev, arguments);
    // }
  //});

  setTimeout(function() {
    console.log(Expenses.length);
  }, 1500);

  var app = new AppView();
  $('body').append(app.el);


  window.app = app;

  // app.showAddBatch();

});

window.changeit = function () {
  function randomCategory() {
    var categories = [ 'Mat', 'Ute', 'Transport', 'Nöje', 'Sport', 'Parkering', 'Hyra' ];
    var index = Math.min(categories.length - 1, Math.floor(Math.random() * categories.length));
    return categories[index];
  }

  Expenses.each(function(model) {
    console.log(model);
    model.save({ category: randomCategory() });
  });
}
