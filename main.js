var Service = require('node-windows').Service;

var svc = new Service({
	name: "regular mysql clean",
	description: 'regular clean mysql script',
	script: 'C:\\msgcloud\\node\\regular\\regular.js'
});

svc.on('install', function() {
	svc.start();
});

svc.install();