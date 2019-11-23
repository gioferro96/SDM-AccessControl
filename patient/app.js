var app = angular.module('application', []);

// Angular Controller
app.controller('appController', function($scope, appFactory){

	$("#success_add_phr").hide();
	$("#error_add_phr").hide();

	$("#success_verify_phr").hide();
	$("#error_verify_phr").hide();

	$scope.getDataToVerify = function(){

		console.log("Inside getDataToVerify of app.js function");
		var req_identity = $scope.request_identity;

		appFactory.getDataToVerify(req_identity, function(data){
			console.log(data);
			console.log(data.length)
			$scope.phr_to_verify = data;
		});
	}

	$scope.addPHRData = function(){
		console.log("Inside scope.addPHRData function");
		var req_identity = $scope.request_identity;

		appFactory.addPHRData($scope.toCreate, purpose, req_identity, function(data){
			
			
		});

	}

});

// Angular Factory
app.factory('appFactory', function($http){
	
	var factory = {};

    factory.getDataToVerify = function(identity, callback){
		console.log('Inside getDataToVerify factory function')
		console.log(identity);
		/*$http({
			method: 'GET',
			url: '/someUrl'
		  }).then(function successCallback(response) {
			  // this callback will be called asynchronously
			  // when the response is available
			}, function errorCallback(response) {
			  // called asynchronously if an error occurs
			  // or server returns response with an error status.
			});*/

    	$http.get('http://localhost:5001/get_data_to_verify/'+identity).success(function(output){
			callback(output)
		});
	}

	factory.addPHRData = function(data, purpose, identity, callback){
		console.log('Inside recordEhr factory function');
		console.log(identity);

    	$http.get('http://localhost:5001/'+identity).success(function(output){
			callback(output)
		});
	}

	return factory;
});


