'use strict';

angular.module('indeuApp').directive('injectFancyboxable', function($timeout, $compile) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			$timeout(function() {			
				var fancyboxable = element.attr('fancyboxable');
				if (!fancyboxable) {
					var src = element.attr('src');
					if (src) {
						element.attr('fancyboxable', '{ centerOnScroll:true, margin:30 }');
						$compile(element)(scope)
					}
				}
			}, 500);
		}
	}
});

