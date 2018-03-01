;'use strict';

angular.module('indeuApp').directive('autoImage', function($compile) {

	return {
		restrict: 'AE',
		replace: true,
		scope: {
			src: '@',
		},
		template: '<div><img inject-fancyboxable></div>',
		link: function link(scope, element, attrs) {

			//
			function isQuadratic(w,h) {
				var percent = w/100;
				return Math.abs(w-h) < (percent*11)
			}

			//
			function isElongated(w,h) {
				var percent = w/100;
				return (h-w) > (percent*11)
			}

			attrs.$observe('src', function(newSrc) {
				if (newSrc) {
					var img = new Image();
					img.onload = function() {
						var h = img.height;
						var w = img.width;

						$(element).find('img').attr('src', newSrc);

						if (isQuadratic(w,h)) {
							element.attr('class', 'auto-image-left');
						} else if (isElongated(w,h)) {
							element.attr('class', 'auto-image-left-elongated');
						} else if (w>765) {
							element.attr('class', 'auto-image-top');
						} else {
							element.attr('class', 'auto-image-left');
						}
			
						$compile(element.contents())(scope);
				
					}
					img.src = newSrc;
				}
			})
		}
	}

});
