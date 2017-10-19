'use strict';

angular.module('indeuApp')
	.directive('entityEvents', function($timeout, Utils, Lookup, ESPBA) {

	return {
		templateUrl: "views/inc.entityEvents.html",
		restrict: 'A',
		transclude: true,
		priority: 500,
		scope: {
			entityType: '@',
			onEdit: '='
		},
		replace: true,
		link: function(scope, element, attrs) {
			attrs.$observe('entityEvents', function(user_id) {
				var id = attrs['entityEvents'] || false; //either group or user (so far)
				var type = attrs['entityType'] || false;
				scope.user_id = type == 'user' ? id : attrs['userId'];
				//var onEdit = attrs['onEdit'] || false;
				//console.log('onEdirt', onEdit);
				
				if (!id || !type) return;

				function process(events) {
					events.forEach(function(e) {
						e.created_timestamp = new Date(e.created_timestamp);
						e.date = new Date(e.date);
						e.dateInt = e.date.valueOf();
						e.urlName = Utils.plainText( Utils.urlName(e.name), 50);
						e.to = e.to != '00:00:00' ? Utils.removeSecs(e.to) : '';
						e.from = Utils.removeSecs(e.from);
					});
					scope.events = events;
				}

				switch (type) {
					case 'user': 
						ESPBA.get('event', { user_id: id }).then(function(r) {
							process(r.data);
						});
						break;

					case 'group': 
						ESPBA.get('group_events', { group_id: id }).then(function(r) {
							var events = [];
							for (var i=0, l=r.data.length; i<l; i++) {
								ESPBA.get('event', { id: r.data[i].event_id }).then(function(a) {
									events.push(a.data[0]);
									if (i >= l-1) process(events);
								})
							}
						});
						break;

					default: 
						break;
				}

				scope.allEvents = false;
				var today = new Date().valueOf();
				scope.filterEvent = function(item) {
					if (scope.allEvents) return true;
					return item.dateInt >= today;
				}

				scope.setEventFilter = function(filter) {
					scope.allEvents = filter;
					if (!filter) Utils.scrollTo('#entity-event-directive');
				}

			});
		}
	}
});

