var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var querystring = require('querystring');
var handlebars = require('handlebars');


var apiKey = 'NmQ4NmRiYWQtM2NkMS00MDcwLWJjZTYtODUyNjg0YTI3ODVk';
var apiSecret = 'YTE3NTNjM2ItNjBlZi00MzUwLWExNTktNDUwOGMzNWFmMTg0';

var port = 2000;
var baseUrl = 'http://localhost:' + port;
var redirectUri = baseUrl + '/authorize';

var app = express();

app.use(express.static(__dirname + '/'));
app.use(express.static(__dirname + '/../'));
app.use(bodyParser.json());

app.get('/', function(request, response) {
  var path = 'https://api.napster.com/oauth/authorize?' + querystring.stringify({
    response_type: 'code',
    client_id: apiKey,
    redirect_uri: redirectUri
  });
  console.log("********************************************");
  console.log(path);
  response.redirect(path);
});

app.get('/authorize', function(clientRequest, clientResponse) {
  console.log('hit authorize');
  console.log(clientRequest.query);
  request.post({
    url: 'https://api.napster.com/oauth/access_token',
    form: {
      client_id: apiKey,
      client_secret: apiSecret,
      response_type: 'code',
      code: clientRequest.query.code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    }
  }, function(error, response, body) {
    console.log('original body: ');
    console.log(body);
    body = JSON.parse(body);
    console.log('body: ');
    console.log(body);
    clientResponse.redirect(baseUrl + '/client.html?' + querystring.stringify({
      accessToken: body.access_token,
      refreshToken: body.refresh_token
    }));
  });
});

app.get('/reauthorize', function(clientRequest, clientResponse) {
  var refreshToken = request.query.refreshToken;

  if (!refreshToken) {
    clientResponse.json(400, { error: 'A refresh token is required.'});
    return;
  }

  request.post({
    url: 'https://api.napster.com/oauth/access_token',
    form: {
      client_id: apiKey,
      client_secret: apiSecret,
      response_type: 'code',
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }
  }, function(error, response, body) {
    console.log('Platform response:', {
      error: error,
      statusCode: response.statusCode,
      body: body
    });

    if (response.statusCode !== 200) {
      clientResponse.json(response.statusCode, { error: error || body });
      return;
    }

    clientResponse.json(200, JSON.parse(body));
  });
});

app.listen(port, function() {
  console.log('Listening on', port);
});
