var app = angular.module('application', []);

app.run(['$rootScope', '$http', function($rootScope, $http) {
	var req = {
		method: 'GET',
		url: 'http://localhost:5001/get_all/'
	};
	console.log('Running request');
	
	$http(req).then(function(response){
		console.log(response);
		
		$rootScope.users_list = response.data;

	}).catch(err => console.log(err))
	
}]);

app.controller('appController', function($rootScope, $scope, appFactory){

	$("#success_add_phr").hide();
	$("#error_add_phr").hide();

	$("#success_verify_phr").hide();
	$("#error_verify_phr").hide();

	$("#success_key").hide();
	$("#error_key").hide();

	$scope.keyRequest = function(){

		console.log("Inside keyRequest of app.js function");
		var attr = $scope.key_attributes;
		var user = $scope.user;

		appFactory.keyRequest(attr, user, function(data){
			console.log(data.status)
			if (data.status == "KEY-OK"){
				$("#success_key").show();
				$("#error_key").hide();
				$rootScope.users_list.push({id: data.id, name: user.name});
			}else{
				$("#error_key").show();
				$("#success_key").hide();
			}
		});
	}
	
	$scope.getDataToVerify = function(){

		console.log("Inside getDataToVerify of app.js function");
		var req_identity = $scope.request_identity.split(',')[0];
		console.log(req_identity)

		appFactory.getDataToVerify(req_identity, function(data){
			console.log(data);
			console.log(data.length)
			$scope.phr_to_verify = data;
		});
	}

	$scope.addPHRData = function(){
		console.log("Inside scope.addPHRData function");
		var req_identity = $scope.request_identity.split(',')[0];
		var req_name = $scope.request_identity.split(',')[1];

		appFactory.addPHRData($scope.phr, req_identity, req_name, function(data){
			console.log(data)
			if (data == "WRITE-OK"){
				$("#success_add_phr").show();
				$("#error_add_phr").hide();
			}else{
				$("#error_add_phr").show();
				$("#success_add_phr").hide();
			}
		});

	}

})

app.factory('appFactory', function($http){
	
	var factory = {};

	factory.keyRequest = function(attr, user, callback){
		console.log('Inside keyRequest factory function')
		console.log(user.name);
		console.log(user.address);
		console.log(user.date);
		console.log(attr);
		params = user.name + "," + user.address + "," + user.date + "," + attr;
		
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

	factory.addPHRData = function(data, identity, name, callback){
		console.log('Inside recordEhr factory function');
		params = identity + "-" + name + "-" + data.type + "-" + data.data;
		console.log(params);

    	$http.get('http://localhost:5001/add_data/'+params).success(function(output){
			callback(output)
		});
	}

	return factory;
});




