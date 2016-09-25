var HTTPS = require('https');
var cool = require('cool-ascii-faces');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
//create a plotly object
var plotly = require('plotly')('aogarro3', 'sizkqcez0k');
//lets require/import the mongodb native drivers.
//var mongodb = require('mongodb');
var botID = process.env.BOT_ID;


//Sentiment
function sentiment(json) {
    var base_url = 'https://westus.api.cognitive.microsoft.com/';

    var account_key = '050d1cb0af6e4071985c713676a416df';

    var headers = {};
    headers['Content-Type'] = 'application/json';
    headers['Ocp-Apim-Subscription-Key'] = account_key;
    headers['Accept'] = 'application/json';
    var input_texts = '{"documents":[{"id":"'+json.id+'","text":"'+ json.text +'","name":"'+ json.name +'"}]}';

    num_detect_langs = 1;

    /* Detect Sentiment*/
    var batch_sentiment_url = base_url + 'text/analytics/v2.0/sentiment';
    var method = "POST"

    var async = false;
    var request = new XMLHttpRequest();

    request.open(method,batch_sentiment_url,async);
    request.setRequestHeader("Content-Type","application/json");
    request.setRequestHeader("Ocp-Apim-Subscription-Key",account_key);
    request.setRequestHeader("Accept","application/json");

    request.onreadystatechange = processRequest;
    var s;
    function processRequest(e) {
    	if (request.readyState == 4 && request.status == 200) {
    		//s = JSON.parse(request.responseText);
            s = request.responseText;

    	}
    }

    request.send(input_texts);
    return s;
}


//TODO for database stuff

/*
//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/test';

// Use connect method to connect to the Server


function userData(MongoClient, url, messageSentiment) {

    MongoClient.connect(url, function (err, db) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      } else {
        //HURRAY!! We are connected. :)
        console.log('Connection established to', url);

        // Get the documents collection
        var collection = db.collection('message');
        var nameVal = messageSentiment.name;

        if (db.collection.find({'name': nameVal}).count() > 0) {

            var newSentimentVal = messageSentiment.sentiment[0];
            var newTimeVal = messageSentiment.time[0];

            // Modify some users
            collection.findAndModify({
                query: { name: nameVal },
                update : {$push {time : newTimeVal },
                {sentiment : newSentimentVal}}},
                function (err, numUpdated) {
              if (err) {
                console.log(err);
              } else if (numUpdated) {
                console.log('Updated Successfully %d document(s).', numUpdated);
              } else {
                console.log('No document found with defined "find" criteria!');
              }
              //Close connection
              db.close();
            });
        } else {

            // Insert some users
            collection.insert(messageSentiment, function (err, result) {
              if (err) {
                console.log(err);
              } else {
                console.log('Inserted %d documents into the "message" collection. The documents inserted with "_id" are:', result.length, result);
              }
              //Close connection
              db.close();
            });
        }
    });
    }
}
*/
var database = [];

function sendJSON(json) {
    var s = JSON.parse(sentiment(json));
    //botPrint(s.documents[0].score);

    data = {
        name: json.name,
        time: json.created_at,
        sentiment: s.documents[0].score
    };
    if (json.name != "Anti-Harassment Bot") {
        database.push(data);
    }

    return s.documents[0].score;

    //botPrint(String(database.length));


    /*
    data = {
      name: json.name,
      time: [json.created_at],
      sentiment: [s.documents[0].score]
    };

    var updated = false;
    for (var i = 0; i < database.length; i++) {
        if (database[i].name === json.name) {
            //botPrint("HI");
            database[i].time = database[i].time.push(json.created_at);
            database[i].sentiment = database[i].sentiment.push(s.documents[0].score);
            updated = true;
        }
    }
    if (!updated) {
        database.push(data);
    }
    */
}

function respond() {
  var request = JSON.parse(this.req.chunks[0])//,
      //botRegex = /Bully$/i; // /^\/cool guy$/;
  var sentiment = sendJSON(request);
       //botRegex is regiex expression that .test compares it to request.text and returns true if matches
      //can implement this however we want
      //If gets too big break regex into seperate function with sentimate analysis
  if(request.text && profanityFilter(request)) {
    this.res.writeHead(200);
    postHarassmentMessage(request);
    this.res.end();
  } else if(aboutFilter(request)) {
    this.res.writeHead(200);
    postAboutMessage(request);
    this.res.end();
  } else {
    console.log("don't care");
    this.res.writeHead(200);
    this.res.end();
  }
}
function aboutFilter(request) {

    var about = /@bot\sabout/i;
    var cmd = /@bot\scmd/i;
    var help = /@bot\shelp/i;
    var bp = /(@bot\sprint)/i;
    var clear = /(@bot\sclear)/i;
    var stats = /@bot\sstats/i;

    return about.test(request.text) || cmd.test(request.text)
        || help.test(request.text) || bp.test(request.text)
        || clear.test(request.text) || stats.test(request.text);
}
function profanityFilter(request) {
    var curse = /((\b|dumb)(a|@)ss+(\b|h[A-z]*)|sh(i|!)t|cunt|whore|fag|slut|queer|bitch|bastard|fuck)/i;
    var f = /((f+u+c+k+)|(f+u+k+)|(f+v+c+k+)|(f+u+q+)|(f+r+i+c+k+))/i;
    var nword = /(n[^a]gg+(a|er|uh)|\bn\s*i\s*g\s*(g\s*)?(a|a\s*h|e\s*r)?\b)/i;
    var vulgarities = /(\bd\s*i\s*c?\s*ks*\b|\bp\s*e\s*n(\s|\.)*i\s*s\b|pussy|pussies)/i;
    var vulgarities2 = /(\bb\s*o\s*o\s*b\s*s\b|\bb\s*r\s*e\s*a\s*s\s*t(\s*s)?\b|\bt\s*i\s*t(\s*s|\s*t\s*y|\s*t\s*i\s*e\s*s)?\b)/i;
    var vulgarities3 = /(booty|vagina|boo+b|ti+d+die|butt)/i;
    var harassment = /(\bl\s*e(\s*s|\s*z)\s*b?(\s*o|\s*i\s*a\s*n)?\b|\bd\s*y\s*k\s*e\b)/i;
    var harassmentOther = /(retard|douche|dick|idiot)/i;
    return curse.test(request.text) || f.test(request.text)
        || nword.test(request.text) || vulgarities.test(request.text)
        || vulgarities2.test(request.text) || vulgarities3.test(request.text)
        || harassment.test(request.text) || harassmentOther.test(request.text);
}

function postHarassmentMessage(request) {
  var botResponse, options, body, botReq;

  var responses = ["watch your language. Some may find what you said offensive.",
            "please don't say that.", "what you said could be considered offensive.",
            "could you refrain from saying that?", "there is no need for that."];
  var index = (Math.random()*responses.length) | 0;
  var response = responses[index];
  botResponse = "@" + request.name + ", " + response;

  //if (request.name === "Alvin O'Garro") {
    //  kick(request.user_id, request.group_id);
  //}

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id" : botID,
    "text" : botResponse
  };

  botReq = HTTPS.request(options, function(res) {
      if(res.statusCode == 202) {
        //neat
      } else {
        console.log('rejecting bad status code ' + res.statusCode);
      }
  });

  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}

function postAboutMessage(request) {
  var botResponse, options, body, botReq;

  var about = /@bot\sabout/i;
  var cmd = /@bot\scmd/i;
  //@usr -> gets user stats
  var help = /@bot\shelp/i;
  var bp = /(@bot\sprint)/i;
  var clear = /(@bot\sclear)/i;
  var stats = /@bot\sstats/i;

  if(about.test(request.text)) {
      botResponse = "I am designed to help promote a supportive chat enviorment. I monitor offensive language and harassment in this group.";
  } else if(cmd.test(request.text)) {
      botResponse = "@bot followed by...\nabout -> description\ncmd -> commands\nhelp -> description + commands\nstats -> gets group sentiment stats (Note: Takes time)";
  } else if(help.test(request.text)) {
      botResponse = "I am designed to help promote a supportive chat enviorment. I monitor offensive language and harassment in this group.\nCommands:\n@bot followed by...\nabout -> description\ncmd -> commands\nhelp -> description + commands\nstats -> gets group sentiment stats";
  }  else if (bp.test(request.text)) {
      botResponse = database.length.toString();
  } else if (clear.test(request.text)) {
      botResponse = "Cleared";
      database = [];

  } else if(stats.test(request.text)) {
      graphJSON(database);
  } else {
      botResponse = "Sorry there was an error";
  }


  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id" : botID,
    "text" : botResponse
  };

  botReq = HTTPS.request(options, function(res) {
      if(res.statusCode == 202) {
        //neat
      } else {
        console.log('rejecting bad status code ' + res.statusCode);
      }
  });
  botReq.end(JSON.stringify(body));
}
/*
function kick(user_id, group_id) {
    var options, body, botReq, membership_id;

    membership_id = getMembershipId(user_id, group_id);


    options = {
      hostname: 'api.groupme.com',
      path: 'v3/groups/:'+ group_id + '/members/'+ membership_id + '/remove',
      method: 'POST'
    };

    botReq = HTTPS.request(options, function(res) {
        if(res.statusCode == 202) {
          //neat
        } else {
          console.log('rejecting bad status code ' + res.statusCode);
        }
    });

    botReq.end(JSON.stringify(body));
  }
}

function getMembershipId(user_id, group_id) {
    //get membership id from GET /groups/:group_id/members/results/:results_id
    //.members.id
    //.members.user_id
    //

    var options, body, botReq;

    var result_id = addAMember(user_id, group_id)
    //need to parse that form return
    //then get member id from it some bs
    options = {
      hostname: 'api.groupme.com',
      path: 'v3/groups/:'+ group_id,
      method: 'GET'
    };

    botReq = HTTPS.request(options, function(res) {
        if(res.statusCode == 202) {
          //neat
        } else {
          console.log('rejecting bad status code ' + res.statusCode);
        }
    });


    botReq.end(JSON.stringify(body));
  }
}

function addAMember(user_id, group_id, nickname) {
    var options, body, botReq;

    options = {
      hostname: 'api.groupme.com',
      path: 'v3/groups/'+ group_id +'/members/add',
      method: 'POST'
    };

    body = {
      "members": [
        {
          "nickname": nickname,
          "user_id": user_id,
          "guid": "GUID-1"
        }]
    };

    botReq = HTTPS.request(options, function(res) {
        if(res.statusCode == 202) {
          //neat
        } else {
          console.log('rejecting bad status code ' + res.statusCode);
        }
    });

    botReq.end(JSON.stringify(body));
    return botReq;
}
*/

function botPrint(message) {
  var botResponse, options, body, botReq;

  botResponse = message;

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id" : botID,
    "text" : botResponse
  };

  botReq = HTTPS.request(options, function(res) {
      if(res.statusCode == 202) {
        //neat
      } else {
        console.log('rejecting bad status code ' + res.statusCode);
      }
  });
  botReq.end(JSON.stringify(body));
}





var graphJSON = function(jsonArray) {
    botResponse = "This might take a while...";

    options = {
      hostname: 'api.groupme.com',
      path: '/v3/bots/post',
      method: 'POST'
    };

    body = {
      "bot_id" : botID,
      "text" : botResponse
    };

    botReq = HTTPS.request(options, function(res) {
        if(res.statusCode == 202) {
          //neat
        } else {
          console.log('rejecting bad status code ' + res.statusCode);
        }
    });
    botReq.end(JSON.stringify(body));

    //parse the json
    var time = [];
    var sentiment = [];
    var sum = 0;

    for (i = 0; i < jsonArray.length; i++) {
        time.push(jsonArray[i].time);
        sentiment.push(jsonArray[i].sentiment);
        sum += jsonArray[i].sentiment;
    }
    var average = sum/sentiment.length;

    //create graph data
    var data = [{x: time, y: sentiment, type: 'line'}];
    var layout = {fileopt : "overwrite", filename : "nn"};

    //generate online plot
    var link;
    plotly.plot(data, layout, function (err, msg) {
        //if (err) return console.log(err);
        //return callback(msg.url);

        var botResponse, options, body, botReq;

        botResponse = msg.url;

        options = {
          hostname: 'api.groupme.com',
          path: '/v3/bots/post',
          method: 'POST'
        };

        body = {
          "bot_id" : botID,
          "text" : botResponse
        };

        botReq = HTTPS.request(options, function(res) {
            if(res.statusCode == 202) {
              //neat
            } else {
              console.log('rejecting bad status code ' + res.statusCode);
            }
        });
        botReq.end(JSON.stringify(body));

    });

    //return link;
}





exports.respond = respond;
