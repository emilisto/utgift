var happySync = function(method, model, options) {
  options = options || {};
  options.success = options.success || function() {};
  options.success();
};


this.Expense = Backbone.Model.extend({
  defaults: {
    date: '1 Jan',
    amount: 0,
    who: '',
    label: 'Unspecified',
    category: 'Misc'
  },
  parse: function(data) {
    if(data.date) data.date = new Date(data.date);

    return data;
  }
});

this.ExpenseList = Backbone.Collection.extend({
  model: Expense,
  compareAttr: 'date',
  comparator: function(model) {
    return model.get(this.compareAttr);
  },
  url: '/expenses'
});

this.FilteredExpenses = Backbone.Subset.extend({
  initialize: function() {
    _.bindAll(this, 'sieve', 'addSieve', 'removeSieve', 'clearSieves', 'refresh');

    this._sieves = [];
  },
  parent: function() {
    return this._parent;
  },

  sieve: function(model) {
    return _.all(
      _.map(this._sieves, function(sieve) {
        console.log('sieve(): ' + sieve(model));
        return sieve(model);
      }),
      _.identity
    );
  },

  addSieve: function(fn) {
    this._sieves.push(fn);
    this.refresh();
  },
  removeSieve: function(fn) {
    console.log('REMOVE SIEVE!');
    this._sieves = _.without(this._sieves, fn);
    this.refresh();
  },
  clearSieves: function() {
    this._sieves = [];
    this.refresh();
  },

  refresh: function() {
    this.parent().reset(this.parent().toJSON());
  }

});


this.Expenses = new ExpenseList;


/*
 * TODO:
 *
 *  add auto-complete suggestion in category and who
 *
 *
 */
Synapse.addHooks(jQueryHook, BackboneModelHook);
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

      // FIXME: if category is included here, view is updated while typing,
      // which is undesirable.
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
    _.bindAll(this, 'render', 'refreshClasses', 'clickClass');

    options = options || {};

    if(!options.collection) throw "must supply collection";
    this.collection = options.collection;

    if(!options.attr) throw "must supply attr";

    this.label = options.label || 'Filter';

    var attr = this.attr = options.attr;
    if(!_.isFunction(this.attr)) {
      this.attr = function(model) {
        return model.get(attr);
      };
    }

    this._classes = [];
    this._activeClass = null;

    this.collection.bind('add', this.refreshClasses);
    this.collection.bind('remove', this.refreshClasses);
    this.collection.bind('change:' + attr, this.refreshClasses);
  },

  refreshClasses: function(model) {
    var val = this.attr(model);

    if(this._classes.indexOf(val) < 0) {
      this._classes.push(val);
      this.render();
    }
  },
  clearSieve: function() {
      if(this._sieveFn) this.collection.removeSieve(this._sieveFn);
      $('li', this.el).removeClass('active');
  },
  clickClass: function(ev) {
    var filterValue = $(ev.target).attr('rel');

    var $li = $(ev.target).parent('li');

    if($li.hasClass('active')) {
      this.clearSieve();
    } else {
      var attr = this.attr;

      this.clearSieve();
      this._sieveFn = function(model) {
        return attr(model) === filterValue;
      };
      this.collection.addSieve(this._sieveFn);
      $li.addClass('active');
    }
  },

  render: function() {
    var html = '<li class="nav-header">' + this.label + '</li>';

    _.each(this._classes, function(className) {
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

    _.bindAll(this, 'addOne', 'addAll', 'render', 'sortColumn');

    this._views = {};

    // this.realCollection = this.collection;
    // this.collection = new FilteredExpenses([], {
    //   parent: this.realCollection,
    //   liveupdate_keys: 'all'
    // });

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

  showMonth: function(month) {
    this.collection.setSieve(function(model) {
      var _month = model.get('date').format('mmmm -yy');
      return _month === month;
    });
  },

  showCategory: function(category) {
    this.collection.setSieve(function(model) {
      return category === model.get('category');
    });
  },

  showAll: function() {
    this.collection.setSieve(function(model) {
      return true;
    });
  },


  findView: function(model) {
    return this._views[model.cid];
  },

  addOne: function(model) {
    var view = new ExpenseView({ model: model });
    $('tbody', this.el).prepend(view.el);
    this._views[model.cid] = view;
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

this.AppView = Backbone.View.extend({
  id: "appview",
  template: _.template( $('#app-template').html() ),

  events: {
    // 'click #months li': 'showMonth',
    //'click #categories li': 'showCategory',
    'click .add-one': 'create',
    'click .add-batch': 'showAddBatch'
  },


  initialize: function() {
    _.bindAll(this, 'render', 'refreshMonths', 'refreshCateories', 'renderCategories',
             'create', 'showAddBatch');

    this.collection = Expenses;
    this.filteredCollection = new FilteredExpenses([], {
      parent: this.collection,
      liveupdate_keys: 'all'
    });

    this.expensesView = new ExpensesView({ collection: this.filteredCollection });

    this.categoryFilter = new ClassFilterView({
      label: 'Categories',
      attr: 'category',
      collection: this.filteredCollection
    });

    this.whoFilter = new ClassFilterView({
      label: 'Who',
      attr: 'who',
      collection: this.filteredCollection
    });

    this.monthFilter = new ClassFilterView({
      label: 'Months',
      attr: function(model) {
        return model.get('date').format('mmmm -yy');
      },
      collection: this.filteredCollection
    });


    // this.collection.bind('add', this.refreshMonths);
    // this.collection.bind('remove', this.refreshMonths);
    // this.collection.bind('add', this.refreshCateories);
    // this.collection.bind('remove', this.refreshCateories);
    // this.collection.bind('change:category', this.refreshCateories);
    // this.collection.bind('change:date', this.refreshDate);

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


  _months: [],
  refreshMonths: function(model) {
    var date = model.get('date').format('mmmm -yy');

    if(this._months.indexOf(date) < 0) {
      this._months.push(date);
      this.render();
    }

  },
  showMonth: function(ev) {
    var month = $(ev.target).attr('rel');

    var $li = $(ev.target).parent('li');

    if($li.hasClass('active')) {
      this.expensesView.showAll();
      $('#months li').removeClass('active');
    } else {
      this.expensesView.showMonth(month);
      $('#months li').removeClass('active');
      $li.addClass('active');
    }
  },
  renderMonths: function() {
    var html = '<li class="nav-header">Months</li>';

    _.each(this._months, function(month) {
      html += '<li><a href="#" rel="' + month + '">' + month + '</a></li>\n';
    });

    $('ul#months', this.el).html(html);
    this.delegateEvents();
  },

  // Make this a general mixin method
  _categories: [],
  refreshCateories: function(model) {
    var val = model.get('category');

    console.log('refreshCateories(): %o', arguments);

    if(this._categories.indexOf(val) < 0) {
      this._categories.push(val);
      this.renderCategories();
    }

  },
  showCategory: function(ev) {
    var category = $(ev.target).attr('rel');

    var $li = $(ev.target).parent('li');

    if($li.hasClass('active')) {
      this.expensesView.showAll();
      $('#categories li').removeClass('active');
    } else {
      this.expensesView.showCategory(category);
      $('#categories li').removeClass('active');
      $li.addClass('active');
    }
  },

  renderCategories: function() {
    var html = '<li class="nav-header">Categories</li>';

    _.each(this._categories, function(category) {
      html += '<li><a href="#" rel="' + category + '">' + category + '</a></li>\n';
    });

    console.log('meeeeeep');
    $('ul#categories', this.el).html(html);
    this.delegateEvents();
  },

  render: function() {
    $(this.el).html( this.template( {
      months: this._months,
    } ) );

    _.defer(_.bind(function() {
      $('#ExpensesView').append(this.expensesView.el);
      $('#filters').append(this.monthFilter.el)
      $('#filters').append(this.categoryFilter.el)
      $('#filters').append(this.whoFilter.el)
      //this.renderCategories();
      //this.renderMonths();
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
    'click .btn': 'close'
  },

  initialize: function() {

    _.bindAll(this, 'render', 'batchAdd', 'close');

    this.collection = new ExpenseList;
    this.expensesView = new ExpensesView({ collection: this.collection });


    $(this.el).appendTo('body');
    $(this.el).modal({ show: true });

    this.render();

    $('textarea', this.el).focus();


    var view = this;
    $(this.el).on('hidden', function() {
      console.log('removing element');
      $(view.el).remove();
    });
  },

  batchAdd: function() {
    $textarea = $('textarea', this.el);
    _.defer(_.bind(function() {
      var str = $textarea.val();
      var parser = new AccountParser;
      var expenses = parser.parse(str);

      this.collection.add(expenses);

      $textarea.val('');

    }, this));
  },

  close: function(ev) {
    if(ev && $(ev.target).hasClass('btn-primary')) {
      Expenses.add(this.collection.toJSON());
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

  var socket = window.socket = io.connect('localhost');
  Expenses.fetch();

  var app = new AppView();
  $('body').append(app.el);


  window.app = app;

  // app.expensesView.showAddBatch();

  // Expenses.add({
  //   date     : random_date(),
  //   label    : 'Food',
  //   amount   : 90000,
  //   category : 'Food',
  //   who      : 'Emil'
  // });
  // Expenses.add({
  //   date     : random_date(),
  //   label    :  'Gearshifter',
  //   amount   :  19.50,
  //   category :  'Bikes',
  //   who      :  'Katie'
  // });
  // Expenses.add({
  //   date     : random_date(),
  //   label    :  'Oil',
  //   amount   :  1234,
  //   category :  'Food',
  //   who      :  'Emil'
  // });
  // Expenses.add({
  //   date     : random_date(),
  //   label    : 'Food',
  //   amount   : 19.50,
  //   category : 'Bikes',
  //   who      : 'Katie'
  // });
  // Expenses.add({
  //   date     : random_date(),
  //   label    :  'Phone',
  //   amount   :  1234,
  //   category :  'Food',
  //   who      :  'Emil'
  // });
  // Expenses.add({
  //   date     : random_date(),
  //   label    :  'Dishcloth',
  //   amount   :  19.50,
  //   category :  'Bikes',
  //   who      :  'Katie'
  // });

  // Expenses.add({
  //   date     : random_date(),
  //   label    : 'Food',
  //   amount   : 90000,
  //   category : 'Food',
  //   who      : 'Emil'
  // });
  // Expenses.add({
  //   date     : random_date(),
  //   label    :  'Gearshifter',
  //   amount   :  19.50,
  //   category :  'Bikes',
  //   who      :  'Katie'
  // });
  // Expenses.add({
  //   date     : random_date(),
  //   label    :  'Oil',
  //   amount   :  1234,
  //   category :  'Food',
  //   who      :  'Emil'
  // });
  // Expenses.add({
  //   date     : random_date(),
  //   label    : 'Food',
  //   amount   : 19.50,
  //   category : 'Bikes',
  //   who      : 'Katie'
  // });
  // Expenses.add({
  //   date     : random_date(),
  //   label    :  'Phone',
  //   amount   :  1234,
  //   category :  'Food',
  //   who      :  'Emil'
  // });
  // Expenses.add({
  //   date     : random_date(),
  //   label    :  'Dishcloth',
  //   amount   :  19.50,
  //   category :  'Bikes',
  //   who      :  'Katie'
  // });

});
