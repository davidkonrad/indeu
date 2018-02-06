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

		const id = $routeParams.id;

		$scope.reload = function(update) {
			ESPBA.get('article', { id: id }).then(function(r) {
				var a = r.data[0];
				a.dateStamp = moment(a.created_timestamp).fromNow(); 
				a.realDate = moment(a.created_timestamp); 
				if (a.edited_timestamp) a.editedDateStamp = moment(a.edited_timestamp).fromNow(); 

				var user = Lookup.getUser(a.user_id);
				a.userFullName = user.full_name;
				a.userUrlLink = Utils.userUrl(user.id, user.full_name);

				//test image
				if (a.image) {
					var imageUrl = 'media/artikel/'+a.image;
					var img = new Image();
					img.onload = function() {
						a.imageUrl = imageUrl;
						//console.log(img.width, img.height);
					}
					img.src = imageUrl;
				}
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
							$scope.visitCounter += v.counter == 1 ? ' gang' : ' gange';
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

				//get groups associated with the article
				ESPBA.prepared('ArticleGroups', { article_id: id }).then(function(gr) {
					gr.data.forEach(function(g) {
						g.url = Utils.gruppeUrl(g.group_id, g.group_name);
					})
					$scope.groups = gr.data;
				});

				//popular articles from same user
				ESPBA.prepared('ArticlesByUser', { user_id: $scope.article.user_id, scope: 'stars', limit: 6 }).then(function(a) {
					if (a.data && a.data.length > 1) {
						$scope.author_popular_articles = a.data.filter(function(item) {
							item.url = Utils.articleUrl(item.id, item.header);
							item.title = 'Vurdering '+parseFloat(item.stars).toFixed(1)+' af '+item.votes;
							item.title += (item.votes == 1) ? ' bedømmelse' : ' bedømmelser';
							if (item.id != $scope.article.id) return item
						})
					}
				});


			})
		}
		Lookup.init().then(function() {
			$scope.reload(true);
		})

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
			//alert('ok');
			console.log(arguments);
		}


});

