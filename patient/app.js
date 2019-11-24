var app = angular.module('application', []);

// Angular Controller
app.controller('appController', function($scope, appFactory){

	$("#success_add_phr").hide();
	$("#error_add_phr").hide();

	$("#success_verify_phr").hide();
	$("#error_verify_phr").hide();

	$("#success_key").hide();
	$("#error_key").hide();

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

	factory.keyRequest = function(identity, attr, callback){
		console.log('Inside keyRequest factory function')
		console.log(identity);
		console.log(attr);
		params = identity + "-" + attr;
		
    	$http.get('http://localhost:5001/get_key/'+params).success(function(output){
			callback(output)
		});
	}

    factory.getDataToVerify = function(identity, callback){
		console.log('Inside getDataToVerify factory function')
		console.log(identity);

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


