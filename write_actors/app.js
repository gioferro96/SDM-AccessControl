var app = angular.module('application', []);
  
app.run(['$rootScope', '$http', function($rootScope, $http) {
	var req = {
		method: 'GET',
		url: 'http://localhost:5003/get_patients/'
	};
	var reqWact = {
		method: 'GET',
		url: 'http://localhost:5003/get_wactors/'
	};
	console.log('Running request');
	
	$http(req).then(function(response){
		console.log(response);
		
		$rootScope.users_list = response.data;

	}).catch(err => console.log(err))

	$http(reqWact).then(function(response){
		console.log(response);
		
		$rootScope.wactors_list = response.data;

	}).catch(err => console.log(err))
	
}]);
 
// Angular Controller
app.controller('appController', function($rootScope, $scope, appFactory){

	$("#success_add").hide();
	$("#error_add").hide(); 

	$("#success_key").hide();
	$("#error_key").hide(); 
	
	$scope.addWactor = function(){

		console.log("Inside keyRequest of app.js function");
		var user = $scope.user;

		appFactory.addWactor(user, function(data){
			console.log(data.status);
			console.log(data);
			if (data.status == 200 && data.data == "WRITE-OK"){
				$("#success_add").show(); 
				$("#error_add").hide();
				$rootScope.wactors_list.push({id: data.id, name: user.name});
			}else{
				console.log(data);
				$("#error_add").show();
				$("#success_add").hide();
			}
		});
	}

	$scope.sendClientData = function(){

		console.log("Inside sendClientData of actors app.js")
		var req_upname = $scope.phr_upname;
		var req_id = $scope.phr_uname.split(',')[0];
		var req_uname = $scope.phr_uname.split(',')[1];
		var req_type = $scope.phr_type;
		var req_info = $scope.phr_info;

		console.log(req_upname, req_id, req_uname, req_type, req_info);

		appFactory.sendClientData(req_upname, req_id, req_uname, req_type, req_info, function(data){
			console.log("Fatto")
			if (data == "WRITE-OK"){
				$("#success_key").show();
				$("#error_key").hide();
			}else{
				$("#error_key").show();
				$("#success_key").hide();
			}
		});
	}

});

// Angular Factory
app.factory('appFactory', function($http){
	
	var factory = {};

	factory.addWactor = function(user, callback){
		
		console.log('Inside addWactor factory function')
		console.log(user.role);

		params = {name: user.name, address: user.address, role: user.role};
		console.log(params);
		
		$http({
			method: 'POST',
			url: 'http://localhost:5003/add_wactor/',
			params: params
		}).then(function(output){
			callback(output)
		})

	}

	factory.sendClientData = function(upname, id, uname, type, info, callback){
		console.log('Inside getClientData factory function')
		params = upname + "-" + id + "-" + uname + "-" + type + "-" + info;
		$http.get('http://localhost:5003/send_client_data/'+params).success(function(output){
			callback(output)
		});
	}

	return factory;
});


