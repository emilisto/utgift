var express     = require('express'),
    socketio    = require('socket.io'),
    util        = require('util'),
    mongoose    = require('mongoose'),
    _           = require('underscore')._,
    Schema      = mongoose.Schema,
    routes = require('./routes');

var app = module.exports = express.createServer();

app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.get('/js/vendor.js', routes.vendorjs);

//////////////////////////////////
// Setup Mongoose and create a schema

  var ExpenseSchema = new Schema({
    date: Date,
    amount: Number,
    who: String,
    label: String,
    category: String
  });

  var db = mongoose.connect('mongodb://localhost/expenses');
  var Expense = db.model('Expense', ExpenseSchema);
  var expense;

  // expense = new Expense;
  // expense.date = new Date();
  // expense.label = 'Test';
  // expense.amount = 100;
  // expense.category = 'Food';
  // expense.who = 'Emil';
  // expense.save();

  // expense = new Expense;
  // expense.date = new Date();
  // expense.label = 'Nils';
  // expense.amount = 325;
  // expense.category = 'BIkes';
  // expense.who = 'Katie';
  // expense.save();


function toJSON(expense) {
  expense = expense.toObject();
  expense.id = expense._id;
  delete expense._id;

  return expense;
}

var io = socketio.listen(app);
io.sockets.on('connection', function (socket) {

  /**
   * expenses:create
   *
   * called when we .save() our new expense
   *
   * we listen on model namespace, but emit
   * on the collection namespace
   */

  socket.on('expenses:create', function (data, callback) {
    var expense = new Expense;

    _.extend(expense, data);
    expense.save();

    var json = toJSON(expense);

    socket.emit('expenses:create', json);
    socket.broadcast.emit('expenses:create', json);
    callback(null, json);
  });

  /**
   * expenses:read
   *
   * called when we .fetch() our collection
   * in the client-side router
   */

  socket.on('expenses:read', function (data, callback) {
    Expense.find({}, function(err, expenses) {
      var list = [];

      _.each(expenses, function(expense) {
        // FIXME: set toJSON() on Model object
        list.push(toJSON(expense));
      });

      callback(null, list);
    });
  });

  /**
   * expenses:update
   *
   * called when we .save() our model
   * after toggling its completed status
   */

  socket.on('expenses:update', function (data, callback) {
    console.log('expenses:update: ' + util.inspect(data));

    Expense.findOne({ _id: data.id }, function (err, expense){
      console.log('Found expense: ' + expense.label);

      // Copy all of data's attrs over to doc
      _.extend(expense, data);
      expense.save();

      var json = expense.toObject();
      socket.emit('expenses/' + data.id + ':update', json);
      socket.broadcast.emit('expenses/' + data.id + ':update', json);

      callback(null, json);
    });
  });

  /**
   * expenses:delete
   *
   * called when we .destroy() our model
   */

  socket.on('expenses:delete', function (data, callback) {
    console.log('expenses:delete');

    Expense.findOne({ _id: data.id }, function (err, expense){

      var json = expense.toObject();
      expense.remove();

      socket.emit('expenses/' + data.id + ':delete', json);
      socket.broadcast.emit('expenses/' + data.id + ':delete', json);

      callback(null, json);
    });

  });

});

app.listen(3001);

//////
// Sample bootstrap
  function random_date() {
    // 1 Jan 2012
    var start = 1325397600000;
    var now = new Date().getTime();
    return new Date(start + Math.floor( Math.random()  * (now - start) ));
  }

  // var appModel = new models.AppModel();
  // appModel.expenses.add({
  //   id: 1,
  //   date     : random_date(),
  //   label    : 'food',
  //   amount   : 90000,
  //   category : 'food',
  //   who      : 'emil'
  // });
  // appModel.expenses.add({
  //   id: 2,
  //   date     : random_date(),
  //   label    :  'gearshifter',
  //   amount   :  19.50,
  //   category :  'bikes',
  //   who      :  'katie'
  // });


