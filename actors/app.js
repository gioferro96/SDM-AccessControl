var app = angular.module('application', []); 

app.run(['$rootScope', '$http', function($rootScope, $http) {
	var req = {
		method: 'GET',
		url: 'http://localhost:5002/get_patients/'
		//headers: {'Access-Control-Allow-Origin': '*'}
	};
	var reqAct = {
		method: 'GET',
		url: 'http://localhost:5002/get_actors/'
		//headers: {'Access-Control-Allow-Origin': '*'}
	};
	console.log('Running request');

	$http(req).then(function(response){
		console.log(response);
		
		$rootScope.users_list = response.data;

	}).catch(err => console.log(err))

	$http(reqAct).then(function(response){
		console.log(response);
		
		$rootScope.actors_list = response.data;

	}).catch(err => console.log(err))
	
}]); 
 
// Angular Controller
app.controller('appController', function($rootScope, $scope, appFactory){

	$("#success_key").hide();
	$("#error_key").hide();

	$("#success_get_phr").hide();
	$("#error_get_phr").hide();

	$scope.keyRequest = function(){

		console.log("Inside keyRequest of app.js function");
		var attr = $scope.key_attributes;
		var user = $scope.user;

		appFactory.keyRequest(user, attr, function(data){
			console.log(data.status);
			console.log(data.data.status);
			if (data.status == 200 && data.data.status == "KEY-OK"){
				$("#success_key").show(); 
				$("#error_key").hide();
				$rootScope.actors_list.push({id: data.id, name: user.name});
			}else{
				console.log(data);
				$("#error_key").show();
				$("#success_key").hide();
			}
		});
	}
	
	$scope.getClientData = function(){ 

		console.log("Inside getClientData of actors app.js");
		
		var req_target = $scope.request_target.split(",")[1] + "," + $scope.actor_target.split(",")[1];
		console.log("Requesting data for patient with name " + req_target);

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

	factory.keyRequest = function(user, attr, callback){
		
		console.log('Inside keyRequest factory function')
		console.log(user.role);
		console.log(attr);

		params = {name: user.name, address: user.address, dob: user.date, role: user.role, attributes: attr};
		console.log(params);
		
		$http({
			method: 'POST',
			url: 'http://localhost:5002/get_key/',
			params: params
		}).then(function(output){
			callback(output)
		})
		
		
		/*console.log('Inside keyRequest factory function')
		console.log(user.role);
		
		params = user.name + "," + user.address + "," + user.date + "," + user.role + "," + attr;
		
    	$http.get('http://localhost:5002/get_key/'+params).success(function(output){
			callback(output)
		});*/

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


