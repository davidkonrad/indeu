;'use strict';

angular.module('indeuApp').directive('userSignature', function(Lookup) {

	return {
		restrict: 'AE',
		replace: true,
		scope: {
			id: '@',
		},
		template: '<a ng-href="{{ url }}">{{ signature }}</a>',
		link: function link(scope, element, attrs) {
			attrs.$observe('id', function(id) {
				if (id) {
					var user = Lookup.getUser(id);
					scope.url = user.url;
					scope.signature = user.signature_str;
				}
			})
		}
	}

});
