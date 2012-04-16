(function(global) {

  /////////////////////////////
  // Models and collections

  /////////////////////////////////////////////////////
  //
  // IndexedCollection
  //

  this.IndexedCollection = function(options) {
    var ret = Backbone.Collection.apply(this, arguments);

    _.bindAll(this, '_indexedRemove', '_indexedChange', '_indexedReset', '_indexedAdd',
                    '_clearValues', '_trigger', 'getValues');

    options = options || {};

    if(!_.isArray(this.indexedAttrs)) throw "indexedAttrs property required";

    this._clearValues();

    var coll = this;
    _.each(this.indexedAttrs, function(attr) {
      coll.bind('change:' + attr, _.bind(coll._indexedChange, coll, attr));
    });

    this.bind('internal:add', this._indexedAdd);
    this.bind('internal:remove', this._indexedRemove);
    this.bind('internal:reset', this._indexedReset);

    return ret;
  };

  // Make collection update once an attributeValue is added or removed
  _.extend(IndexedCollection.prototype, Backbone.Collection.prototype, {

    getValues: function(attr) {
      return _.keys(this._attributeValues[attr]);
    },
    getCids: function(attr, val) {
      return this._attributeValues[attr][val] || [];
    },

    getModelCids: function(conditions) {
      var coll = this,
          matchingCids, cids;

      var nConditions = _.keys(conditions).length;
      if(nConditions >= 1) {
        cids = _.map(conditions, function(val, attr) {
          return coll._attributeValues[attr][val] || [];
        });
        matchingCids = _.intersection.apply(null, cids);
      } else {
        // No filter applied, include all
        matchingCids = _.keys(this._byCid);
      }

      return matchingCids;
    },

    getModelsByCid: function(cids) {
      var coll = this;
      return _.map(cids, function(cid) {
        return coll.getByCid(cid);
      });
    },

    _clearValues: function() {
      // Map of corresponding {attrs} x {values} x {models cids}
      // E.g. ['who']['John'] = [ 'c13', 'c12', 'c1' ]
      this._attributeValues = {};

      var attributeValues = this._attributeValues = {};
      _.each(this.indexedAttrs, function(attr) {
        attributeValues[attr] = {};
      });

      // FIXME: should this be triggered?
      this.trigger('index:reset');
    },

    // Wrapper function to trigger all events, to keep it DRY and consistent.
    _trigger: function(ev, attr, val, model) {
      var fns = {
        'add': function(attr, val, model) {
          this.trigger('index:add', attr, val, model);
        },
        'remove': function(attr, val, model) {
          this.trigger('index:remove', attr, val, model);
        },
        'created': function(attr, val, model) {
          this.trigger('index:created', attr, val);
        },
        'emptied': function(attr, val, model) {
          this.trigger('index:emptied', attr, val);
        }
      };

      fns[ev].call(this, attr, val, model);
    },

    _indexedReset: function() {
      this._clearValues();
      this.each(this._indexedAdd);
    },
    _indexedChange: function(attr, model, val) {
      val = val || 'Unspecified';

      var values = this._attributeValues[attr];
      var prev = model._previousAttributes[attr];

      values[prev] = _.without(values[prev], model.cid);
      this._trigger('remove', attr, prev, model);

      if(values[prev].length < 1) {
        delete values[prev];
        this._trigger('emptied', attr, prev);
      }

      if(!values[val]) {
        values[val] = [];
        this._trigger('created', attr, val);
      }

      this._trigger('add', attr, val, model);
      values[val].push(model.cid);
    },
    _indexedAdd: function(model) {
      var coll = this;
      var acs = this._attributeValues;

      _.each(this.indexedAttrs, function(attr) {
        var val = model.get(attr) || 'Unspecified';

        if(!acs[attr][val]) {
          acs[attr][val] = [];
          coll._trigger('created', attr, val, model);
        }

        acs[attr][val].push(model.cid);
        coll._trigger('add', attr, val, model);
      });
    },
    _indexedRemove: function(model, coll) {
      var coll = this;
      var acs = this._attributeValues;

      _.each(this.indexedAttrs, function(attr) {
        var values = acs[attr];
        var val = model.get(attr) || 'Unspecified';

        values[val] = _.without(values[val], model.cid);
        if(values[val].length < 1) {
          delete values[val];
          coll._trigger('emptied', attr, val);
        }

        coll._trigger('remove', attr, val, model);
      });
    }
  });
  IndexedCollection.extend = Backbone.Collection.extend;

  // Hijack events (add, remove, reset, change) and trigger a corresponding
  // ('internal:add', ...) before, and then retrigger it. We use this to
  // re-establish the index before collection events go public.

  var _trigger = IndexedCollection.prototype.trigger;
  IndexedCollection.prototype._retrigger = function(eventName, args) {
    args = [ eventName ].concat(Array.prototype.slice.call(args));
    return _trigger.apply(this, args);
  };
  IndexedCollection.prototype.trigger = function( eventName ) {
    if ( [ 'add', 'remove', 'reset', 'change' ].indexOf(eventName) >= 0) {
      var args = Array.prototype.slice.call(arguments, 1);
      _trigger.apply( this, [ 'internal:' + eventName ].concat(args) );
      _trigger.apply( this, [ eventName ].concat(args) );
    } else {
      _trigger.apply( this, arguments );
    }

    return this;
  };

  ///

  ////////////////////////////////////
  //
  // FilteredCollection:
  // implements filtering of a parent IndexedCollection,
  // using its indexes for improved efficiency.
  //
  this.FilteredCollection = function(models, options) {
    var ret = Backbone.Collection.apply(this, arguments);

    _.bindAll(this, '_update', 'setFilter', 'clearAllFilters', 'clearFilter',
                    '_proxyEvents');

    options = options || {};

    if(!options.parent || !(options.parent instanceof IndexedCollection)) {
      throw "options.parent must be an IndexedCollection";
    }

    var parent = this._parent = options.parent;

    this._filters = {};

    parent.bind('remove', this.remove);
    // FIXME: might be more efficient to just check filters for this
    //        single model, rather than working with the whole index.
    parent.bind('add', this._update);
    parent.bind('reset', this._update);
    parent.bind('all', this._proxyEvents);


    this._update();

    return ret;
  };

  _.extend(FilteredCollection.prototype, Backbone.Collection.prototype, {
    // _update():
    //
    // Synchronizes collection with parent collection, using the index.
    // Efficiency by calculating models toRemove and toAdd, instead of
    // resetting the whole thing; utiizing progressive refinement of filter.
    //
    _update: function() {
      var currentCids = _.keys(this._byCid);
      var newCids = this._parent.getModelCids(this._filters);

      var toRemove = _.difference(currentCids, newCids);
      var toAdd = _.difference(newCids, currentCids);

      var self = this; var parent = this._parent;
      toRemove = _.map(toRemove, function(cid) { return self.getByCid(cid); });
      toAdd = _.map(toAdd, function(cid) { return parent.getByCid(cid); });

      this.remove(toRemove);
      this.add(toAdd);
    },

    sort: function(options) {
      options || (options = {});

      Backbone.Collection.prototype.sort.call(this, _.extend({}, options, { silent: true }));
      // Reverse logic: default sorting is descending, i.e. Z-A, we want A-Z per default.
      if(!options.reverse) this.models.reverse();
      if (!options.silent) this.trigger('reset', this, options);

      return this;
    },
    comparator: function(model) {
      return this.sortAttr ?
        model.get(this.sortAttr) : 1;
    },

    _proxyEvents: function(eventName) {
      if(eventName.match(/^index:/)) {
        this.trigger.apply(this, arguments);
      }
    },

    getValues: function(attr) {
      return this._parent.getValues(attr);
    },

    setFilter: function(attr, val) {
      this._filters[attr] = val;
      this._update();
    },
    clearFilter: function(attr) {
      delete this._filters[attr];
      this._update();
    },
    clearAllFilters: function() {
      this._filters = {};
      this._update();
    }
  });

  //
  ///////////////////////////////////////////////////////

  this.AggregateModel = Backbone.Model.extend({
    initialize: function() {
      _.bindAll(this, 'recalculate');
    },
    recalculate: function() {
      var total = 0;
      _.each(this.get('children'), function(model) {
        total += model.get('amount');
      });

      this.set({ total: total });
    }
  });

  this.AggregateCollection = Backbone.Collection.extend({
    model: AggregateModel,
    initialize: function(options) {
      _.bindAll(this, '_aggrAdd', '_aggrRemove', '_aggrReset');

      options = options || {};

      if(!options.collection) throw "parent collection required";

      this.collection = options.collection;
      this._aggregateFields = [];

      this.collection.bind('change', this._aggrChange);
      this.collection.bind('add', this._aggrAdd);
      this.collection.bind('remove', this._aggrRemove);
      this.collection.bind('reset', this._aggrReset);
    },

    _aggrChange: function() {
      console.log('_aggrChange: %o', arguments);
    },
    _aggrAdd: function(model) {
      var key = this._getAggregateKey(model),
          id = key.length > 0 ? key.join('-') : model.id,
          aggregateModel = this.get(id);

      if(!aggregateModel) {
        aggregateModel = new AggregateModel({
          id: id,
          key: key,
          children: [],
          total: 0
        });
        this.add(aggregateModel);
      }

      aggregateModel.get('children').push(model);
      aggregateModel.recalculate();
    },
    _aggrRemove: function(model) {
      var key = this._getAggregateKey(model),
          id = key.length > 0 ? key.join('-') : model.id,
          aggregateModel = this.get(id);

      if(aggregateModel) {
        if(aggregateModel.get('children').length <= 1) {
          this.remove(aggregateModel);
        }
      }
    },
    _aggrReset: function(collection) {
      this.reset();
      this.collection.each(_.bind(this._aggrAdd, this));
    },

    setAggregateKeys: function(keys) {
      this._aggregateFields = _.extend({}, keys);
      this._aggrReset();
    },

    _getAggregateKey: function(model) {
      var key = [];
      key = _.map(this._aggregateFields, function(field) {
        return model.get(field) || 'Unspecified';
      });

      return key;
    }
  });

  this.Expense = Backbone.Model.extend({
    defaults: {
      date: '1 Jan',
      amount: 0,
      who: '',
      label: 'Unspecified',
      category: 'Misc'
    },

    get: function(attr) {
      var ret = null;

      switch(attr) {
        case 'period':
          ret = this.get('date').format('mmmm -yy');
          break;
        default:
          ret = Backbone.Model.prototype.get.apply(this, arguments)
      }

      return ret;
    },

    parse: function(data) {
      if(data.date) data.date = new Date(data.date);

      return data;
    }
  });

  this.ExpenseList = IndexedCollection.extend({
    indexedAttrs: [ 'who', 'category', 'period' ],

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
      this._sieves = _.without(this._sieves, fn);
      this.refresh();
    },
    clearSieves: function() {
      this._sieves = [];
      this.refresh();
    },

    refresh: function() {
      this._resetSubset(this.parent().models);
    }

  });

} (this));
