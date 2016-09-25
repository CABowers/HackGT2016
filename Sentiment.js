var base_url = 'https://westus.api.cognitive.microsoft.com/';

var account_key = '050d1cb0af6e4071985c713676a416df';

var headers = {};
headers['Content-Type'] = 'application/json';
headers['Ocp-Apim-Subscription-Key'] = account_key;
headers['Accept'] = 'application/json';

var input_texts = '{"documents":[{"id":"1","text":"dick!","name": "John"},{"id":"2","text":"hello foo world","name": "John"},{"id":"three","text":"hello my world","name": "John"},]}';

num_detect_langs = 1;

/* Detect Sentiment*/
var batch_sentiment_url = base_url + 'text/analytics/v2.0/sentiment';
var method = "POST"

var async = true;
var request = new XMLHttpRequest();
request.onload = function () {
	var response = request.responseText;
}
request.open(method,batch_sentiment_url,async);
request.setRequestHeader("Content-Type","application/json");
request.setRequestHeader("Ocp-Apim-Subscription-Key",account_key);
request.setRequestHeader("Accept","application/json");

request.send();
