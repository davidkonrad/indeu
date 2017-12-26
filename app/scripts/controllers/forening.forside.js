'use strict';

/**
 *
 *
 */
angular.module('indeuApp').controller('ForeningForsideCtrl', 
	function($scope, Login, $routeParams, ESPBA, Lookup, Meta, Utils, Redirect, Const, UserVisits, Log) {

		$scope.eventMap = Const.defaultMap();

		if (Login.isLoggedIn()) {
			$scope.user = Login.currentUser()
		}

		var id = $routeParams.id;
		ESPBA.get('association', { id: id }).then(function(r) {
			$scope.forening = r.data[0];
		})

/*
		$scope.reloadEvent = function() {
			ESPBA.get('event', { id: id }).then(function(r) {
				$scope.event = r.data[0];

				UserVisits.visit($scope.event.hash);

				$scope.event.from = Utils.createTime( $scope.event.from );
				$scope.event.to = Utils.createTime( $scope.event.to );

				var lat = parseFloat($scope.event.lat);
				var lng = parseFloat($scope.event.lng);

				if (lat && lng) {
					$scope.eventMap.markers.marker = {
						lat: lat,
						lng: lng,
						focus: true,
						draggable: false
					}
					$scope.eventMap.center = {
						lat: lat,
						lng: lng,
						zoom: 13
					}

					//console.log($scope.event.visibility_level);
					switch ($scope.event.visibility_level) {
						case '1': 
							break;
						case '2': 
							if (!Login.isLoggedIn()) {
								Redirect.home('Du skal være logget ind for at kunne se denne event');
							}
							break;
						default:
							break;
					}
				}

				$scope.event_user = Lookup.getUser($scope.event.user_id);
				$scope.event_user.urlName = Utils.urlName( $scope.event_user.full_name );

				ESPBA.get('event_contactperson', { event_id: id }).then(function(c) {
					var contactpersons = c.data.map(function(cp) {
						cp.user = Lookup.getUser(cp.user_id);
						return cp
					})
					$scope.event_contactpersons = contactpersons;
				});

				//groups
				ESPBA.get('group_events', { event_id: id }).then(function(gr) {
					gr.data.forEach(function(g) {
						var group = Lookup.getGroup(g.group_id);
						g.name = group.name;
						g.urlName = Utils.urlName(group.name);
					})
					$scope.event_groups = gr.data;
				});

			});

			if (Login.isLoggedIn()) {
				ESPBA.get('event_user_feedback', { event_id: id, user_id: $scope.user.id }).then(function(f) {
					if (f.data.length) {
						$scope.feedback = f.data[0];
					} else {
						$scope.feedback = {
							feedback: 0,
							user_id: $scope.user.id,
							event_id: id
						}
					}
				});
			}
		}
		$scope.reloadEvent();
	*/


		$scope.action = '';

		$scope.setAction = function(action) {
			if (action != '' && $scope.action != '' && $scope.action != action) return;
			$scope.action = action;
		}

		$scope.actionCancel = function() {
			$scope.action = '';
			$scope.reloadEvent(); //??
		}

		$scope.actionDisable = function(action) {
			return $scope.action != action && $scope.action != '';
		}	

		$scope.actionSaved = function(item) {
			$scope.action = '';
			$scope.reloadEvent();
		}


});

