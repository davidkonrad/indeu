'use strict';

var isLocalHost = (location.hostname === "localhost" || location.hostname === "127.0.0.1");

angular.module('indeuApp')
	.directive('debugLink', function($timeout) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			$timeout(function() {			
				var href = element.attr('href');
				if (href && isLocalHost && href.charAt(0) == '/') {
					element.attr('href', '#'+href);
				}
			}, 100);
		}
	}
});

