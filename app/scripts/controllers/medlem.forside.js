'use strict';

/**
 *
 *
 */
angular.module('indeuApp')
  .controller('MedlemForsideCtrl', function($scope, $q, $routeParams, $timeout, ESPBA, Lookup, Meta, Utils, Login, Redirect) {

		Redirect.checkLogin('Du skal være logget ind for at kunne se medlemsprofiler');
			
		let user_id = $routeParams.id;

		if (Login.isLoggedIn()) {
			$scope.is_self = Login.currentUser().id == user_id;
		}

		ESPBA.get('user', { id: user_id }).then(function(r) {
			$scope.user = r.data[0];
			$scope.user.image = $scope.user.image || '';

			ESPBA.get('address', { hash: $scope.user.hash }).then(function(a) {
				if (a.data && a.data[0]) $scope.user.address = a.data[0];
				$scope.showAddress = $scope.user.visible_address && $scope.user.address;
				$scope.showEmail = $scope.user.visible_email && $scope.user.email;
				$scope.showPhone = $scope.user.visible_phone && $scope.user.address.phone1;
			})

			ESPBA.get('social_media', { hash: $scope.user.hash }).then(function(s) {
				if (s.data && s.data[0]) $scope.user.social = s.data[0];
				$scope.showSocial = $scope.user.visible_social_media && $scope.user.social;
			})

			ESPBA.prepared('ArticlesByUserFull', { user_id: user_id }).then(function(a) {
				$scope.articles = {
					articles: a.data,
					orderBy: '',
				}
			})

			$timeout(function() {
				$scope.$apply();
			}, 10)			
		});

		ESPBA.prepared('GroupsByUser', { user_id: user_id }).then(function(r) {
			r.data.forEach(function(g) {
				g.is_owner = g.owner_id == user_id;
				g.url = Utils.gruppeUrl(g.id, g.name);
				g.active = g.active == 1;

				var followersText = g.followers == 1 ? ' følger' : ' følgere';
				var html = '<strong>'+g.followers + followersText + '</strong><br>';
				html += Utils.plainText(g.about, 100);
				g.popoverHtml = html;
			});
			$scope.groups = r.data
		});

		ESPBA.get('event', { user_id: user_id }).then(function(r) {
			$scope.events = r.data;
		});


});

