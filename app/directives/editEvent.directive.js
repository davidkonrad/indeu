'use strict';

angular.module('indeuApp')
	.directive('editEvent', 
	function($timeout, Utils, ESPBA, Lookup, Login, SelectBrugerModal, SelectGruppeModal, Notification, Const, Log) {

	return {
		templateUrl: "views/inc/inc.editEvent.html",
		restrict: 'A',
		transclude: true,
		scope: {
			onSave: '&',
			onCancel: '&',
			userId: '@',
			groupId: '@',
			associationId: '@',
			eventParticipants: '='
		},
		replace: true,
		controller: function($scope) {

			$scope.event = {
				visibility_level: 2,
				date: new Date(),
				user_id: 0, //user_id,
				from: '',
				to: '',
				name: '',
				about: '',
				image: '',
				address: ''
			};

			$scope.eventMap = Const.defaultMap();

			$scope.eventAdresseSelect = function(item) {
				$scope.event.postal_code = item.postCodeIdentifier;
				$scope.event.city = item.districtName;
				$scope.event.lat = item.y || item.yMin;
				$scope.event.lng = item.x || item.xMin;
				if ($scope.event.lat && $scope.event.lng) {
					$scope.eventMap.markers.marker = {
						lat: parseFloat($scope.event.lat),
						lng: parseFloat($scope.event.lng),
						focus: true,
						draggable: true
					}
					$scope.eventMap.center = {
						lat: parseFloat($scope.event.lat),
						lng: parseFloat($scope.event.lng),
						zoom: 12
					}
				}
				$scope.$apply();
			}

		},
		link: function(scope, element, attrs) {
			scope.group_id = attrs['groupId'] || false;
			scope.association_id = attrs['associationId'] || false;
			scope.user_id = attrs['userId'] || false;

			var user_id = attrs['userId'] || false;
			var onSave = attrs['onSave'] || false;
			var onCancel = attrs['onCancel'] || false;
			var event_id = attrs['editEvent'] || false;
			if (event_id) {
				ESPBA.get('event', { id: event_id }).then(function(e) {
					scope.event = e.data[0];
					scope.event.visibility_level = parseInt(scope.event.visibility_level);
					scope.event.from = Utils.removeSecs(scope.event.from);
					scope.event.to = Utils.removeSecs(scope.event.to);
					if (e.data[0].lat && e.data[0].lng) {
						var latLng = {
							lat: parseFloat(e.data[0].lat),
							lng: parseFloat(e.data[0].lng)
						};
						scope.eventMap.markers.marker = latLng;
						latLng.zoom = 11;
						scope.eventMap.center = latLng;
					}
				});
			}

			scope.reloadContactPersons = function() {
				ESPBA.get('event_contactperson', { event_id: event_id }).then(function(c) {
					c.data.forEach(function(cp) {
						cp.user = Lookup.getUser(cp.user_id);
					});
					scope.event_contactpersons = c.data;
				});
			}
			scope.reloadContactPersons();

			scope.reloadGroups = function() {
				ESPBA.get('group_events', { event_id: event_id }).then(function(gr) {
					gr.data.forEach(function(g) {
						g.name = Lookup.getGroup(g.group_id).name;
					});
					scope.event_groups = gr.data;
				});
			}
			scope.reloadGroups();

			scope.eventAction = {};
			scope.eventAction.caption = event_id ? 'Gem og afslut' : 'Opret og afslut';

/* contact persons */
			scope.eventAction.addContact = function() {
				var ids = scope.event_contactpersons.map(function(c) {
					return c.user_id
				});
				SelectBrugerModal.show(scope, false, ids).then(function(user) {
					if (user) {
						ESPBA.insert('event_contactperson', { event_id: scope.event.id, user_id: user.id}).then(function(cp) {
							scope.reloadContactPersons();
							Log.log({
								type: Log.EVENT_CONTACTPERSON_ADDED,
								user_id: Login.currentUser().id,
								context_user_id: user.id,
								hash: scope.event.hash
							});
						});
					}
				})
			}

			scope.eventAction.removeContact = function(id, user_id) {
				ESPBA.delete('event_contactperson', { id: id }).then(function() {
					scope.reloadContactPersons();
					Log.log({
						type: Log.EVENT_CONTACTPERSON_REMOVED,
						user_id: Login.currentUser().id,
						context_user_id: user_id,
						hash: scope.event.hash
					});
				});
			}

			scope.eventAction.cannotRemoveContact = function() {
				Notification('Du kan ikke fjerne dig selv som kontaktperson');
			}

/* groups */
			scope.eventAction.addGroup = function() {
				var ids = scope.event_groups.map(function(g) {
					return g.group_id
				});
				SelectGruppeModal.show(scope, false, ids).then(function(group) {
					if (group) {
						ESPBA.insert('group_events', { event_id: scope.event.id, group_id: group[0].id}).then(function(g) {
							scope.reloadGroups();
							Log.log({
								type: Log.EVENT_GROUP_ADDED,
								user_id: Login.currentUser().id,
								context_user_id: group[0].id, //!!
								hash: scope.event.hash
							});
						});
					}
				})
			}

			scope.eventAction.removeGroup = function(id, group_id) {
				ESPBA.delete('group_events', { id: id }).then(function() {
					scope.reloadGroups();
					Log.log({
						type: Log.EVENT_GROUP_REMOVED,
						user_id: Login.currentUser().id,
						context_user_id: group_id, //!!
						hash: scope.event.hash
					});
				});
			}


/* edit actions */
			scope.eventAction.canSave = function() {
				var e = scope.event;
				return e.name && e.date && e.from && e.address
			}

			scope.eventAction.save = function() {
				if (event_id) {
					ESPBA.update('event', scope.event).then(function() {
						Notification.primary('Eventen <strong>' + scope.event.name +'</strong> er opdateret');
						if (onSave) scope.onSave();
						Log.log({
							type: Log.EVENT_EDITED,
							user_id: Login.currentUser().id,
							hash: scope.event.hash
						});

					})
				} else {
					scope.event.user_id = scope.user_id;
					scope.event.hash = Utils.getHash();
					ESPBA.insert('event', scope.event).then(function(e) {
						Notification.primary('Eventen <strong>' + scope.event.name +'</strong> er oprettet');
						if (scope.group_id) {
							ESPBA.insert('group_events', { group_id: scope.group_id, event_id: e.data[0].id }).then(function() {			
								//
							})
							ESPBA.insert('event_contactperson', { event_id: e.data[0].id, user_id: scope.user_id }).then(function() {			
								//
							})
						} 
						if (scope.association_id) {
							ESPBA.insert('association_events', { association_id: scope.association_id, event_id: e.data[0].id }).then(function() {			
							})
						}
						Log.log({
							type: Log.EVENT_CREATED,
							user_id: Login.currentUser().id,
							hash: e.data[0].hash
						});

						$timeout(function() {
							if (onSave) scope.onSave();
						})

					})
				}
			}

			scope.eventAction.cancel = function() {
				if (onCancel) scope.onCancel();
			}
			
		}
	}
});


