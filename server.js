// server.js

    // set up ========================
    var express  = require('express');
    var app      = express();                               // create our app w/ express
    var mongoose = require('mongoose');                     // mongoose for mongodb
    var morgan = require('morgan');             // log requests to the console (express4)
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
    var moment = require('moment');
    var Twit = require('twit');
    var _ = require('underscore');

    // configuration =================

    mongoose.connect('mongodb://rohanagrawal:temppw@proximus.modulusmongo.net:27017/siziw2Ox');     // connect to mongoDB database on modulus.io
    // mongo console: mongo proximus.modulusmongo.net:27017/siziw2Ox -u <user> -p <pass>

    app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());

    // define model =================
    var Interest = mongoose.model('Interest', {
        text : String,
        priority: String,
    });

    var TweetLink = mongoose.model('TweetLink', {
        text : String
    });

    var currentDate = moment().format('dddd');

    var T = new Twit({
        consumer_key:         'nnnMzv63aJKbQgzF77vQLXCm0'
      , consumer_secret:      'BAG1XL3PHUVw6AsW7K0dRcIv6qkITkWARmZL9Bb8nOKfTkbTpo'
      , access_token:         '35398491-9KTshSy7QNiKh0Ia71AeZ6D1XMg6teKJWAwp6YNNE'
      , access_token_secret:  'ivIGOcV4OHxW9lRrW7pevEcxwtk2RDGzVSW6IdOqz9R0D'
    })



    // routes ======================================================================

    // api ---------------------------------------------------------------------
    // get all interests

    var userInterests;
    var tweetLinkList;

    T.get('search/tweets', { q: '49ers since:2014-11-11', count: 100 }, function(err, data, response) {
        // console.log(Object.keys(data));
        // console.log(data.statuses);
        // for (key in data.statuses) {
        //     console.log(key.text);
        // }
        // console.log(Object.keys(data.statuses));
        // // console.log(data.statuses[5]);
        // console.log(Array.isArray(data.statuses));
        // for (var i=(data.statuses.length-1); i >= 0; i--) {
        //     console.log('***** NEW TWEET * ' + moment(data.statuses[i].created_at).format('MMMM Do YYYY, h:mm a') +  ' * ' + data.statuses[i].retweet_count +  ' ***** ' + data.statuses[i].text);
        // }

        var mainArr = [];

        for (var i=(data.statuses.length-1); i >= 0; i--) {
            if (data.statuses[i].retweet_count > 50) {
                mainArr.push(data.statuses[i].text);
                // console.log(data.statuses[i].text);
            }
        }

        var relevantTweets = urlParser(mainArr);
        if (relevantTweets.length > 5) {
            relevantTweets.slice(0, 5);
        }
        console.log(relevantTweets);

        // console.log(typeof(data.statuses[5].created_at));
        // // var currentDate = Date.parse(data.statuses[5].created_at);
        // var currentDate = moment(data.statuses[5].created_at).format('MMMM Do YYYY, h:mm a');
        // console.log(currentDate);

    });

    app.get('/api/tweetlinks', function(req, res) {

        TweetLink.find(function(err, tweetlinks) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(tweetlinks);
        });
    });

    app.post('/api/tweetlinks', function(req, res) {
        
        for (var i=0; i < tweetLinkList.length; i++) {
            TweetLink.create({
                text : tweetLinkList[i]
            }, function(err, tweetlink) {
                if (err)
                    res.send(err);

                TweetLink.find(function(err, tweetlinks) {
                    if (err)
                        res.send(err);
                    res.json(tweetlinks);
                });
            })
        }
    });

    app.delete('/api/tweetlinks/:tweetlink_id', function(req, res) {
        TweetLink.remove({
            _id : req.params.tweetlink_id
        }, function(err, tweetlink) {
            if (err)
                res.send(err);

            // get and return all the interests after you create another
            TweetLink.find(function(err, tweetlinks) {
                if (err)
                    res.send(err)
                res.json(tweetlinks);
            });
        });
    });


    app.get('/api/interests', function(req, res) {

        // use mongoose to get all interests in the database
        Interest.find(function(err, interests) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            userInterests = interests;
            console.log(userInterests[0].text);

            tweetLinkList = [];
            for (var i=0; i < userInterests.length; i++) {
                T.get('search/tweets', { q: userInterests[i].text + ' since:2014-11-11', count: 100 }, function(err, data, response) {
                    var mainArr = [];
                    for (var i=(data.statuses.length-1); i >= 0; i--) {
                        if (data.statuses[i].retweet_count > 50) {
                            mainArr.push(data.statuses[i].text);
                        }
                    }
                    var relevantTweets = urlParser(mainArr);
                    if (relevantTweets.length > 3) {
                        relevantTweets = relevantTweets.slice(0, 3);
                    }
                    for (var n=0; n < relevantTweets.length; n++) {
                        tweetLinkList.push(relevantTweets[n]);
                    }
                    console.log(tweetLinkList);
                });
            };

            res.json(interests); // return all interests in JSON format
        });
    });


    // create interest and send back all interests after creation
    app.post('/api/interests', function(req, res) {



        // create an interest, information comes from AJAX request from Angular
        Interest.create({
            text : req.body.text,
            priority: req.body.priority,
        }, function(err, interest) {
            if (err)
                res.send(err);

            // get and return all the interests after you create another
            Interest.find(function(err, interests) {
                if (err)
                    res.send(err)

                tweetLinkList = [];
                for (var i=0; i < userInterests.length; i++) {
                    T.get('search/tweets', { q: userInterests[i].text + ' since:2014-11-11', count: 100 }, function(err, data, response) {
                        var mainArr = [];
                        for (var i=(data.statuses.length-1); i >= 0; i--) {
                            if (data.statuses[i].retweet_count > 50) {
                                mainArr.push(data.statuses[i].text);
                            }
                        }
                        var relevantTweets = urlParser(mainArr);
                        if (relevantTweets.length > 3) {
                            relevantTweets = relevantTweets.slice(0, 3);
                        }
                        for (var n=0; n < relevantTweets.length; n++) {
                            tweetLinkList.push(relevantTweets[n]);
                        }
                        console.log(tweetLinkList);
                    });
                };

                res.json(interests);
            });
        });

    });

    // delete an interest
    app.delete('/api/interests/:interest_id', function(req, res) {
        Interest.remove({
            _id : req.params.interest_id
        }, function(err, interest) {
            if (err)
                res.send(err);

            // get and return all the interests after you create another
            Interest.find(function(err, interests) {
                if (err)
                    res.send(err)

                tweetLinkList = [];
                for (var i=0; i < userInterests.length; i++) {
                    T.get('search/tweets', { q: userInterests[i].text + ' since:2014-11-11', count: 100 }, function(err, data, response) {
                        var mainArr = [];
                        for (var i=(data.statuses.length-1); i >= 0; i--) {
                            if (data.statuses[i].retweet_count > 50) {
                                mainArr.push(data.statuses[i].text);
                            }
                        }
                        var relevantTweets = urlParser(mainArr);
                        if (relevantTweets.length > 3) {
                            relevantTweets = relevantTweets.slice(0, 3);
                        }
                        for (var n=0; n < relevantTweets.length; n++) {
                            tweetLinkList.push(relevantTweets[n]);
                        }
                        console.log(tweetLinkList);
                    });
                };
                
                res.json(interests);
            });
        });
    });

    // application -------------------------------------------------------------
    app.get('*', function(req, res) {
        res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });

    // listen (start app with node server.js) ======================================
    app.listen(8080);
    console.log("App listening on port 8080");

    //====================
    //function pulls urls from tweet strings

    var sampleArr = [
        'RT @JustBlogBaby: Scouts Prefer Derek Carr Over Colin Kaepernick http://t.co/ADyDK9n0ey',
        '@NinersNation: Colin Kaepernick has little to say before 49ers face Raiders. Thoughts on his succinctness? http://t.co/k1CkFqlJxr stuff stuff',
        'RT Love these ads for @beatsbydre by @RGA. http://t.co/5YnMKvULU9',
        'RT @957thegame: Which QB would you rather have for the next 5 years?'
    ];

    function urlParser(arr){
      var a, array = [];

//loops through arr, which is an array of strings
//checks for strings that are both retweets AND 
//possess urls. If so, slices starting at index of 'http'
//pushes to (variable) array
      for (var i=0;i<arr.length;i++){
        if (arr[i].slice(0,3) === 'RT '){
            if(arr[i].indexOf('http') > -1){
              a = arr[i].slice(arr[i].indexOf('http'));
              array.push(a);
            }
        }
      }

//loops through array, checks if there are additional characters after urls in 
//array. If so, slices off at the first space. 
      for(var j=0;j<array.length;j++){
          if(array[j].indexOf(' ') > -1){
            array[j] = array[j].slice(0, array[j].indexOf(' '));
          }
          // if(array[j].indexOf('...') > -1){
          //   array.splice(j, 1);
          // }
      }

      return _.uniq(array);
      // console.log(array);

}
//another commentsssss
