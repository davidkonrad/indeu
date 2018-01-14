'use strict';

/**
 *
 *
 */
angular.module('indeuApp')
  .controller('GruppeForsideCtrl', 
	function($scope, Login, $route, $routeParams, Const, ESPBA, Lookup, Meta, Utils, Log, Notification, ConfirmModal) {

		let id = $routeParams.id;

		if (Login.isLoggedIn()) {
			$scope.user = Login.currentUser()
		};

		$scope.action = '';
		$scope.setAction = function(action) {
			$scope.action = action
		}

		$scope.actionDisable = function(action) {
			return $scope.action != action && $scope.action != '';
		}	

		$scope.editEvent = function(event_id) {
			$scope.edit_event_id = event_id;
			$scope.setAction('e');
		}

		function getAccessStatus(status) {
			switch (parseInt(status)) {
				case Const.ACCESS_LEVEL_PUBLIC :
					return 'Gruppens indhold kan tilgåes af alle. ';	
					break;
				case Const.ACCESS_LEVEL_USERS :
					return 'Gruppens indhold kan kun tilgåes af brugere der er logget ind. ';	
					break;
				default : 
					return 'Gruppen er lukket, indhold kan kun tilgåes af medlemmer. ';	
					break;
			}
		}

		function getVisibilityStatus(status) {
			switch (parseInt(status)) {
				case Const.VISIBILITY_LEVEL_PUBLIC :
					return 'Gruppen er synlig for alle. ';	
					break;
				case Const.VISIBILITY_LEVEL_USERS :
					return 'Gruppen er kun synlig for brugere der er logget ind. ';	
					break;
				default : 
					return 'Gruppen er kun synlig for gruppens medlemmer. ';	
					break;
			}
		}

		$scope.btn_follow_caption = 'Følg gruppe';

		function reloadGroup() {
			ESPBA.get('group', { id: id }).then(function(r) {
				$scope.group = r.data[0];

				$scope.group.visible_members = $scope.group.visible_members == 1 ? true : false;
				$scope.group.visible_social = $scope.group.visible_social == 1 ? true : false;
				$scope.group.events_enabled = $scope.group.events_enabled == 1 ? true : false;
				$scope.group.articles_enabled = $scope.group.articles_enabled == 1 ? true : false;
				$scope.group.comments_enabled = $scope.group.comments_enabled == 1 ? true : false;

				$scope.group.access_status = getAccessStatus($scope.group.access_level);
				$scope.group.visibility_status = getVisibilityStatus($scope.group.visibility_level);

				if (Login.isLoggedIn()) {
					$scope.userIsOwner = Login.currentUser().id == $scope.group.owner_id;
					$scope.userIsMember = Login.isGroupMember(id);

					var owner = Lookup.getUser($scope.group.owner_id);
					$scope.owner = {
						full_name: owner.full_name,
						url: Utils.userUrl(owner.id, owner.full_name)
					}

					if (!$scope.userIsMember) {
						ESPBA.get('group_request', { group_id: $scope.group.id, user_id: $scope.user.id }).then(function(r) {
							if (r.data.length) $scope.btn_follow_caption = 'Afventer ...'
						})
					}
				} else {
					if ($scope.group.visibility_level != Const.VISIBILITY_LEVEL_PUBLIC) {
						Utils.refreshPage('/');
					}
				}
			})

			ESPBA.prepared('ArticlesByGroupFull', { group_id: id }).then(function(g) {
				$scope.articles = {
					articles: g.data,
					orderBy: ''
				}
			})

		}
		reloadGroup();

		$scope.followRequest = function() {
			if ($scope.group.visibility_level == 3) {
				ESPBA.insert('group_request', { group_id: $scope.group.id, user_id: $scope.user.id }).then(function() {
					$scope.btn_follow_caption = 'Afventer ...'
					Notification('Anmodning om at følge gruppen afsendt');
					Log.log({
						type: Log.GROUP_MEMBER_REQUEST,
						user_id: $scope.user.id,
						hash: $scope.group.hash
					})
				})
			} else {
				ESPBA.insert('group_user', { group_id: $scope.group.id, user_id: $scope.user.id }).then(function() {
					$scope.userIsMember = true;
					Notification('Du følger nu <strong>' + $scope.group.name + '</strong>');
					Log.log({
						type: Log.GROUP_MEMBER_ADDED,
						user_id: $scope.user.id,
						context_user_id: $scope.user.id,
						hash: $scope.group.hash
					})
					reloadMembers();
				})
			}
		}

		$scope.unFollow = function() {
			ConfirmModal.show('Er du sikker på du ikke længere vil følge <strong>'+$scope.group.name+'</strong>?').then(function(answer) {
				if (answer) {
					ESPBA.get('group_user', { group_id: $scope.group.id, user_id: $scope.user.id }).then(function(gu) {
						var id = gu.data[0].id;
						ESPBA.delete('group_user', { id: id }).then(function() {
							Notification.primary('Du følger nu ikke længere <strong>' + $scope.group.name + '</strong>');
							$scope.userIsMember = false;
							Log.log({
								type: Log.GROUP_MEMBER_REMOVED,
								user_id: $scope.user.id,
								context_user_id: $scope.user.id,
								hash: $scope.group.hash
							})
							reloadMembers();
						})
					})
				}
			})
		}


/*
		$scope.loadEvents = function() {
			ESPBA.get('group_events', { group_id: id }).then(function(r) {
				var events = [];
				r.data.forEach(function(e) {
					ESPBA.get('event', { id: e.event_id }).then(function(event) {
						var t = event.data[0];
						t.urlName = Utils.urlName(t.name);
						t.from = Utils.removeSecs(t.from);
						t.to = t.to !== '00:00:00' ? Utils.removeSecs(t.to) : '?';
						t.dateInt = new Date(t.date+' '+t.from).valueOf();
						events.push(t);
					})
				})
				$timeout(function() {
					$scope.events = events;
				})
			});
		}
		$scope.loadEvents();
*/

		$scope.onGroupSave = function() {
			$scope.setAction('');
			$route.reload();
		}

		$scope.onEventSave = function() {
			$scope.setAction('');
			$scope.edit_event_id = undefined;
		}

		$scope.onArticleSave = function() {
			console.log('save!!!');
			$scope.setAction('');
			$route.reload();
			/*
			reloadGroup();
			reloadMembers();
			$timeout(function() {
				$scope.$apply()
			})
			*/			
		}

		$scope.onActionCancel = function() {
			$scope.setAction('');
			$scope.edit_event_id = undefined;
		}

		function reloadMembers() {		
			ESPBA.get('group_user', { group_id: id }).then(function(r) {
				$scope.group_users = [];
				r.data.forEach(function(e) {
					var user = Lookup.getUser(e.user_id);
					user.url = Utils.userUrl(user.id, user.full_name);
					$scope.group_users.push(user);
				})
			});
		}
		reloadMembers();


});

