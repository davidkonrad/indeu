'use strict';

angular.module('indeuApp').
	directive('inputEnter', function() {
		return function(scope, element, attrs) {
			element.bind("keydown keypress", function(event) {
				if (event.which === 13) {
					scope.$apply(function() {
						scope.$eval(attrs.inputEnter, {'event': event});
					});
					event.preventDefault();
				}
			});
		};
	});

