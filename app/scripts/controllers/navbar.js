'use strict';

/**
 *
 *
 */
angular.module('indeuApp')
  .controller('NavbarCtrl', function($scope, $location, $timeout, $compile, Login, Lookup, RememberMe, ESPBA, Utils) {

		$scope.isLoggedIn = function() {
			if (Login.isLoggedIn()) {
				$scope.user_name = Login.currentUser().first_name;
				return true
			}
			if ($scope.showSearch) $scope.showSearch = false;
			return false;
		}

		$scope.userIsAdmin = function() {
			if (Login.isLoggedIn()) {
				return Login.isAdmin()
			}
			return false;
		}

		if (Login.isLoggedIn()) {
			if (!$scope.showSearch) $scope.showSearch = true;
		}

		$scope.rememberMe = RememberMe.get();
		$scope.isAdmin = Login.isAdmin();

		$scope.logout = function() {
			$scope.showSearch = false;
			Login.logout();
			$location.path('/');
			$scope.reloadGroups();
		};

		$scope.login = {
			error: '',
			email: $scope.rememberMe.m,
			password: $scope.rememberMe.p,
			rememberMe: $scope.rememberMe.rememberMe == true ? 1 : 0
		};

		$scope.showSearchForm = function() {
			return $scope.showSearch == true
		}

		$scope.doLogin = function() {
			Login.login($scope.login.email, $scope.login.password, $scope.login.rememberMe).then(function(response) {
				if (response && response.error) {
					$scope.login.error = response.error
				} else {
					$scope.error = '';
					$scope.isAdmin = Login.isAdmin();
					$location.path('/dig');
					$scope.reloadGroups();
					$timeout(function() {
						$scope.showSearch = true;
						//$compile(angular.element('#indeu-navbar'))($scope);
					}, 800);
				}
			})
			.catch( function(err) {
				$scope.errors.other = err.message;
			});
		}

		$scope.isBlank = function() {
			console.log('isBklabk', $location.path());
			return $location.path() == '/'
		}

		$scope.showSearchBox = function() {
			return $location.path() != '/soeg'
		}

		$scope.reloadGroups = function() {
			var params = Login.isLoggedIn() ? {	user_id: Login.currentUser().id } : {};
			ESPBA.prepared('MenuGroups', params).then(function(g) {
				//console.log('g', g);
				//if ($scope.groups) delete $scope.groups; //$scope.groups.lerngth = 0;// = [];
				//if ($scope.groups) $scope.groups = []; //$scope.groups.lerngth = 0;// = [];

				if (g.data.length) {
					if ($scope.groups) delete $scope.groups; 

					var a = { f:[], s:[], t: [] };
					var i = 'f';
					var third = Math.abs(g.data.length / 3);					
					var c = 0;
					g.data.forEach(function(e) {
						e.url = Utils.gruppeUrl(e.id, e.name);
						a[i].push(e);
						c++;
						if (c>third) i='s';
						if (c>third*2) i='t';
					});
					//$scope.groups = a;
					$timeout(function() {
						//angular.extend($scope.groups, a);
						$scope.groups = a;
            $scope.$apply();
						//$compile(angular.element('#nav-indeu-groups'))($scope);
						//console.log($scope.groups);
						//$scope.groups = a;
						//$compile(angular.element('#indeu-navbar'))($scope);
					})
				}
			});
		}
		if (!$scope.groups) $scope.reloadGroups();


});


