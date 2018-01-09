'use strict';

/**
 *
 *
 */
angular.module('indeuApp')
  .controller('ArticleForsideCtrl', function($scope, Login, $routeParams, ESPBA, Lookup, Meta, Utils, UserVisits, VisitCounter, ConfirmModal) {

		if (Login.isLoggedIn()) {
			$scope.user = Login.currentUser()
		}

		let id = $routeParams.id;

		$scope.reload = function(update) {
			ESPBA.get('article', { id: id }).then(function(r) {
				var a = r.data[0];
				a.dateStamp = moment(a.created_timestamp).calendar(); 
				a.realDate = moment(a.created_timestamp); 

				var user = Lookup.getUser(a.user_id);
				a.userFullName = user.full_name;

				var userUrlLink = '/medlemmer/'+user.id+'/'+Utils.urlName(user.full_name);
				if (Utils.isLocalHost()) userUrlLink = '#' + userUrlLink;
				a.userUrlLink = userUrlLink;

				$scope.article = a;

				if (update) {
					UserVisits.visit(a.hash);
					VisitCounter.visit(a.hash);
				}

				$scope.visitCounter = false;
				if ($scope.user && $scope.user.id == a.user_id) {
					ESPBA.get('visit_counter', { hash: a.hash }).then(function(v) {
						if (v.data && v.data.length) {
							var v = v.data[0];
							$scope.visitCounter = v.counter;
						}
					})				
				}

				//association
				ESPBA.get('association_articles', { article_id: id }).then(function(aa) {
					if (aa.data && aa.data.length>0) {
						ESPBA.get('association', { id: aa.data[0].association_id }).then(function(as) {
							$scope.association = as.data[0];
							$scope.association.url = Utils.foreningUrl(as.data[0].id, as.data[0].name)
						})
					}
				})

				//groups
				ESPBA.get('group_articles', { article_id: id }).then(function(gr) {
					gr.data.forEach(function(g) {
						var group = Lookup.getGroup(g.group_id);
						g.name = group.name;
						g.urlName = Utils.urlName(group.name);
					})
					$scope.groups = gr.data;
				});

			})
		}
		$scope.reload(true);

		//actions copy paste
		$scope.action = '';

		$scope.setAction = function(action) {
			if (action != '' && $scope.action != '' && $scope.action != action) return;
			$scope.action = action;
		}

		$scope.actionCancel = function() {
			$scope.action = '';
			$scope.reload();
		}

		$scope.actionDisable = function(action) {
			return $scope.action != action && $scope.action != '';
		}	

		$scope.actionSaved = function(item) {
			$scope.action = '';
			$scope.reload();
		}

		$scope.unpublishArticle = function() {
			ConfirmModal.show('Er du sikker på at du vil trække artiklen tilbage?').then(function(answer) {
				if (answer) {
					ESPBA.update('article', { published: 0, id: id }).then(function() {
						$scope.reload();
					})
				}
			})
		}

//
		$scope.onCommentAdded = function(e) {
			alert('ok');
			console.log(arguments);
		}


});

