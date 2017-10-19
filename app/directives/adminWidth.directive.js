'use strict';

angular.module('indeuApp')
	.directive('adminWidth', function($location) {
	return {
		restrict: 'A',
		link: function($scope, element, attrs) {
			$scope.$watch(
				function() { return element[0].childNodes.length; },
				function(newValue, oldValue) {
					if (newValue !== oldValue) {
						var isAdmin = $location.path().indexOf('/admin')>-1;
						if (isAdmin) {
							element.removeClass('max-width');
							element.addClass('admin-max-width');
						} else {
							element.addClass('max-width');
							element.removeClass('admin-max-width');
						}
		      }
		    });
			}
		}
});

