// Based on code by: https://github.com/rabbitmq/rabbitmq-service-nodejs-sample

var http = require('http');
var amqp = require('amqp');
var URL = require('url');

function rabbitUrl() {
	if (process.env.VCAP_SERVICES) {
		conf = JSON.parse(process.env.VCAP_SERVICES);
		return conf['rabbitmq-2.4'][0].credentials.url;
	}
	else if (process.env.RABBITMQ_URL) {
		return process.env.RABBITMQ_URL;
	}
	else {
		return "amqp://localhost";
	}
}

function setupWorker(queueName) {
				var queue = conn.queue(
							queueName, 
							{ passive: true },
							function() {
								queue.subscribe(function(msg) {
														// console.log('2> ' + msg.body);
													});
								console.log('Subscribed to Queue "' + queueName + '"');
							});
}

var conn = amqp.createConnection({url: rabbitUrl()});

conn.on('ready', (function() { setupWorker('jig-queue'); }));