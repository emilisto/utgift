var Parser = require('../public/js/parser.js');
var util = require('util');

// var str = '12-03-23	12-03-23 	Övf via internet 838169242331529 	 	-1 500,00	806,65\n12-03-23	12-03-23 	Övf via internet 816619034771791 	 	-16 000,00	2 306,65\n12-03-23	12-03-23 	Övf via internet 816619146051801 	 	-4 000,00	18 306,65';
var str = '12-03-23	12-03-23 	Övf via internet 838169242331529 	 	-1 500,00	806,65';


var parser = new Parser();
var out = parser.parse(str);

console.log(util.inspect(out));
