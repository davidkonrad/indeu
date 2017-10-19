'use strict';

angular.module('indeuApp')
	.directive('entityArticles', function($timeout, Utils, Lookup, ESPBA) {

	return {
		templateUrl: "views/inc.entityArticles.html",
		restrict: 'A',
		transclude: true,
		priority: 500,
		scope: {
			entityType: '@',
			onEdit: '='
		},
		replace: true,
		link: function(scope, element, attrs) {
			attrs.$observe('entityArticles', function(user_id) {
				var id = attrs['entityArticles'] || false; //either group or user (so far)
				//scope.user_id = attrs['userId'] || false; 
				var type = attrs['entityType'] || false;
				scope.user_id = type == 'user' ? id : attrs['userId'];
				//scope.onEdit = attrs['onEdit'] || false;
				
				if (!id || !type) return;

				function process(articles) {
					articles.forEach(function(a) {
						a.created_timestamp = new Date(a.created_timestamp);
						a.dateInt = a.created_timestamp.valueOf();
						a.urlName = Utils.plainText( Utils.urlName(a.header), 50);
					});
					scope.articles = articles;
				}

				switch (type) {
					case 'user': 
						ESPBA.get('article', { user_id: id }).then(function(r) {
							process(r.data);
						});
						break;

					case 'group': 
						ESPBA.get('group_articles', { group_id: id }).then(function(r) {
							var articles = [];
							for (var i=0, l=r.data.length; i<l; i++) {
								ESPBA.get('article', { id: r.data[i].article_id }).then(function(a) {
									articles.push(a.data[0]);
									if (i >= l-1) process(articles);
								})
							}
						});
						break;

					default: 
						break;
				}
			});
		}
	}
});

