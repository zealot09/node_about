var mysql = require('mysql');
var moment = require('moment');
var winston = require("winston");
var path = require ('path');
var async = require('async');
var MAX_ROWS = 10000;
var DAYS_AGO_HANDER = 5;
var TIME_FORMAT = 'YYYY-MM-DD hh:mm:ss';

var transports = [];
transports.push(new winston.transports.DailyRotateFile({
  name: 'file',
  datePattern: '.yyyy-MM-ddTHH',
  filename: path.join(__dirname, "logs", "log_file.log")
}));

var logger = new winston.Logger({transports: transports});
var pool = mysql.createPool({
	host: 'localhost',
	user: 'root',
	password: '',
	database : 'beego_dev'
});
setInterval(function() {
	pool.getConnection(function(err, connection) {
		if(err) throw err;

		connection.query('SELECT count(*) AS count from beego_dev.goals', function(err, rows) {
			if(err) {
				connection.end();
				logger.error(err);
				return;
			}
			logger.info("current goals count: " + rows[0].count);

			var amount = parseInt(rows[0].count);
		//if the table records are more than 10000, then delete some records
			if(amount >= MAX_ROWS) {
				var lastDelete = moment().subtract(DAYS_AGO_HANDER, 'days').format(TIME_FORMAT);
				logger.info("hander to delete msgs time: " + lastDelete);
				connection.query('DELETE FROM beego_dev.goals where created_at > \"+ lastDelete +\"', function(err, result) {
					if(err) throw err;
					logger.info('deleted dates to ' + lastDelete);
					//end the connection
					connection.end();
				});
			
			}	
		});

	});	
}, 5000);
