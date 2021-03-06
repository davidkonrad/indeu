'use strict';

/**
 *
 *
 */
angular.module('indeuApp').controller('EventForsideCtrl', 
	function($scope, $rootScope, $routeParams, $timeout, Login, ESPBA, Lookup, Meta, Utils, Redirect, Const, UserVisits, Log, VisitCounter, ConfirmModal, Wait) {

		$scope.eventMap = Const.defaultMap();

		const id = $routeParams.id;

		if (Login.isLoggedIn()) {
			$scope.user = Login.currentUser()
		}

		$scope.reloadEvent = function(update) {
			ESPBA.prepared('EventWithUser', { event_id: id }).then(function(r) {

				if (!r.data || !r.data.length) {
					Redirect._404();
					return
				}

				$scope.event = r.data[0];

				Meta.setTitle($scope.event.name);
				Meta.setDescription( Utils.plainText($scope.event.about, 200));

				//timestamps
				$scope.event.dateStamp = moment($scope.event.created_timestamp).calendar(); 
				$scope.event.realDate = moment($scope.event.created_timestamp); 
				if ($scope.event.edited_timestamp) {
					$scope.event.edited_timestamp_display = moment($scope.event.edited_timestamp).calendar()
				}

				//date due
				$scope.dateDue = new Date().valueOf() > new Date($scope.event.date+' '+$scope.event.from).valueOf();

				//image
				if ($scope.event.image) {
					$scope.event.image_url = 'media/event/'+$scope.event.image;
				}

				//user info
				$scope.event.userFullName = $scope.event.user_full_name; //fallback
				$scope.event.userUrl = Utils.userUrl($scope.event.user_id, $scope.event.userFullName);
				if ($scope.user) {
					$scope.event.isOwner = $scope.event.user_id == $scope.user.id
				} 

				//update visitor count
				if (!update) {
					UserVisits.visit($scope.event.hash);
					VisitCounter.visit($scope.event.hash);
				}

				$scope.event.from = Utils.createTime($scope.event.from);
				$scope.event.to = $scope.event.to != '00:00:00' ? Utils.createTime($scope.event.to) : undefined;
				$scope.event.showDate = moment($scope.event.date).format('dddd D MMMM, YYYY');

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
						zoom: 11
					}

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
					if (c.data && c.data.length > 0) {
						$scope.event_contactpersons = c.data.map(function(cp) {
							cp.user = Lookup.getUser(cp.user_id);
							cp.url = Utils.userUrl(cp.user.id, cp.user.full_name)
							return cp
						})
					}
				});

				//groups
				ESPBA.get('group_events', { event_id: id }).then(function(gr) {
					if (gr.data && gr.data.length > 0) {
						$scope.event_groups = gr.data.map(function(item) {
							item.group = Lookup.getGroup(item.group_id);
							item.url = Utils.gruppeUrl(item.group.id, item.group.name);
							return item
						})
					}
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
		$scope.reloadEvent(false);

		//for some reason, two way binding does not work with bs-radio-group and 2.1.13
		$scope.setFeedback = function(value) {
			var ev = $scope.event.id;
			$scope.event.id = undefined;
			if (value == 0 && $scope.feedback.id) {
				$scope.feedback.feedback = value;
				ESPBA.delete('event_user_feedback', { id: $scope.feedback.id }).then(function() {
					$scope.feedback.id = null;
					$scope.event.id = ev;
					
					Log.log({ 
						type: Log.EVENT_FEEDBACK_REMOVE,
						user_id: $scope.user.id,
						hash: $scope.event.hash
					});

				})
			} else {
				$scope.feedback.feedback = value;

				var logParams = { 
					type: value == 1 ? Log.EVENT_FEEDBACK_1 : Log.EVENT_FEEDBACK_2,
					user_id: $scope.user.id,
					hash: $scope.event.hash
				};

				if ($scope.feedback.id) {
					ESPBA.update('event_user_feedback', $scope.feedback).then(function() {
						$scope.event.id = ev;
						Log.log(logParams);
					})
				} else {
					ESPBA.insert('event_user_feedback', $scope.feedback).then(function(f) {
						$scope.feedback = f.data[0];
						$scope.event.id = ev;
						Log.log(logParams);
					})
				}
			}
		}

		$scope.action = '';

		$scope.setAction = function(action) {
			if (action != '' && $scope.action != '' && $scope.action != action) return;
			$scope.action = action;
		}

		$scope.actionCancel = function() {
			$scope.action = '';
			$scope.reloadEvent(true); //??
		}

		$scope.actionDisable = function(action) {
			return $scope.action != action && $scope.action != '';
		}	

		$scope.actionSaved = function(item) {
			$scope.action = '';
			$scope.reloadEvent(true);
		}

		$scope.deleteEvent = function() {
			var msg = 'Er du helt sikker? Når du sletter eventen sletter du samtidig<br><br><ul>';
			msg += '<li>Kommentarer knyttet til eventen</li>';
			msg += '<li>Tilmeldinger knyttet til eventen</li>';
			msg += '<li>Bindinger til foreninger og grupper</li>';
			msg += '</ul>';
			msg += 'Endvidere vil links og delinger til denne event fremadrettet resultere i en 404, <em>Page not found</em>.<br><br>';
			msg += 'Du kunne overveje at redigere eventen og markere den som <u>aflyst</u> i stedet.';
			var params = {
				header: 'Slet event',
				message: msg,
				ok_text: 'Jeg forstår, slet event',
				modalClass: 'small-dialog-large'
			}
			ConfirmModal.show(params).then(function(answer) {
				Wait.show('Vent medens eventen slettes ...');
				ESPBA.delete('event', { id: id }).then(function() {
					ESPBA.delete('association_events', { event_id: id }).then(function() {
						ESPBA.delete('group_events', { event_id: id }).then(function() {
							ESPBA.delete('comments', { hash: $scope.event.hash }).then(function() {
								ESPBA.delete('event_user_feedback', { event_id: id }).then(function() {
									ESPBA.delete('star_rating', { hash: $scope.event.hash }).then(function() {
										ESPBA.delete('log', { hash: $scope.event.hash }).then(function() {
											$timeout(function() {
												$rootScope.$broadcast('wait.cancel')
												Redirect.dig('Eventen er blevet slettet ...');
											}, 100);
										})
									})
								})
							})
						})
					})
				})
			})
		}

});

