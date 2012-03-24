//
// TODO
//
//    * In add batch, "who" field for all added expenses
//    * When using add batch, the line pasted should be saved with the expense,
//      to avoid adding duplicates later.
//    * Sum all posts when choosing a category
//    * Aggregate view
//    * Select multiple rows and change them
//    * Clicking outside of row should cancel edit
//    * Pagination
//    * Search
//    * Make sure page doesn't scroll away when deleting something
//
//    * Don't include all deps in the repo, use npm package.json instead
//
//

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
