// public/core.js
var newsAggregator = angular.module('newsAggregator', []);

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