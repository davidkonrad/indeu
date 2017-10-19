'use strict';

angular.module('indeuApp')
	.directive('searchBox', function(Redirect) {

	return {
		templateUrl: "views/inc/inc.searchBox.html",
		restrict: 'EA',
		replace: true,
		scope: {
		},
		link: function(scope, element, attrs) {
			var input = element.find('input');
			input.on('keydown', function(e) {
				console.log(e.which, this.value.length);
				if (e.which === 13 && this.value.length>0) {
					console.log(this.value);
					Redirect.search(this.value)
				}
			})
		}
	}

});

