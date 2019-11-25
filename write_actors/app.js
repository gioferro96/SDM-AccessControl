var app = angular.module('application', []);

// Angular Controller
app.controller('appController', function($scope, appFactory){

	$("#success_key").hide();
	$("#error_key").hide();

	$("#success_get_phr").hide();
	$("#error_get_phr").hide();
	
	$scope.sendClientData = function(){

		console.log("Inside sendClientData of actors app.js")
		var req_upname = $scope.phr_upname;
		var req_uname = $scope.phr_uname;
		var req_type = $scope.phr_type;
		var req_info = $scope.phr_info;

		appFactory.sendClientData(req_upname, req_uname, req_type, req_info, function(data){
			
			console.log("Fatto");
			//console.log(data.length)
			//$scope.phr_to_get = data;
		});
	}

});

// Angular Factory
app.factory('appFactory', function($http){
	
	var factory = {};

	factory.sendClientData = function(upname, uname, type, info, callback){
		console.log('Inside getClientData factory function')
		params = upname + "-" + uname + "-" + type + "-" + info;
		$http.get('http://localhost:5003/send_client_data/'+params).success(function(output){
			callback(output)
		});
	}

	return factory;
});


