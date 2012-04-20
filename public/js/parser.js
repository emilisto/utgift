(function(global) {
  var _ = global._;

  if (!_ && typeof require !== 'undefined') {
    _ = require('underscore');
  }

  var parseDate = function parseDate(str) {
    var parts = str.split('-');
    return new Date('20' + parts[0], parts[1]-1, parts[2], 0, 0, 0);
  };

  var parseLine = function parseLine(line) {
    var re = /^\s*(\d\d-\d\d-\d\d)\s+(\d\d-\d\d-\d\d)\s+([^\t]+\S)\s+([-]?[\d\s]+,\d{2})/g;
    var matches = re.exec(line);

    var ret = null
    if(matches) {
      var amount = matches[4]
        .replace(',', '.')
        .replace(' ', '');

      ret = {
        'date': this.parseDate(matches[2]),
        'label': matches[3],
        'amount': -parseFloat(amount, 10)
      };
    }

    return ret;
  };

  var parse = function parse(str) {
    var self = this;
    var lines = str.split('\n');

    var expenses = [];
    _.each(lines, function(line) {
      var ret = self.parseLine(line);
      if(ret) {
        ret.batch_line = line;
        expenses.push(ret);
      }
    });

    return expenses;
  };

  var AccountParser = global.AccountParser = function AccountParser() {
    this.parseDate = parseDate;
    this.parseLine = parseLine;
    this.parse = parse;
  };

  if(typeof module !== 'undefined') module.exports = AccountParser;

}(this));
