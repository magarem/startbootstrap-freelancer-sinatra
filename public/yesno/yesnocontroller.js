var app = angular.module('myapp');

app.controller('YesNoController', ['$scope', 'close', function($scope, close) {

  $scope.close = function(result) {
 	  close(result, 3000); // close, but give 500ms for bootstrap to animate
  };



}]);