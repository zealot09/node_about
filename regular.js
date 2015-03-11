var mysql = require('mysql');
var moment = require('moment');
var MAX_ROWS = 100000;
var TIME_FORMAT = 'YYYY-MM-DD hh:mm:ss';
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'password01!'
});

setInterval(function() {
	connection.connect();
	connection.query('SELECT count(*) AS count from msgcloud.scheduled_mt_task', function(err, rows) {
		if(err) throw err;
		console.log(rows[0].count);
		
		var amount = parseInt(rows[0].count);
		var lastDelete = moment().subtract(5, 'days').format(TIME_FORMAT);
		
		console.log(lastDelete);
		//if the table records are more than 10000, then delete some records
		if(amount > MAX_ROWS) {
			
			connection.query('DELETE FROM msgcloud.scheduled_mt_task where create_time > \"+ lastDelete +\"', function(err, result) {
				if(err) throw err;
				
				console.log('deleted dates to ' + lastDelete);
			});
		}
	});
	connection.end();
}, 5000);