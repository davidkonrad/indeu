'use strict';

angular.module('indeuApp').directive('userRecentArticles', function(Utils, Login, Settings, ESPBA) {

	return {
		templateUrl: "views/inc/inc.userRecentArticles.html",
		restrict: 'EA',
		replace: true,
		scope: {
			userRecentArticles: '@'
		},
		link: function(scope, element, attrs) {

			scope.showEmpty = function() {
				return element.find('.list-group-item').length <= 0
			}

			attrs.$observe('userRecentArticles', function() {
				var user_id = attrs['userRecentArticles'];
				ESPBA.get('article', { user_id: user_id }, { orderBy: { field: 'created_timestamp', order: 'desc' }}).then(function(articles) {
					articles.data.forEach(function(a) {
						a.url = Utils.isLocalHost() ? '/#/' : '/';
						a.url += 'artikel/' + a.id + '/'+Utils.urlName(a.header);
					});
					scope.articles = articles.data;
				})
			})
		}

	}

});

