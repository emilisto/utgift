
/////////////////////////////
// Views

this.SummedExpensesView = Backbone.View.extend({
  template: _.template( $('#summed-expenses-template').html() ),

  initialize: function(options) {
    if(!this.expenses) throw "must supply collection";

    _.bindAll(this, 'render', 'add', 'reset', 'remove');

    this._field = 'amount';
    this._total = 0;

    // this.collection.bind('add', this.add);
    // this.collection.bind('remove', this.remove);
    // this.collection.bind('reset', this.reset);
    this.

    window.sev = this;

    this.render();
  },
  calculate: function() {

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
        $input = $($('td input', this.el).get(1));
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
    _.bindAll(this, 'render', 'clickClass', 'setFilter', 'clearFilter');

    options = options || {};

    if(!options.collection) throw "must supply collection";
    this.collection = options.collection;

    if(!options.attr) throw "must supply attr";

    var attr = this.attr = options.attr;
    this.label = options.label || 'Filter: ' + this.attr;

    var eventFilter = _.bind(function(attr) {
      if(attr === this.attr) this.render();
    }, this);

    this.collection.bind('index:emptied', eventFilter);
    this.collection.bind('index:created', eventFilter);

    this.render();
  },

  _currentFilter: null,
  setFilter: function(value) {
    var $a = $('a[rel="' + value + '"]', this.el);
    var $li = $a.parent('li');

    if(this._currentFilter !== value) {
      this.collection.setFilter(this.attr, value);
      $('li', this.el).removeClass('active');
      $li.addClass('active');
      this._currentFilter = value;

    }
  },
  clearFilter: function() {
    this.collection.clearFilter(this.attr);
    $('li', this.el).removeClass('active');
    this._currentFilter = null;
  },

  clickClass: function(ev) {
    var $a = $(ev.target);
    var $li = $a.parent('li');

    if($li.hasClass('active')) {
      this.clearFilter();
    } else {
      this.setFilter($a.attr('rel'));
    }
  },

  render: function() {
    var html = '<li class="nav-header">' + this.label + '</li>';

    var classes = this.collection.getValues(this.attr);
    _.each(classes, function(className) {
      html += '<li><a href="#" rel="' + className + '">' + className + '</a></li>\n';
    });

    $(this.el).html(html);

    if(this._currentFilter) {
      $('a[rel="' + this._currentFilter + '"]', this.el).parent('li').addClass('active');
    }

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
    'click th': 'sortColumn',
  },

  initialize: function() {
    if(!this.collection) throw "must supply collection";

    _.bindAll(this, 'addOne', 'removeOne', 'addAll', 'render', 'sortColumn', 'filter',
              'filterOne', 'refreshFilter');

    this._views = {};

    this.collection.bind('add', this.addOne);
    this.collection.bind('remove', this.removeOne);

    this.collection.bind('remove', this.refreshFilter);
    this.collection.bind('add', this.refreshFilter);

    this.collection.bind('reset', this.render);

    this.render();
  },


  sortColumn: function(ev) {
    var coll = this.collection;
    var col = $(ev.target).parent('th').attr('rel');

    var columns = [ 'date', 'label', 'amount', 'category', 'who' ];

    if(columns.indexOf(col) >= 0) {
      // Toggle sorting order if clicking twice on same column
      this.reverseSort = coll.sortAttr === col ? (!this.reverseSort) : false;
      var opts = { reverse: this.reverseSort };
      this.collection.sortAttr = col;

      this.collection.sort(opts);
    }
  },

  // Search

  refreshFilter: _.debounce(function() {
    if(this._currentFilter) this.filter(this._currentFilter);
  }, 100),
  _currentFilter: null,
  filter: function(str) {
    var view = this;
    var views = this._views;

    if(str) {
      this._currentFilter = str;
      this.collection.each(function(model) {
        var $el = $(views[model.cid].el);
        var matches = view.filterOne(model, str);
        matches ? $el.show() : $el.hide();
      });
    } else {
      // Show all
      $('tr', this.el).show();
      this._currentFilter = '';
    }

    this._updateTotal();
  },

  _total: 0,
  _updateTotal: _.debounce(function() {
    var views = this._views;
    var total = 0;

    this.collection.each(function(model) {
      var $el = $(views[model.cid].el);
      if($el.is(':visible')) {
        total += model.get('amount');
      }
    });

    // FIXME
    this._total = total = Math.round( total * 100 ) / 100
    $('table#total td[rel="amount"]').html(Math.round(total, 2));
  }, 100),

  filterOne: function(model) {
    var fields = [ 'who', 'label', 'category' ];
    var str = this._currentFilter;

    if(!str) return true;

    var regexps = _.map(str.split(' '), function(str) { return new RegExp(str, 'gi'); });
    var matchStr = _.map(fields, function(field) { return model.get(field) || ' '; }).join(' ');
    return _.all(regexps, function(re) { return matchStr.match(re) });
  },

  findView: function(model) {
    var view = this._views[model.cid];

    if(!view) {
      view = new ExpenseView({ model: model });
      this._views[model.cid] = view;
    }

    return view;
  },

  addOne: function(model) {
    var view = this.findView(model);

    if(!this.filterOne(model)) $(view.el).hide();

    // This halves the time this method takes
    this.$tbody.append(view.el);

    this._views[model.cid] = view;

    this._updateTotal();
  },
  removeOne: function(model) {
    var view = this._views[model.cid];
    if(view) $(view.el).remove();

    this._updateTotal();
  },
  addAll: function() {
    this.collection.each(this.addOne);
    this.filter(this._currentFilter);
  },
  render: function() {
    console.log('render!');
    $(this.el).html( this.template() );
    this.$tbody = $('#main tbody', this.el);

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
    'click .add-batch': 'showAddBatch',
    'keyup input#search': 'search'
  },

  initialize: function() {
    _.bindAll(this, 'render', 'create', 'showAddBatch', 'search');

    this.collection = Expenses;
    this.filteredExpenses = window.Filtered = new FilteredCollection([], {
      parent: Expenses
    });

    // FIXME
    this.filteredExpenses.setFilter('period', 'March -12');

    this.expensesView = new ExpensesView({ collection: this.filteredExpenses });

    this.aggregatedCollection = new AggregateCollection({ collection: Expenses });
    this.aggregatedCollection.setAggregateKeys(['who', 'category']);

    this.aggregateView = new AggregatedExpensesView({ collection: this.aggregatedCollection });

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

    window.av = this;

    this.render();
    this.showCurrentMonth();
  },

  showCurrentMonth: function() {
    var now = (new Date).format('mmmm -yy');
    this.monthFilter.setFilter(now);

    this.whoFilter.clearFilter();
    this.categoryFilter.clearFilter();
  },

  // Debounce prevents new search on every key stroke
  search: _.debounce(function() {
    var str = $('input#search', this.el).val();
    this.expensesView.filter(str);
  }, 150),



  showAddBatch: function() {
    new AddBatchView;
  },

  create: function() {
    var model = new Expense({
      date: new Date()
    });
    this.collection.create(model);

    this.showCurrentMonth();

    var view = this.expensesView.findView(model);
    // FIXME: this doesn't work    
    if(view) view.edit();
  },

  render: function() {
    $(this.el).html( this.template() );

    _.defer(_.bind(function() {
      $('#ExpensesView').append(this.expensesView.el);
      //$('#ExpensesView').append(this.aggregateView.el);
      //$('#SummedExpensesView').append(this.summedView.el);
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

    this.render();

    $('textarea', this.el).focus();

    var view = this;
    $(this.el).on('hidden', function() {
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
