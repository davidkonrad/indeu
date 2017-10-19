'use strict';

angular.module('indeuApp')
	.directive('recentComments', function(Utils, Login, ESPBA) {

	return {
		templateUrl: "views/inc/inc.recentComments.html",
		restrict: 'EA',
		replace: true,
		scope: {
			recentComments: '@',
			limit: '@'
		},
		link: function(scope, element, attrs) {

			attrs.$observe('recentComments', function() {
				var hash = attrs['recentComments'];
				var limit = attrs['limit'];
				var param = { hash: hash };
				if (limit) param.limit = limit;

				ESPBA.prepared('RecentComments', param).then(function(c) {
					if (c.data && c.data.length) scope.comments = c.data
				})
  	  });

			scope.commentClick = function(id) {
				Utils.scrollTo(id, 'fast');
			}


		}
	}

});

