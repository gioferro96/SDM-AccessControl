var app = angular.module('application', []);

app.run(['$rootScope', '$http', function($rootScope, $http) {
	var req = {
		method: 'GET',
		url: 'http://localhost:5003/get_patients/',
		headers: {'Access-Control-Allow-Origin': '*'}
	};
	console.log('Running request');
	
	$http(req).then(function(response){
		console.log(response);
		
		$rootScope.users_list = response.data;

	}).catch(err => console.log(err))
	
}]);

// Angular Controller
app.controller('appController', function($scope, appFactory){

	$("#success_key").hide();
	$("#error_key").hide(); 

	$("#success_get_phr").hide();
	$("#error_get_phr").hide();
	
	$scope.sendClientData = function(){

		console.log("Inside sendClientData of actors app.js")
		var req_upname = $scope.phr_upname;
		var req_id = $scope.phr_uname.split(',')[0];
		var req_uname = $scope.phr_uname.split(',')[1];
		var req_type = $scope.phr_type;
		var req_info = $scope.phr_info;

		console.log(req_upname, req_id, req_uname, req_type, req_info);

		appFactory.sendClientData(req_upname, req_id, req_uname, req_type, req_info, function(data){
			
			console.log("Fatto");
		});
	}

});

// Angular Factory
app.factory('appFactory', function($http){
	
	var factory = {};

	factory.sendClientData = function(upname, id, uname, type, info, callback){
		console.log('Inside getClientData factory function')
		params = upname + "-" + id + "-" + uname + "-" + type + "-" + info;
		$http.get('http://localhost:5003/send_client_data/'+params).success(function(output){
			callback(output)
		});
	}

	return factory;
});


