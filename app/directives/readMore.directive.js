'use strict';

angular.module('indeuApp').directive('readMore', function($timeout) {

	return {
		restrict: 'AE',

		link: function link(scope, element, attrs) {

			$timeout(function() {

				if (element[0].offsetHeight > 100) {

					var linkSuffix = new Date().getTime();
					var readMoreClass = 'readMore'+linkSuffix;
					var moreText = ' ▼  Læs mere';
					//var moreText = '<i class="fa fa-chevron-down"></i> Læs mere';
					var lessText = ' ▲  Læs mindre';
					//var lessText = '<i class="fa fa-chevron-up"></i> Læs mindre';
					var link = 	'<h5 class="no-padding"><a class="unstyled text-primary ' + readMoreClass + '">' + moreText + '</a></h5>';

					element[0].style.height = '100px';				
					element[0].style.overflowY = 'hidden';
					
					$(element).after(link);
					$('body').on('click', '.' + readMoreClass, function() {
						if ($(this).text() == moreText) {
							element[0].style.height = 'auto';
							element[0].style.overflowY = 'visible';
							$(this).html(lessText);
						} else {
							element[0].style.height = '100px';				
							element[0].style.overflowY = 'hidden';
							$(this).html(moreText);
							$("body").animate({scrollTop: $(this).offset().top -100}, "slow");
						}
					});
				}

			}, 150);

		}
	}

});


