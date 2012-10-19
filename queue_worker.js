// https://github.com/rabbitmq/rabbitmq-service-nodejs-sample

var http = require('http');
var amqp = require('amqp');
var URL = require('url');
var htmlEscape = require('sanitizer/sanitizer').escape;

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

var messages = [];

function setup() {
	var exchange = conn.exchange('cf-demo', 
									{
										'type': 'fanout', 
										durable: false
									}, 
									function() {
										var queue = conn.queue(
													'', 
													{
														durable: false, 
														exclusive: true
													},
													function() {
														queue.subscribe(function(msg) {
																				console.log(msg.body);
																				// console.log(msg.body.length);
																				// process.stdout.write(msg.body.length === 3370?'.':'!');
																			});
														queue.bind(exchange.name, '');
													});
										queue.on('queueBindOk', 
											function() { 
												console.log('queueBindOk'); 
											});
									}
							);
}

console.log("Starting ... AMQP URL: " + rabbitUrl());
var conn = amqp.createConnection({url: rabbitUrl()});
conn.on('ready', setup);
