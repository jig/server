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

var port = process.env.VCAP_APP_PORT || process.env.PORT || 3000;

function setupExchange(exchangeName, queueName) {
	var exchange = conn.exchange(
							exchangeName, 
							{
								durable: true,
								'type': 'fanout'
							}, function() {
								console.log('Exchange "' + exchangeName + '" ready');
								var queue = conn.queue(
												queueName, 
												{
													durable: true
												},
												function() {
													console.log('Queue "' + queueName + '" ready');
													queue.bind(exchange.name, '');
													console.log('Queue "' + queueName + '" binded to "' + exchange.name + '"');
													console.log('Disonnected.');
													conn.end();
												});								
							});
	console.log('Connected to AMQP: ' + rabbitUrl());
}

var conn = amqp.createConnection({url: rabbitUrl()});
conn.on('ready', (function() { setupExchange('cf-demo', 'jig-queue'); }));
