'use strict';

/**
 *
 *
 */
angular.module('indeuApp').controller('ForeningForsideCtrl', 
	function($scope, Login, $routeParams, ESPBA, Lookup, Meta, Utils, Redirect, Const, UserVisits, Log) {

		if (Login.isLoggedIn()) {
			$scope.user = Login.currentUser()
		}

		let id = $routeParams.id;

		ESPBA.get('association', { id: id }).then(function(r) {
			$scope.forening = r.data[0];

			ESPBA.get('address', { hash: $scope.forening.hash }).then(function(a) {
				if (a.data && a.data[0]) {
					a = a.data[0];
					$scope.address = a;
					$scope.hasAddress = a.address != '';
				}
			})

			ESPBA.get('user', { id: $scope.forening.owner_id }).then(function(u) {
				u = u.data[0];
				$scope.forening.admin = u;
				$scope.forening.admin.url = Utils.userUrl(u.id, u.full_name);
			})

		})

		function loadArticles() {
			ESPBA.prepared('AssociationArticles', { association_id: id }).then(function(a) {
				a.data.forEach(function(item) {
					item.url = Utils.articleUrl(item.id, item.header)
				})
				$scope.articles = a.data
			})
		}
		loadArticles();

		function loadEvents() {
		}
		loadEvents();

		//----------------------------------------
		//actions
		$scope.action = '';

		$scope.setAction = function(action) {
			if (action != '' && $scope.action != '' && $scope.action != action) return;
			$scope.action = action;
		}

		$scope.actionCancel = function() {
			$scope.action = '';
		}

		$scope.actionDisable = function(action) {
			return $scope.action != action && $scope.action != '';
		}	

		$scope.actionSaved = function(item) {
			switch ($scope.action) {
				case 'a' : loadArticles(); break;
				case 'e' : loadEvents(); break;
				default: break;
			}
			$scope.action = '';
		}

		$scope.$watch('action', function() {
			switch ($scope.action) {
				case 'a' : 
					$scope.action_caption = $scope.edit_article_id ? 'rediger artikel' : 'opret artikel';
					break;
				case 'g' : 
					$scope.action_caption = $scope.edit_gruppe_id ? 'rediger gruppe' : 'opret gruppe';
					break;
				case 'e' : 
					$scope.action_caption = $scope.edit_gruppe_id ? 'rediger event' : 'opret event';
					break;
				default: 
					$scope.action_caption = undefined
					break;
			}
		});


});

