'use strict';

angular.module('indeuApp')
	.directive('editAddress', function(Utils, ESPBA, Lookup, Login, SelectBrugerModal, SelectGruppeModal, Notification, Const, Log) {

	return {
		templateUrl: "views/inc/inc.editAddress.html",
		restrict: 'EA',
		transclude: true,
		scope: {
			hash: '@',
			userId: '@',
		},
		replace: true,
		controller: function($scope) {
			$scope.edit = {
			};
		},

		link: function(scope, element, attrs) {
			scope.user_id = attrs['userId'] || false;

			attrs.$observe('hash', function(hash) {
				scope.edit.hash = hash;
				ESPBA.get('address', { hash: hash }).then(function(a) {
					if (a.data && a.data[0]) {
						scope.edit = a.data[0]
					} else {		
						scope.edit.hash = hash;
					}
				})
			})

			scope.$root.__addressSave = function() {
				if (scope.edit.id) {
					ESPBA.update('address', scope.edit).then(function(a) {
						//
					})
				} else {
					ESPBA.insert('address', scope.edit).then(function(a) {
						//
					})
				}
			}




/*
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
*/

		}
	}
});


