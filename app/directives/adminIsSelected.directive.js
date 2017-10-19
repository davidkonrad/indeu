'use strict';

angular.module('indeuApp')
	.directive('adminIsSelected', function($location) {
	return {
		restrict: 'A',
			link: function($scope, element, attrs) {
				var href = element.attr('href');
				var path = $location.path();
				if (href.indexOf(path)>-1) {
					element.addClass('selected');
				} else {
					element.removeClass('selected');
		    }
			}
		}
});

