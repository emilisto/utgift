
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

    this._selected = !!this.model.get('selected');

    var view = this;
    this.model.on('destroy', function() {
      $(view.el).detach();
    });

    this.render();

    if(this._selected) this.selectOne();

    if(this.model.get('new')) {
      // FIXME: this is unreliable
      _.delay(this.edit, 50);
    }
  },

  deselect: function() {
    if(this._selected) {
      this._selected = false;
      this.trigger('select', false);
      this.model.set({ 'selected': false });
      this.render();
    }
  },
  selectOne: function() {
    var self = this;
    _.delay(function() {
      var state = $('input[type="checkbox"]', self.el).is(':checked');
      self._selected = state;
      self.trigger('select', state);

      self.model.set({ 'selected': state });
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

  _clickOutside: function(ev) {
    // jQuery `datepicker` and Twitter `typeahead` create elements directly in body
    // - catch the bastards!
    var $target = $(ev.target);
    if($target.parents('.ui-datepicker').length) return;
    if($target.parents('.typeahead').length) return;

    this.save();
  },

  cancelEdit: function() {
    $(this.el).removeClass('editable');
    this.editing = false;
    $('html').off('click', this._clickOutside);
  },
  edit: function(field) {
    var self = this;

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

    $('input[name="date"]', this.el).datepicker({
      dateFormat: 'd M -y',
      onClose: function() {
        var td = $('td[rel="date"]', self.el).next('td').children('input');
        td.focus();
      }
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

    _.each(['date', 'label', 'amount', 'category', 'who'], function(name) {
      var input = $('[name=' + name + ']', self.el),
          span = input.siblings('span');

      $(span).html(input.val());

      var val = input.val();
      if(name === 'date') {

        // FIXME: this is horribly error-prone, date format is assumed in 18 different places,
        //         - do some systematic date-handling damnit.
        var parts = val.match(/(\d+) (\w+) -(\d+)/);
        var dateStr = parts[1] + ' ' + parts[2] + ' 20' + parts[3];
        val = new Date(dateStr);
      } else if(name === 'amount') {
        val = parseFloat(val.replace(/[^0-9.]/, ''));
        console.log('fixed val: %d', val);
      }

      attrs[name] = val;

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

    json.amount = accounting.formatNumber(json.amount, 2, " ");

    $(this.el).html( this.template(json) );
  }

});

this.ClassFilterView = Backbone.View.extend({

  template: _.template( $('#class-filter-template').html() ),
  className: 'class-filter',
  //className: 'nav nav-pills nav-stacked',

  events: {
    'click li': 'clickClass',
    'click .btn.main': 'clickMain'
  },

  initialize: function(options) {
    _.bindAll(this, 'render', 'clickClass', 'setFilter', 'clearFilter', 'checkEmpty', 'clickMain');

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

  clickMain: function(ev) {
    if(this._currentFilter) {
      this.clearFilter();
    } else {
      $('.btn-group', this.el).toggleClass('open');
      ev.stopPropagation();
    }
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

      $(this.el).addClass('active');
      $('li', this.el).removeClass('active');
      $li.addClass('active');
      $('.btn.main', this.el).html(value);

      this._currentFilter = value;

    }
  },
  clearFilter: function() {
    this.collection.clearFilter(this.attr);
    $('li', this.el).removeClass('active');
    $(this.el).removeClass('active');

    $('.btn.main', this.el).html(this.label);
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
    var classes = this.collection.getValues(this.attr);

    if(this._currentFilter) {
      $('a[rel="' + this._currentFilter + '"]', this.el).parent('li').addClass('active');
    }

    $(this.el).html( this.template({
      label: this.value || this.label,
      classes: classes
    }));

    this.delegateEvents();
  }

});


this.SelectedView = Backbone.View.extend({
  id: 'view-selected',
  template: _.template( $('#selected-template').html() ),

  events: {
    'click .btn-save-all': 'btnSave',
    'click .btn-restore': 'btnRestore',
    'click .btn-deselect-all': 'btnDeselectAll',
    'click .btn-remove-all': 'removeAll'
  },

  initialize: function(parent) {
    _.bindAll(this, 'updateSelections', 'selectOne', 'render', 'save', 'removeAll',
                    '_loadTypeAhead', 'btnSave', 'btnRestore', 'btnDeselectAll');

    this.collection = new Backbone.Collection();

    this._loadTypeAhead = _.debounce(this._loadTypeAhead, 50);
    Expenses.on('index:created', this._loadTypeAhead);
    Expenses.on('index:emptied', this._loadTypeAhead);

    this.on('expense:select', this.selectOne);

    // Does magic for select/deselect all
    this.updateSelections = _.debounce(this.updateSelections, 50);

    this._views = {};
    this.collection.on('add remove reset', this.updateSelections);

    this.render();
  },


  keys:  [ 'label', 'amount', 'category', 'who', 'date' ],

  updateSelections: function() {
    var self = this;
    var coll = this.collection;

    var n = coll.length;
    $('#edit-all h2', this.el).html(n + ' selected');

    // Show panel if n >= 1
    if(!n) {
      $('#edit-all', this.el).slideUp();
      this.trigger('hide');
      return;
    }

    if(!$('#edit-all', this.el).is(':visible')) {
      $('#edit-all', this.el).slideDown();
      this.trigger('show');
    }

    // Find values common to all selected rows
    var identical = {};

    _.each(this.keys, function(key) {
      var vals = coll.pluck(key);

      if(key === 'date') {
        vals = _.map(vals, function(date) {
          return date.format('d mmm -yy');
        });
      }

      var unique = _.uniq(vals);
      if(unique.length === 1) identical[key] = vals[0];
    });

    _.each(this.keys, function(key) {
      var $el = $('input[name="' + key + '"]', self.el);
      $el.val(identical[key] ? identical[key] : '');
    });
  },
  selectOne: function(view, state) {
    var collModel = this.collection.getByCid(view.model.cid);

    if(state) {
      if(!collModel) {
        this._views[view.model.cid] = view;
        this.collection.add(view.model);
      }
    } else {
      if(collModel) {
        delete this._views[view.model.cid];
        this.collection.remove(view.model);
      }
    }
  },

  btnSave: function() {
    this.save();
  },
  btnDeselectAll: function() {
    _.each(this._views, function(view) {
      view.deselect();
    });
  },
  btnRestore: function() {
    this.updateSelections();
  },

  save: function() {
    var self = this;
    var values = {};
    _.each(this.keys, function(key) {
      var val = $('input[name="' + key + '"]', self.el).val();

      if(val) {
        if(key === 'date') {

          // FIXME: this is horribly error-prone, date format is assumed in 18 different places,
          //         - do some systematic date-handling damnit.
          var parts = val.match(/(\d+) (\w+) -(\d+)/);
          var dateStr = parts[1] + ' ' + parts[2] + ' 20' + parts[3];
          val = new Date(dateStr);
        }

        values[key] = val;
      }
    });

    this.collection.each(function(model) {
      model.save(values);
    });
  },
  removeAll: function() {
    var models = Array.prototype.slice.call(this.collection.models);
    _.each(models, function(model) { model.destroy(); });
  },
  _loadTypeAhead: function() {
    $('input[name="category"]', this.el).typeahead({
      source: Expenses.getValues('category')
    });
    $('input[name="who"]', this.el).typeahead({
      source: Expenses.getValues('who')
    });
  },
  render: function() {
    $(this.el).html( this.template());
    this.delegateEvents();


    $('input[name="date"]', this.el).datepicker({
      dateFormat: 'd M -y'
    });

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
    'click th[rel="select"] input': 'clickSelectAll',
    'click #pagination': 'clickShowMore'
  },

  initialize: function(parent) {
    if(!this.collection) throw "must supply collection";

    _.bindAll(this, 'addOne', 'resetViews', 'render', 'sortColumn', 'search', 'filterOne',
                    'refreshSearch', 'updateSelectAll', 'clickSelectAll', 'cancelPreviousEdit',
                    '_clearFilterCache', 'resetPagination', 'isEditing', 'selectAll', 'deselectAll');

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

    console.log(this.collection);
    window.coll = this.collection;

    this.updateSelectAll = _.debounce(this.updateSelectAll, 50);
    this.on('expense:select', this.updateSelectAll);
    this.collection.on('add remove reset', this.updateSelectAll);

    this.on('expense:editing', this.cancelPreviousEdit);

    this.collection.on('filter:clear filter:set', this._clearFilterCache);
    this.collection.on('filter:clear filter:set', this.resetPagination);
    this.collection.on('filter:clear filter:set', this.refreshSearch);

    this.on('search', this.resetPagination);

    var view = this;
    this.collection.on('change', _.debounce(function() {
      if(!view.isEditing()) view.collection.sort();
    }, 200));

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
    $('td[rel="select"] input')
      .filter(function() { return $(this).parents('tr').is(':visible'); })
      .attr('checked', 'checked')
      .trigger('change');
  },
  deselectAll: function() {
    $('td[rel="select"] input')
      .removeAttr('checked')
      .trigger('change');
  },
  clickSelectAll: function() {
    var $selectAll = $('th input[name="select"]', this.el);
    var nSelected = $('td input[name="select"]:checked', this.el).length;

    if($selectAll.is(':checked')) {
      this.selectAll();
    } else {
      this.deselectAll();
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
      coll.sortReverse = coll.sortAttr === col ? (!coll.sortReverse) : false;
      coll.sortAttr = col;

      this.collection.sort();
    }
  },

  //////////////////
  // Search
  //
  // TODO: clarify this and how it interacts with filters
  //

  refreshSearch: _.debounce(function() {
    if(this._currentFilter) this.search(this._currentFilter);
  }, 100),
  _currentSearch: null,
  search: function(str) {
    var view = this;
    var views = this._views;

    if(str) {
      this.trigger('search', str);

      this._currentSearch = str;
      this.collection.each(function(model) {
        model.matches = view.filterOne(model, str);

      });
    } else {
      this.collection.each(function testing(model) { delete model.matches; });
      this._currentSearch = '';
    }

    this.render();
  },

  filterOne: function(model) {
    var fields = [ 'who', 'label', 'category' ];
    var str = this._currentSearch;

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
    if(this._currentSearch) {

      this._filterCache = {};
      var models = this.collection.filter(function(model) { return model.matches; });
      this._filterCache[this._currentSearch] = models;

      return this._filterCache[this._currentSearch];
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
      var upOrDown = this.collection.sortReverse ? 'down' : 'up';
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
    'click #search-all': 'searchAll',
    'click #tabbar li a': 'showTab'
  },

  showSelected: function() {
    $('#tabbar li a[rel="selected"]', this.el).click();

  },
  showTab: function(ev) {

    var rel = $(ev.target).attr('rel');
    if(rel === 'selected') {
      this.filteredExpenses.setFilter('selected', true);
    } else {
      this.filteredExpenses.clearFilter('selected');
    }

  },

  initialize: function() {
    _.bindAll(this, 'render', 'create', 'showAddBatch', 'search', 'cancelSearch', 'editCategory',
                    'clearFilters', 'showTab', 'showSelected');

    var view = this;

    this.collection = Expenses;
    this.filteredExpenses = new FilteredCollection([], {
      parent: Expenses
    });

    this.expensesView = new ExpensesView({ collection: this.filteredExpenses });

    // FIXME: maybe do Dependency Injection of ExpensesView here?
    this.selectedView = new SelectedView();
    this.expensesView.on('expense:select', this.selectedView.selectOne);

    // Add space below ExpensesView so one can see the bottom-most expenses
    // even when SelectedView is shown, covering approx ~220 px of the bottom.
      this.selectedView.on('show', function() {
        $('#ExpensesView', view.el).css({ 'margin-bottom': '220px' });
      });
      this.selectedView.on('hide', function() {
        console.log('hidden!');
        $('#ExpensesView', view.el).css({ 'margin-bottom': '10px' });
      });


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

    this.render();

    //this.showCurrentMonth();
  },

  showCurrentMonth: function() {
    var now = (new Date).format('mmmm -yy');
    this.monthFilter.setFilter(now);

    this.whoFilter.clearFilter();
    this.categoryFilter.clearFilter();
  },
  clearFilters: function() {
    _.each(this.filters, function(filter) { filter.clearFilter(); });
  },
  editCategory: function(label) {
    var self = this;

    this.clearFilters();
    this.categoryFilter.setFilter(label);

    // FIXME: don't rely on timers for this, since its unreliable
    _.delay(function() {
      self.expensesView.selectAll();
    }, 200);
  },

  cancelSearch: function(ev) {
    $('#search input', this.el).val('').trigger('keyup');
  },
  searchAll: function(ev) {
    this.clearFilters();
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
    this.expensesView.search(str);
  }, 50),



  showAddBatch: function() {
    new AddBatchView({ app: this });
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

    var self = this;
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
    'paste #paste': 'batchAdd',
    'click .btn': 'close',
    'keyup #who': 'editWho'
  },

  initialize: function(options) {

    options = options || {};
    _.bindAll(this, 'render', 'batchAdd', 'close', 'editWho');

    if(!options.app) throw "must inject App";

    this.app = options.app;

    this.collection = new ExpenseList;
    this.expensesView = new ExpensesView({ collection: this.collection });

    $(this.el).appendTo('body');
    $(this.el).modal({ show: true, backdrop: false });

    this.editWho = _.throttle(this.editWho, 300);

    this.render();

    $('#paste', this.el).focus();

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
    var self = this;
    var $input = $('#paste', this.el);
    var defaultCategory = 'Just added';

    _.defer(_.bind(function() {
      var str = $input.val();
      var parser = new AccountParser;
      var expenses = parser.parse(str);

      expenses = _.map(expenses, function(expense) {
        return new Expense(_.extend({
          category: defaultCategory,
          selected: true
        }, expense));
      });

      Expenses.add(expenses);
      // self.app.editCategory(defaultCategory);

      self.app.showSelected();

      self.close();

      $input.val('');

      // $('#ExpensesView', self.el).show();

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

  Expenses.bind('all', function(ev) {
    if(!ev.match(/index:/)) {
      //console.log('Expenses: %s %o', ev, arguments);
    }
  });

  var app = new AppView();
  $('body').append(app.el);

  window.app = app;

  //app.showAddBatch();

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
