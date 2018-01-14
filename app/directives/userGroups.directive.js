'use strict';

angular.module('indeuApp')
	.directive('userGroups', function($timeout, Utils, Lookup, ESPBA) {

	return {
		templateUrl: "views/inc.userGroups.html",
		restrict: 'A',
		transclude: true,
		priority: 500,
		scope: {
			personal: '@',
			userGroups: '@' 
		},
		replace: true,
		link: function(scope, element, attrs) {
			attrs.$observe('userGroups', function(user_id) {
				var personal = attrs['personal'] || false;

				ESPBA.get('group_user', { user_id: user_id }).then(function(r) {
					scope.groups = [];
					r.data.forEach(function(g) {
						var group = Lookup.getGroup(g.group_id);
						group.is_owner = group.owner_id == user_id;
						group.owner_title = !personal ? 'Du er administrator af denne gruppe' : personal+' er administrator af denne gruppe';
						group.urlName = Utils.urlName(group.name);
						group.urlTitle = Utils.plainText(group.about, 200);
						//console.log(group.is_owner, group.owner_title, group.urlName, group.about, group.urlTitle);
						scope.groups.push(group);
					});
				});
			});
		}
	}
});

