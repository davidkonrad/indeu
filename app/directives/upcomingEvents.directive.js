'use strict';

angular.module('indeuApp')
	.directive('upcomingEvents', function(Utils, Login, ESPBA) {

	return {
		templateUrl: "views/inc/inc.upcomingEvents.html",
		restrict: 'EA',
		replace: true,
		scope: {},
		link: function(scope, element, attrs) {

			var prepared = Login.isLoggedIn() ? 'UpcomingEventsLoggedIn' : 'UpcomingEvents';
			ESPBA.prepared(prepared).then(function(p) {
				p.data.forEach(function(e) {
					e.urlName = Utils.urlName(e.name);
					e.from = Utils.removeSecs(e.from);
					e.to = e.to != '00:00:00' ? Utils.removeSecs(e.to) : '';
				})
				scope.events = p.data;
			})

		}
	}

});

