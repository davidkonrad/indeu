'use strict';

angular.module('indeuApp')
	.directive('entityEvents', function($timeout, Utils, Lookup, ESPBA) {

	return {
		templateUrl: "views/inc/inc.entityEvents.html",
		restrict: 'A',
		transclude: true,
		priority: 500,
		scope: {
			entityType: '@',
			orderBy: '=',
			limitTo: '=',
			onEdit: '='
		},
		replace: true,
		link: function(scope, element, attrs) {
			attrs.$observe('entityEvents', function(user_id) {
				var id = attrs['entityEvents'] || false; //either group or user (so far)
				var type = attrs['entityType'] || false;
				scope.user_id = type == 'user' ? id : attrs['userId'];
				
				if (!id || !type) return;

				function process(events) {
					events.forEach(function(e) {
						e.created_timestamp = new Date(e.created_timestamp);
						e.counter = e.counter ? parseInt(e.counter) : 0;
						e.counter_suffix = e.counter == 1 ? 'gang ' : 'gange';

						e.dateInt = new Date(e.date+' '+e.from).valueOf();

						//generate på onsdag kl. 18:30-21:30
						e.date_fromNow = Utils.calendar(e.date+' '+e.from);
						//if 7 days away, format 20.02.2018, add time
						var dots = e.date_fromNow.split('.').length;
						if (dots>2) {
							e.date_fromNow += ' kl. '+Utils.removeSecs(e.from);
							if (e.to != '00:00:00') {
								e.date_fromNow += '-'+Utils.removeSecs(e.to);
							}
						} else {
							if (e.to != '00:00:00') {
								e.date_fromNow += '-'+Utils.removeSecs(e.to);
							}
						}

						e.feedback1 = e.feedback1 ? parseInt(e.feedback1) : 0;
						e.feedback2 = e.feedback2 ? parseInt(e.feedback2) : 0;
						e.feedback_total = e.feedback1 + e.feedback2;

						e.feedback_str = '';
						if (e.feedback1>0) {
							e.feedback_str = e.feedback1.toString();
							if (e.feedback2>0) {
								e.feedback_str += ' + '+e.feedback2.toString();
							}
						} else if (e.feedback2>0) {
							e.feedback_str = e.feedback2.toString();
						} else {
							e.feedback_str = '-';
						}

						e.feedback_title = '';
						if (e.feedback1>0) e.feedback_title = e.feedback1+' deltager. ';
						if (e.feedback2>0) e.feedback_title += e.feedback2+' deltager måske. ';						

						//e.date = new Date(e.date);
						//e.dateInt = e.date.valueOf();
						e.urlName = Utils.plainText( Utils.urlName(e.name), 50);
						e.to = e.to != '00:00:00' ? Utils.removeSecs(e.to) : '';
						e.from = Utils.removeSecs(e.from);
					});
					scope.events = events;
				}

				switch (type) {
					case 'user': 
						//ESPBA.get('event', { user_id: id }).then(function(r) {
						ESPBA.prepared('EventsByUser', { user_id: id }).then(function(r) {
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

