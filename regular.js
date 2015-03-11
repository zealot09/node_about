var mysql = require('mysql');
var moment = require('moment');
var winston = require("winston");
var path = require ('path');
var MAX_ROWS = 100000;
var DAYS_AGO_HANDER = 5;
var TIME_FORMAT = 'YYYY-MM-DD hh:mm:ss';

var transports = [];
transports.push(new winston.transports.DailyRotateFile({
  name: 'file',
  datePattern: '.yyyy-MM-ddTHH',
  filename: path.join(__dirname, "logs", "log_file.log")
}));

var logger = new winston.Logger({transports: transports});

setInterval(function() {
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: 'password01!'
	});	
	connection.connect();
	connection.query('SELECT count(*) AS count from msgcloud.scheduled_mt_task', function(err, rows) {
		if(err) throw err;
		logger.info("current scheduled_mt_task count: " + rows[0].count);
		
		var amount = parseInt(rows[0].count);

		//if the table records are more than 10000, then delete some records
		if(amount > MAX_ROWS) {
			var lastDelete = moment().subtract(DAYS_AGO_HANDER, 'days').format(TIME_FORMAT);
			logger.info("hander to delete msgs time: " + lastDelete);
			connection.query('DELETE FROM msgcloud.scheduled_mt_task where create_time > \"+ lastDelete +\"', function(err, result) {
				if(err) throw err;
				logger.info('deleted dates to ' + lastDelete);
			});
		}
	});
	connection.end();
}, 5000);