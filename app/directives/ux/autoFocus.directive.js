'use strict';

angular.module('indeuApp').directive('autoFocus', function($timeout) {
	return {
		restrict: 'AC',
		link: function(scope, element) {
			$timeout(function() {
				element[0].focus();
			}, 0);
		}
	};
});
