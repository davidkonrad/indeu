'use strict';

/**
 *
 *
 */
angular.module('indeuApp').controller('GruppeForsideCtrl', 
	function($scope, Login, $route, $routeParams, $timeout, Const, ESPBA, Lookup, Meta, Utils, Log, Notification, ConfirmModal, Redirect, EditArticle) {

		const id = $routeParams.id;

		if (Login.isLoggedIn()) {
			$scope.user = Login.currentUser()
		};

		//sort
		$scope.limitToItems = Const.articleLimitToItems;
		$scope.articleOrderByItems = Const.articleOrderByItems;
		$scope.eventOrderByItems = Const.eventOrderByItems;

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
			ESPBA.prepared('GroupWithOwner', { group_id: id }).then(function(r) {

				if (!r.data || !r.data.length) {
					Redirect._404();
					return
				}

				$scope.group = r.data[0];

				Meta.setTitle($scope.group.name);
				Meta.setDescription($scope.group.about);

				$scope.group.visible_members = $scope.group.visible_members == 1 ? true : false;
				$scope.group.visible_social = $scope.group.visible_social == 1 ? true : false;
				$scope.group.events_enabled = $scope.group.events_enabled == 1 ? true : false;
				$scope.group.articles_enabled = $scope.group.articles_enabled == 1 ? true : false;
				$scope.group.comments_enabled = $scope.group.comments_enabled == 1 ? true : false;

				$scope.group.access_status = getAccessStatus($scope.group.access_level);
				$scope.group.visibility_status = getVisibilityStatus($scope.group.visibility_level);

				$scope.group.owner_url = Utils.userUrl($scope.group.owner_id, $scope.group.owner_full_name);

				if ($scope.group.image) {
					$scope.group.image_url = '../media/gruppe/'+$scope.group.image;
					$scope.group.thumb_url = '../media/gruppe/thumbs/'+$scope.group.image;
				}

				if (Login.isLoggedIn()) {
					$scope.userIsOwner = Login.currentUser().id == $scope.group.owner_id;
					$scope.userIsMember = Login.isGroupMember(id);

					if (!$scope.userIsMember) {
						ESPBA.get('group_request', { group_id: $scope.group.id, user_id: $scope.user.id }).then(function(r) {
							if (r.data.length) $scope.btn_follow_caption = 'Afventer ...'
						})
					}
				} else {
					if ($scope.group.visibility_level != Const.VISIBILITY_LEVEL_PUBLIC) {
						Redirect.home('Du har ikke adgang til at frekventere denne gruppe');
					}
				}
			})
			loadArticles();
			reloadEvents();

		}
		reloadGroup();

		function loadArticles() {
			ESPBA.prepared('ArticlesByGroupFull', { group_id: id }).then(function(a) {
				//sanitize
				a.data.forEach(function(item) {
					item.stars = parseFloat(item.stars, 10) || 0;
					item.counter = parseInt(item.counter, 10) || 0;
				})
				$scope.articles = {
					articles: a.data,
					orderBy: $scope.articleOrderByItems[0].id,
					limitTo: $scope.limitToItems[0].id
				}
			})
		}

		function reloadEvents() {
			ESPBA.prepared('EventsByGroup', { group_id: id }).then(function(g) {
				//sanitize
				var f = g.data.filter(function(item) {
					item.feedback1 = parseInt(item.feedback1, 10) || 0;
					item.feedback2 = parseInt(item.feedback2, 10) || 0;
					if (item.name) return item //prepared statement can return null if empty
				})
				$scope.events = {
					events: f,
					orderBy: $scope.eventOrderByItems[0].id,
					limitTo: $scope.limitToItems[0].id
				}
			})
		}				

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
			var params = {
				message: 'Er du sikker på du ikke længere vil følge <strong>'+$scope.group.name+'</strong>?'
			}
			ConfirmModal.show(params).then(function(answer) {
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

		$scope.onGroupSave = function() {
			$scope.setAction('');
			$route.reload();
		}

		$scope.onEventSave = function() {
			reloadEvents();
			$scope.setAction('');
			$scope.edit_event_id = undefined;
		}

		$scope.onActionCancel = function() {
			$scope.setAction('');
			$scope.edit_event_id = undefined;
		}


		function reloadMembers() {		
			ESPBA.prepared('GroupMembers', { group_id: id }).then(function(r) {
				r.data.forEach(function(user) {
					user.url = Utils.userUrl(user.id, user.full_name);
				})
				$scope.group_users = r.data
			});
		}
		reloadMembers();


/* new interface */
		$scope.editArticle = function(article_id) {
			var article_info = {};
			if (article_id) {
				article_info.article_id = article_id
			} else {
				article_info.group = {
					id: $scope.group.id,
					name: $scope.group.name
				}
			}
			EditArticle.show(article_info).then(function(r) {
				if (r) {
					$timeout(function() {
						loadArticles();
					}, 500)
				}
			})
		}


});

