
/////////////////////////////
// Views

this.Expenses = new ExpenseList;

this.ExpenseView = Backbone.View.extend({
  tagName: "tr",
  template: _.template( $('#expense-template').html() ),

  events: {
    'dblclick': 'clickEdit',
    'click .btn-save': 'save',
    'click .btn-remove': 'remove',
    'click .btn-edit': 'clickEdit',
    'keyup input': 'keyCommand',
    'change td[rel="select"] input': 'selectOne'
  },

  initialize: function(options) {
    if(!this.model) throw "must supply model";

    _.bindAll(this, 'render', 'edit', 'cancelEdit', '_clickOutside', 'clickEdit', 'save', 'keyCommand',
                    'selectOne', 'deselect');

    this.parent = options.parent;

    // This causes the expense to be redrawn while user is editing,
    // resulting in lost focus of field. Use 'new' attr to prevent re-
    // rendering.
    this.model.on('change', this.render);

    var view = this;
    this.model.on('destroy', function() {
      $(view.el).detach();
    });

    this.render();

    if(this.model.get('new')) {
      _.delay(this.edit, 50);
    }
  },

  deselect: function() {
    if(this._selected) {
      this._selected = false;
      this.trigger('select', false);
      this.render();
    }
  },
  selectOne: function() {
    var self = this;
    _.delay(function() {
      var state = $('input[type="checkbox"]', self.el).is(':checked');
      self._selected = state;
      self.trigger('select', state);
    });
  },

  keyCommand: function(ev) {
    if(!ev) return;

    var field = $(ev.target).parent('td').attr('rel');

    //
    // - Shift + Up / Down saves and edits next/previously respectively
    // - Enter saves and edits next
    //
    if(
      (ev.shiftKey && [38, 40].indexOf(ev.keyCode) >= 0) ||
      (!ev.shiftKey && ev.keyCode === 13)
    ) {

      this.parent.editNeighbour(ev.keyCode === 38 ? 'prev' : 'next');

    }
    // Shift + Enter saves without editing next
    else if(ev.shiftKey && ev.keyCode === 13) {
      this.save();
    }
  },

  clickEdit: function(ev) {
    var $td = null;

    if(this.editing) return;

    if(ev && ev.target) {
      $td = ev.target.tagName === 'TD' ?
        $(ev.target) : $(ev.target).parents('td');
    }

    // FIXME: clean this up
    if($td && $td.attr('rel') === 'select') return;

    var $input = $td ? $('input', $td) : null;
    if(!$input || !$input.length) $input = $($('td input', this.el).get(1));

    this.edit($input.length ? $input.attr('name') : null);
  },

  _clickOutside: function() {
    this.cancelEdit();
  },

  cancelEdit: function() {
    $(this.el).removeClass('editable');
    this.editing = false;
    $('html').off('click', this._clickOutside);
  },
  edit: function(field) {
    this.trigger('editing');
    this.editing = true;

    field = field || 'label';

    $(this.el).addClass('editable');

    // Autocompletion
    // FIXME: this is spaghetti coding
    $('input[name="category"]', this.el).typeahead({
      source: Expenses.getValues('category')
    });
    $('input[name="who"]', this.el).typeahead({
      source: Expenses.getValues('who')
    });

    // If user clicks outside the row, cancel edit
    $('html').on('click', this._clickOutside);
    $(this.el).bind('click', function(ev) { ev.stopPropagation(); });

    // Focus the input element
    var $input = $('input[name="' + field + '"]', this.el);
    $input.focus();
  },
  remove: function() {
    if(confirm('Are you sure?')) {
      this.model.destroy();
    }
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

    this.cancelEdit();

    // FIXME: Fix sorting that doesn't reset the view state
    //this.model.collection.sort();
  },

  render: function() {
    var json = this.model.toJSON();
    json.selected = !!this._selected;

    var date = new Date(this.model.get('date'));
    json.date = date.format('d mmm -yy');
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
    _.bindAll(this, 'render', 'clickClass', 'setFilter', 'clearFilter', 'checkEmpty');

    options = options || {};

    if(!options.collection) throw "must supply collection";
    this.collection = options.collection;

    if(!options.attr) throw "must supply attr";

    var attr = this.attr = options.attr;
    this.label = options.label || 'Filter: ' + this.attr;

    var eventFilter = function(attr) {
      if(attr === this.attr) this.render();
    };

    this.collection.on('index:emptied index:created', eventFilter, this);
    this.collection.on('index:emptied', this.checkEmpty);

    this.render();
  },

  checkEmpty: function(attr) {
    if(attr === this.attr) this.clearFilter();
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

    // FIXME: quick and dirty sorting
    classes.reverse();

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


this.SelectedView = Backbone.View.extend({
  id: 'view-selected',
  template: _.template( $('#selected-template').html() ),

  events: {
    'click .btn-save-all': 'saveAll',
    'click .btn-cancel': 'cancel',
    'click .btn-remove-all': 'removeAll'
  },

  initialize: function(parent) {
    _.bindAll(this, 'updateSelections', 'selectOne', 'render', 'saveAll', 'cancel', 'removeAll');

    this.collection = new Backbone.Collection();

    this.on('expense:select', this.selectOne);

    // Does magic for select/deselect all
    this.updateSelections = _.debounce(this.updateSelections, 50);

    this._views = {};
    this.collection.on('add remove reset', this.updateSelections);

    this.render();
  },


  keys:  [ 'label', 'amount', 'category', 'who' ],

  updateSelections: function() {
    var self = this;
    var coll = this.collection;

    var n = coll.length;
    $('#edit-all h2', this.el).html(n + ' selected');

    // Show panel if n >= 1
    if(!n) {
      $('#edit-all', this.el).slideUp();
      return;
    }

    $('#edit-all', this.el).slideDown();

    // Find values common to all selected rows
    var identical = {};

    _.each(this.keys, function(key) {
      var vals = coll.pluck(key);
      var unique = _.uniq(vals);
      if(unique.length === 1) identical[key] = vals[0];
    });

    _.each(this.keys, function(key) {
      var $el = $('input[name="' + key + '"]', self.el);
      $el.val(identical[key] ? identical[key] : '');
    });
  },
  selectOne: function(view, state) {
    if(state) {
      if(!this.collection.get(view.model)) {
        this._views[view.model.cid] = view;
        this.collection.add(view.model);
      }
    } else {
      if(this.collection.get(view.model)) {
        delete this._views[view.model.cid];
        this.collection.remove(view.model);
      }
    }
  },
  cancel: function() {
    _.each(this._views, function(view) {
      view.deselect();
    });
  },
  saveAll: function() {
    var self = this;
    var values = {};
    _.each(this.keys, function(key) {
      var val = $('input[name="' + key + '"]', self.el).val();
      if(val) values[key] = val;
    });

    this.collection.each(function(model) {
      model.save(values);
    });

    this.cancel();
  },
  removeAll: function() {
    var models = Array.prototype.slice.call(this.collection.models);
    _.each(models, function(model) { model.destroy(); });
  },
  render: function() {
    $(this.el).html( this.template());
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
    'click th[rel="select"] input': 'selectAll',
    'click #pagination': 'clickShowMore'
  },

  initialize: function(parent) {
    if(!this.collection) throw "must supply collection";

    _.bindAll(this, 'addOne', 'resetViews', 'render', 'sortColumn', 'filter', 'filterOne',
                    'refreshFilter', 'updateSelectAll', 'selectAll', 'cancelPreviousEdit',
                    '_clearFilterCache', 'resetPagination', 'isEditing');

    this._views = {};

    // Init pagination
    this._defaultPageSize = 20;
    this._pageIncrement   = 20;
    this._pageSize        = this._defaultPageSize;


    // Debounce omnipotent functions
    
      // debouncing of _updateTotal not needed, since it is only called from render for now
      // this._updateTotal = _.debounce(this._updateTotal, 50);
      //
      // Idea: create a mix of throttle and debounce, that executes function immediately,
      //       but if invoked again within N ms, debounces it N ms
      //

      this.render = _.debounce(this.render, 50);

    // Default sorting
    this.collection.sortAttr = 'date';
    this.collection.sort();

    this.updateSelectAll = _.debounce(this.updateSelectAll, 50);
    this.on('expense:select', this.updateSelectAll);
    this.collection.on('add remove reset', this.updateSelectAll);

    this.on('expense:editing', this.cancelPreviousEdit);

    this.collection.on('filter:clear filter:set', this._clearFilterCache);
    this.collection.on('filter:clear filter:set', this.resetPagination);
    this.on('search', this.resetPagination);

    var view = this;
    this.collection.on('change', _.debounce(function() {
      if(!view.isEditing()) view.collection.sort();
    }, 100));

    //////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Re-render the whole view on (add, remove, reset) to manage the three contraints
    // (filter, search, pagination). This is usually handled more efficiently by removing and
    // adding single views, but with these 3 constraints the logic becomes much more involved.
    //
    // It works unless it PROVES to be a practical bottleneck.
    //
    this.collection.on('add remove reset', this.render);

    window.ev = this;

    this.render();
  },

  isEditing: function() {
    return _.any(this._views, function(view) {
      return view.editing;
    });
  },
  cancelPreviousEdit: function(view) {
    _.each(this._views, function(otherView) {
      if(otherView !== view && otherView.editing) {
        otherView.cancelEdit();
      }
    });
  },

  //////////////////
  // Selections
  updateSelectAll: function() {
    var $selectAll = $('th input[name="select"]', this.el);
    var nSelected = $('td input[name="select"]:checked', this.el).length;
    var nVisible = $('td[rel="select"] input')
      .filter(function() { return $(this).parents('tr').is(':visible'); })
      .length;

    if(nSelected === nVisible) {
      $selectAll.attr('checked', 'checked');
    } else {
      $selectAll.removeAttr('checked');
    }
  },
  selectAll: function() {
    var $selectAll = $('th input[name="select"]', this.el);
    var nSelected = $('td input[name="select"]:checked', this.el).length;

    if($selectAll.is(':checked')) {
      $('td[rel="select"] input')
        .filter(function() { return $(this).parents('tr').is(':visible'); })
        .attr('checked', 'checked')
        .trigger('change');
    } else {
      $('td[rel="select"] input')
        .removeAttr('checked')
        .trigger('change');
    }
  },

  // Used for Shift + Up / Down, to edit the expense before or after
  editNeighbour: function(which) {
    var active = _.filter(this._views, function(view) {
      return $(view.el).hasClass('editable');
    }).pop();

    var activeField = $('input:focus', active.el).attr('name');

    var selector = this._currentFilter ? '.matching' : null;

    var fn = { 'next': 'nextAll', 'prev': 'prevAll' }[which];
    if(!fn) throw "which must be 'next' or 'prev'";

    var next = $(active.el)[fn](selector).first()

    active.save();

    if(next && next.length) $('td[rel=' + activeField + ']', next).dblclick();
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

  //////////////////
  // Search

  refreshFilter: _.debounce(function() {
    if(this._currentFilter) this.filter(this._currentFilter);
  }, 100),
  _currentFilter: null,
  filter: function(str) {
    var view = this;
    var views = this._views;

    if(str) {
      this.trigger('search', str);

      this._currentFilter = str;
      this.collection.each(function(model) {
        // var $el = $(views[model.cid].el);
        //matches ? $el.addClass('matching').show() : $el.removeClass('matching').hide();

        model.matches = view.filterOne(model, str);

      });
    } else {
      this.collection.each(function testing(model) { delete model.matches; });
      this._currentFilter = '';
    }

    this.render();
    // this._updateTotal();
    // this.updateSelectAll();
  },

  filterOne: function(model) {
    var fields = [ 'who', 'label', 'category' ];
    var str = this._currentFilter;

    if(!str) return true;

    var regexps = _.map(str.split(' '), function(str) { return new RegExp(str, 'gi'); });
    var matchStr = _.map(fields, function(field) { return model.get(field) || ' '; }).join(' ');
    return _.all(regexps, function(re) { return matchStr.match(re) });
  },


  clickShowMore: function(ev) {
    this.showMore();
    ev.preventDefault();
  },
  _pageVisible: 0,
  hasMore: function() {
    return this._pageSize < this.filterModels().length;
  },
  showMore: function() {
    if(this.hasMore()) {
      this._pageSize += this._pageIncrement;
      this.render();
    } else {
      console.log('emptied!');
    }
  },
  resetPagination: function() {
    this._pageSize = this._defaultPageSize;
    this.render();
  },

  _filterCache: {},
  _clearFilterCache: function() {
    this._filterCache = {};
  },
  filterModels: function() {
    if(this._currentFilter) {

      if(!this._filterCache[this._currentFilter]) {
        this._filterCache = {};
        var models = this.collection.filter(function(model) { return model.matches; });
        this._filterCache[this._currentFilter] = models;
      }

      return this._filterCache[this._currentFilter];
    } else {
      return Array.prototype.slice.call(this.collection.models);
    }
  },
  getModels: function() {
    var models = this.filterModels();
    // Pagination here
    models = models.slice(0, this._pageSize);

    return models;
  },

  resetViews: function() {
    _.each(this.getModels(), this.addOne);
    this._updateTotal();
  },
  addOne: function(model) {
    if(this._pageVisible >= this._pageSize) return;
    this._pageVisible++;

    var view = this.findView(model);

    if(!this.filterOne(model)) $(view.el).hide();

    // This halves the time this method takes
    this.$tbody.append(view.el);

    view.delegateEvents();
  },
  findView: function(model) {
    var self = this;
    var view = this._views[model.cid];

    if(!view) {
      view = new ExpenseView({ model: model, parent: this });

      // Proxy events from view
      view.on('all', function(eventName) {
        var args = Array.prototype.slice.call(arguments, 1);
        args = [ 'expense:' + eventName, view ].concat(args);
        self.trigger.apply( self, args);
      });

      this._views[model.cid] = view;
    }

    return view;
  },


  _total: 0,
  _updateTotal: function() {
    var views = this._views;
    var total = 0;

    _.each(this.filterModels(), function(model) {
      total += model.get('amount');
    });

    // FIXME
    total = Math.round( total * 100 ) / 100
    if(this._total !== total) {
      this._total = total;
      $('tr.total .amount').html(Math.round(total, 2));
    }
  },


  render: function() {
    $(this.el).html( this.template({
      pagePercentage: Math.round(this._pageVisible / this.filterModels().length * 100),
      total: this._total ? this._total : ''
    }));
    this.$tbody = $('#main tbody', this.el);

    this._pageVisible = 0;
    this.resetViews();

    if(this.collection.sortAttr) {
      var sortColSelector = 'thead th[rel="' + this.collection.sortAttr + '"]';
      var upOrDown = this.reverseSort ? 'down' : 'up';
      $(sortColSelector + ' .icon-chevron-' + upOrDown, this.el).css('display', 'inline-block');
    }

    var percentage = Math.round(this._pageVisible / this.filterModels().length * 100);
    $('.progress .bar', this.el).css('width', percentage + '%');
    if(!this.hasMore()) {
      $('tr#pagination', this.el).addClass('no-more');
    }

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

    this.model.on('change', this.render);

    var view = this;
    this.model.on('destroy', function() {
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

    this.collection.on('reset', this.render);
    this.collection.on('add', this.addOne);

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
    'keyup #search input': 'search',
    'click #search .cancel .icon-remove-sign': 'cancelSearch',
    'click #search-all': 'searchAll'
  },

  initialize: function() {
    _.bindAll(this, 'render', 'create', 'showAddBatch', 'search', 'cancelSearch');

    this.collection = Expenses;
    this.filteredExpenses = window.Filtered = new FilteredCollection([], {
      parent: Expenses
    });

    this.expensesView = new ExpensesView({ collection: this.filteredExpenses });

    // FIXME: maybe do Dependency Injection of ExpensesView here?
    this.selectedView = new SelectedView();
    this.expensesView.on('expense:select', this.selectedView.selectOne);

    // Aggregation
      this.aggregatedCollection = new AggregateCollection({ collection: Expenses });
      this.aggregatedCollection.setAggregateKeys(['who', 'category']);
      this.aggregateView = new AggregatedExpensesView({ collection: this.aggregatedCollection });

    // Filters
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

      // FIXME: make subclass MonthFilterView of ClassFilterView to 
      // sort properly and enable expand/collapse of months
      this.monthFilter = new ClassFilterView({
        label: 'Months',
        attr: 'period',
        collection: this.filteredExpenses
      });

      this.filters = [ this.monthFilter, this.categoryFilter, this.whoFilter ];

    window.av = this;

    this.render();

    //this.showCurrentMonth();
  },

  showCurrentMonth: function() {
    var now = (new Date).format('mmmm -yy');
    this.monthFilter.setFilter(now);

    this.whoFilter.clearFilter();
    this.categoryFilter.clearFilter();
  },

  cancelSearch: function(ev) {
    $('#search input', this.el).val('').trigger('keyup');
  },
  searchAll: function(ev) {
    _.each(this.filters, function(filter) { filter.clearFilter(); });
    ev.preventDefault();
  },

  // Debounce prevents new search on every key stroke
  search: _.debounce(function() {
    var str = $('#search input', this.el).val();
    if(str) {
      $('#search', this.el).addClass('active');
    } else {
      $('#search', this.el).removeClass('active');
    }
    this.expensesView.filter(str);
  }, 50),



  showAddBatch: function() {
    new AddBatchView;
  },

  create: function() {
    var model = new Expense({
      'date': new Date(),
      'new': true
    });

    this.collection.create(model);
    this.showCurrentMonth();
  },

  render: function() {
    $(this.el).html( this.template() );

    _.defer(_.bind(function() {
      $('#ExpensesView').append(this.expensesView.el);
      $('#SelectedView').append(this.selectedView.el);
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

$(function(){

  var host = ExpenseApp.config.hostname;
  var socket = window.socket = io.connect(host);

  Expenses.fetch();

  //Expenses.bind('all', function(ev) {
    // if(!ev.match(/index:/)) {
      //console.log('Expenses: %s %o', ev, arguments);
    // }
  //});

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
