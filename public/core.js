// public/core.js
var newsAggregator = angular.module('newsAggregator', []);
// var Twit = require('twit');

//     var T = new Twit({
//         consumer_key:         'nnnMzv63aJKbQgzF77vQLXCm0'
//       , consumer_secret:      'BAG1XL3PHUVw6AsW7K0dRcIv6qkITkWARmZL9Bb8nOKfTkbTpo'
//       , access_token:         '35398491-9KTshSy7QNiKh0Ia71AeZ6D1XMg6teKJWAwp6YNNE'
//       , access_token_secret:  'ivIGOcV4OHxW9lRrW7pevEcxwtk2RDGzVSW6IdOqz9R0D'
//     })

function mainController($scope, $http) {
    $scope.formData = {};

    // when landing on the page, get all interests and show them
    $http.get('/api/interests')
        .success(function(data) {
            $scope.interests = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });

    // T.get('search/tweets', { q: 'banana since:2014-11-11', count: 100 }, function(err, data, response) {
    //   console.log(data);

      
    // });
    $http.get('/api/tweetlinks')
        .success(function(data) {
            $scope.tweetlinks = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });

    // when submitting the add form, send the text to the node API
    $scope.createInterest = function() {
        $http.post('/api/interests', $scope.formData)
            .success(function(data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
                $scope.interests = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

    // delete an interest after checking it
    $scope.deleteInterest = function(id) {
        $http.delete('/api/interests/' + id)
            .success(function(data) {
                $scope.interests = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

}