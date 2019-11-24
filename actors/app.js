var app = angular.module('application', []);

// Angular Controller
app.controller('appController', function($scope, appFactory){

	$("#success_key").hide();
	$("#error_key").hide();

	$("#success_get_phr").hide();
	$("#error_get_phr").hide();

	$scope.keyRequest = function(){

		console.log("Inside keyRequest of app.js function");
		var key_req = $scope.key_identity;
		var attr = $scope.key_attributes;

		appFactory.keyRequest(key_req, attr, function(data){
			console.log(data)
			if (data == "KEY-OK"){
				$("#success_key").show();
				$("#error_key").hide();
			}else{
				$("#error_key").show();
				$("#success_key").hide();
			}
		});
	}
	
	// Returns only info as only info is returned in DB.js
	$scope.getClientData = function(){

		console.log("Inside getClientData of actors app.js")
		var req_target = $scope.request_target;

		appFactory.getClientData(req_target, function(data){
			console.log(data);
			console.log(data.length)
			$scope.phr_to_get = data;
		});
	}

});

// Angular Factory
app.factory('appFactory', function($http){
	
	var factory = {};

	factory.keyRequest = function(identity, attr, callback){
		console.log('Inside keyRequest factory function')
		console.log(identity);
		console.log(attr);
		params = identity + "-" + attr;
		
    	$http.get('http://localhost:5002/get_key/'+params).success(function(output){
			callback(output)
		});
	}

	factory.getClientData = function(identity, callback){
		console.log('Inside getClientData factory function')
		console.log(identity);

		$http.get('http://localhost:5002/get_client_data/'+identity).success(function(output){
			callback(output)
		});
	}

	return factory;
});


