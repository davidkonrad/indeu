'use strict';

angular.module('indeuApp')
	.directive('recentEvents', function(Utils, Login, Settings, ESPBA) {

	return {
		templateUrl: "views/inc/inc.recentEvents.html",
		restrict: 'EA',
		replace: true,
		scope: {
			notVisitedOnly: '@'
		},
		controller: function($scope) {
			Settings.init($scope);
		},
		link: function(scope, element, attrs) {

			scope.showEmpty = function() {
				//return angular.element('.recent-desc').length <= 0
				return element.find('.list-group-item').length <= 0
			}

			var cutText = function(text, maxLength) {
				if (text.length>maxLength) {
					return text.substring(0, maxLength) +' ..';
				} else {
					return text
				}
			};

			var params = Login.isLoggedIn() 
				? { user_id: Login.currentUser().id }
				: {};

			ESPBA.prepared('RecentEvents', params).then(function(p) {
				p.data.forEach(function(e) {
					e.urlName = Utils.urlName(e.name);
					e.urlLink = '/event/'+e.id+'/'+e.urlName;
					e.group_id = e.group_id || false;
					var n = e.name;
					if (e.group_name) {
						e.group_urlName = Utils.urlName(e.group_name);
						e.group_urlLink = '/grupper/'+e.group_id+'/'+e.group_urlName;
						e.name = cutText(e.name, 25);
					} else {
						e.name = cutText(e.name, 33);
					}
					e.tooltip = n != e.name ? n : '';
				})
				scope.events = p.data;
			})

		}
	}

});

