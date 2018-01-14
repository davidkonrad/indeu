'use strict';

/**
 *
 *
 */
angular.module('indeuApp').controller('ForeningForsideCtrl', 
	function($scope, Login, $routeParams, ESPBA, Lookup, Meta, Utils, Redirect, Const, UserVisits, Log, AlertModal) {

		let id = $routeParams.id;

		if (Login.isLoggedIn()) {
			$scope.user = Login.currentUser();
			$scope.userIsMember = Login.isAssociationMember(id);
		}

		//sort articles
		$scope.orderByItems = Const.articleOrderByItems;
		$scope.limitToItems = Const.articleLimitToItems;

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
			ESPBA.prepared('ArticlesByAssociationFull', { association_id: id }).then(function(a) {
				//sanitize
				a.data.forEach(function(item) {
					item.stars = parseFloat(item.stars, 10) || 0;
					item.counter = parseInt(item.counter, 10) || 0;
				})
				$scope.articles = {
					articles: a.data,
					orderBy: $scope.orderByItems[0].id,
					limitTo: $scope.limitToItems[0].id
				}
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
			
			if ($scope.action == 'r') {
				AlertModal.show('Du har rettigheder til at redigere foreningen, men funktionaliteten er endnu ikke implementeret på brugerniveau', 'Desværre').then(function() {
					$scope.setAction('');
				})
			}
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
				case 'f' : 
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

