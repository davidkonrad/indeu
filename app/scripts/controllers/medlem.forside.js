'use strict';

/**
 *
 *
 */
angular.module('indeuApp')
  .controller('MedlemForsideCtrl', function($scope, $q, $routeParams, $timeout, ESPBA, Lookup, Meta, Utils, Login, Redirect) {

		Redirect.checkLogin('Du skal være logget ind for at kunne se medlemsprofiler');
			
		var user_id = $routeParams.id;

		ESPBA.get('user', { id: user_id }).then(function(r) {
			$scope.user = r.data[0];
			$scope.user.image = $scope.user.image || '';
			$timeout(function() {
				$scope.$apply();
			}, 10)			
		});

		ESPBA.get('group_user', { user_id: user_id }).then(function(r) {
			$scope.groups = [];
			r.data.forEach(function(g) {
				var gruppe = Lookup.getGroup(g.group_id);
				gruppe.is_owner = gruppe.owner_id == user_id;
				gruppe.urlName = Utils.urlName(gruppe.name);
				gruppe.urlTitle = Utils.plainText(gruppe.about, 200);
				$scope.groups.push(gruppe);
			});
		});

		ESPBA.get('event', { user_id: user_id }).then(function(r) {
			$scope.events = r.data;
		});

		ESPBA.get('article', { user_id: user_id }).then(function(r) {
			$scope.articles = r.data;
			$scope.articles.forEach(function(a) {
				a.headerUrl = Utils.urlName(a.header);
			});
		});


});

