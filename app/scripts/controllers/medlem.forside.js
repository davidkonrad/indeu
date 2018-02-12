'use strict';

/**
 *
 *
 */
angular.module('indeuApp').controller('MedlemForsideCtrl', 
	function($scope, $q, $routeParams, $timeout, ESPBA, Lookup, Meta, Utils, Login, Redirect, Const) {

		Redirect.checkLogin('Du skal være logget ind for at kunne se medlemsprofiler');
			
		const user_id = $routeParams.id;

		if (Login.isLoggedIn()) {
			$scope.is_self = Login.currentUser().id == user_id;
		}

		//sort articles
		$scope.limitToItems = Const.articleLimitToItems;
		$scope.articleOrderByItems = Const.articleOrderByItems;
		$scope.eventOrderByItems = Const.eventOrderByItems;

		ESPBA.get('user', { id: user_id }).then(function(r) {

			if (!r.data || !r.data.length) {
				Redirect._404();
				return
			}

			$scope.user = r.data[0];
			$scope.user.image = $scope.user.image || '';

			//for some reason timezone not work (yet)
			if ($scope.user.last_seen == '0000-00-00 00:00:00') {
				$scope.user.last_seen	= 'Har endnu ikke været logget ind'
			} else {
				$scope.user.last_seen = 'Sidst set '+moment($scope.user.last_seen).add(1, 'hours').calendar();
			}

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
				//sanitize
				a.data.forEach(function(item) {
					item.stars = parseFloat(item.stars, 10) || 0;
					item.counter = parseInt(item.counter, 10) || 0;
				})
				$scope.articles = {
					articles: a.data,
					orderBy: $scope.articleOrderByItems[0].id,
					limitTo: $scope.limitToItems[0].id
				}
			})

			ESPBA.prepared('EventsByUser', { user_id: user_id }).then(function(e) {
				//sanitize
				e.data.forEach(function(item) {
					item.feedback1 = parseInt(item.feedback1, 10) || 0;
					item.feedback2 = parseInt(item.feedback2, 10) || 0;
				})
				$scope.events = {
					events: e.data,
					orderBy: $scope.eventOrderByItems[0].id,
					limitTo: $scope.limitToItems[0].id
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


});

