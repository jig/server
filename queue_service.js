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

function setupExchange(exchangeName) {
	var exchange = conn.exchange(
							exchangeName, 
							{ passive: true	}, 
							function() { 
								console.log("Connected to Exchange: " + exchangeName);
								httpServer(exchange); 
							}
						);
}

function httpServer(exchange) {
	var serv = http.createServer(function(req, res) {
			var url = URL.parse(req.url);
			if (req.method == 'POST' && url.pathname == '/') {
				chunks = '';
				req.on('data', function(chunk) { 
									chunks += chunk; 
								});
				req.on('end', function() {
									exchange.publish('', {body: chunks});
									res.end();
								});
			} else {
				res.statusCode = 404;
				res.end("This is not the page you were looking for.");
			}
		});

	serv.listen(port, function() {
							console.log("Listening on port " + port);
						});
}

var conn = amqp.createConnection({url: rabbitUrl()});
conn.on('ready', (function() { setupExchange('cf-demo'); }));
