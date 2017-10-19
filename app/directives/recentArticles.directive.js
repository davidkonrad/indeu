'use strict';

angular.module('indeuApp')
	.directive('recentArticles', function(Utils, Login, Settings, ESPBA) {

	return {
		templateUrl: "views/inc/inc.recentArticles.html",
		restrict: 'EA',
		replace: true,
		scope: {},
		controller: function($scope) {
			Settings.init($scope);
		},
		link: function(scope, element, attrs) {

			scope.showEmpty = function() {
				return element.find('.list-group-item').length <= 0
			}

			var isLoggedIn = Login.isLoggedIn();
			var params = isLoggedIn	? { user_id: Login.currentUser().id } : {};

			ESPBA.prepared('recentArticles', params).then(function(p) {
				p.data.forEach(function(a) {
					a.urlName = Utils.urlName(a.header);
					if (!isLoggedIn) a.user_visited = true;
				})
				scope.articles = p.data;
			})

		}
	}

});

