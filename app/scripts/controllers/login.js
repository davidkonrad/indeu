'use strict';

/**
 *
 *
 */
angular.module('indeuApp')
  .controller('LoginCtrl', ['$scope', '$location', '$window', 'ESPBA', 'Login', 'RememberMe', 
	function($scope, $location, $window, ESPBA, Login, RememberMe) {

		var rm = RememberMe.get();

		$scope.user = {
			navn: rm.m,
			password: rm.p,
			rememberMe: rm.p !== ''
		};

		$scope.canLogin = function() {
			return ($scope.user.navn !== '' && $scope.user.password !== '');
		};

		$scope.doLogin = function() {
			Login.login($scope.user.navn, $scope.user.password, $scope.user.rememberMe).then(function(r) {
				if (r.error) {
					$scope.user.error = r.error;
				} else {
					$location.path('/admin-produkter');
					$window.location.reload();
				}
			});
		};
	
}]);
