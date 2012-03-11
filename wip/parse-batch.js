var AccountParser = require('./parser.js');
// console.log(AccountParser);
// process.exit();

var text = '12-03-12	12-03-11 	YUKIKOS SUSHI AB 	 	-105,00	518,65\n \
12-03-12	12-03-11 	ICA SUPERMARKET 	 	-23,90	623,65\n \
12-03-09	12-03-09 	CAPRI 	 	-65,00	647,55\n \
12-03-09	12-03-09 	Mobilladdning 816694161340 	 	-200,00	712,55\n \
12-03-09	12-03-08 	Överföring Gym Anton 	 	500,00	912,55\n \
12-03-08	12-03-08 	ICA SUPERMARKET 	 	-63,90	412,55\n \
12-03-07	12-03-07 	SJ REGIONAL STOC 	 	-75,00	476,45\n \
12-03-07	12-03-07 	CLAS OHLSON 420 	 	-79,00	551,45\n \
12-03-07	12-03-07 	ICA SUPERMARKET 	 	-120,00	630,45\n \
12-03-06	12-03-06 	SJ REGIONAL UPPS 	 	-75,00	750,45\n \
12-03-06	12-03-06 	Överföring Empa 	 	70,00	825,45\n \
12-03-06	12-03-06 	Pressbyran 8106 	 	-200,00	755,45\n \
12-03-06	12-03-05 	Överföring Papppa 	 	250,00	955,45\n \
12-03-05	12-03-04 	ICA KVANTUM LILJ 	 	-360,39	705,45\n \
12-03-05	12-03-03 	Pressbyran 8106 	 	-200,00	1 065,84\n \
12-03-05	12-03-03 	ICA SUPERMARKET 	 	-145,04	1 265,84\n \
12-03-05	12-03-03 	SCIENCE PARK 	 	-495,00	1 410,88\n \
12-03-05	12-03-03 	SCIENCE PARK 	 	-495,00	1 905,88\n \
12-03-05	12-03-03 	SJ REGIONAL UPPS 	 	-150,00	2 400,88\n \
12-03-05	12-03-03 	STORE & COFFEE 	 	-50,00	2 550,88';


var parser = new AccountParser;
var expenses = parser.parse(text);
console.log(expenses);
