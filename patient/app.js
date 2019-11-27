var app = angular.module('application', []);

app.run(['$rootScope', '$http', function($rootScope, $http) {
	var req = {
		method: 'GET',
		url: 'http://localhost:5001/get_all/',
		headers: {'Access-Control-Allow-Origin': '*'}
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

	$scope.toggleSelection = function(phr){
		phr.isToVerify = !phr.isToVerify;
	}

	$scope.keyRequest = function(){

		console.log("Inside keyRequest of app.js function");
		var attr = $scope.key_attributes;
		var user = $scope.user;

		appFactory.keyRequest(attr, user, function(res){
			console.log(res.status)
			console.log(res);
			if (res.status == 200 && res.data.status == "KEY-OK"){
				$("#success_key").show();
				$("#error_key").hide();
				$rootScope.users_list.push({id: res.data.id, name: user.name});
			}else{
				$("#error_key").show();
				$("#success_key").hide();
			}
		});
	}
	
	$scope.getDataToVerify = function(){
		list_selected = [];
		console.log("Inside getDataToVerify of app.js function");
		var req_identity = $scope.request_identity.split(',')[0];
		var name = $scope.request_identity.split(',')[1];
		//console.log(req_identity);

		appFactory.getDataToVerify(req_identity, name, function(data){
			//console.log(data);
			//console.log(data.length)
			$scope.phr_to_verify = data;
		});
	}

	$scope.verifyData = function(){
		
		list_selected = [];
		console.log("Inside verifyData of app.js function");
		var req_identity = $scope.request_identity.split(',')[0];
		var name = $scope.request_identity.split(',')[1];
		var policy = $scope.attribute_list; 
		console.log(req_identity);
		console.log(name);
		for(var i = 0; i < $scope.phr_to_verify.length; i++){
			//console.log('Checking item ' + i + ' - Checkebox is ' + $scope.phr_to_verify[i].isToVerify);
			if($scope.phr_to_verify[i].isToVerify == true){
				//console.log('Item is true, pushing in the list')
				list_selected.push($scope.phr_to_verify[i]);
			}
		}
		console.log('List to send:');
		console.log(list_selected);
		console.log(policy);

		appFactory.verifyData(req_identity, name, list_selected, list_selected.length, policy, function(res){
			
			//still_to_verify = [];
			for(var i = 0; i < $scope.phr_to_verify.length; i++){
				//console.log('Checking item ' + i + ' - Checkebox is ' + $scope.phr_to_verify[i].isToVerify);
				if($scope.phr_to_verify[i].isToVerify == true){
					console.log('Found an element to remove')
					$scope.phr_to_verify.splice(i, 1);   
					//console.log('Item is true, pushing in the list')
					//still_to_verify.push($scope.phr_to_verify[i]);
				}
			}
			console.log($scope.phr_to_verify);
			//$scope.phr_to_verify = data;

			if (res.status==200 && res.data == "VERIFY-OK"){
				$("#success_verify_phr").show();
				$("#error_verify_phr").hide();
			}else{
				$("#error_verify_phr").show();
				$("#success_verify_phr").hide();
			}

		});
	}

	$scope.addPHRData = function(){
		console.log("Inside scope.addPHRData function");
		var req_identity = $scope.request_identity.split(',')[0];
		var req_name = $scope.request_identity.split(',')[1];

		appFactory.addPHRData($scope.phr, req_identity, req_name, function(res){
			console.log(res)
			if (res.status==200 && res.data == "WRITE-OK"){
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

		params = {name: user.name, address: user.address, dob: user.date, attributes: attr};
		console.log(params);
		
		$http({
			method: 'POST',
			url: 'http://localhost:5001/get_key/',
			params: params
		}).then(function(output){
			callback(output)
		})

	}

    factory.getDataToVerify = function(identity, name, callback){
		console.log('Inside getDataToVerify factory function')
		//console.log(identity);
		params = identity + '-' + name;

    	$http.get('http://localhost:5001/get_data_to_verify/'+params).success(function(output){
			callback(output)
		});
	}

	factory.verifyData = function(identity, name, selected, length, policy, callback){
		console.log('Inside verifyData factory function')
		var params = {id: identity, name:name, policy: policy, length: length, verify: selected}

		console.log('Sending verification request for parameters');
		console.log(params);

		$http({
			method: 'POST',
			url: 'http://localhost:5001/verify_data/',
			params: params
		}).then(function(output){
			callback(output)
		})
	}

	factory.addPHRData = function(data, identity, name, callback){
		console.log('Inside recordEhr factory function');
		params = {id: identity, name: name, type: data.type, data: data.data, policy: data.new_attribute_list};
		console.log(params);

		$http({
			method: 'POST',
			url: 'http://localhost:5001/add_data/',
			params: params
		}).then(function(output){
			callback(output)
		})
	}

	return factory;
});




