'use strict';

/**
 *
 *
 */
angular.module('indeuApp').controller('ArticleForsideCtrl', 
	function($scope, $sce, $location, $timeout, $routeParams, ESPBA, Login, Lookup, Meta, Utils, UserVisits, VisitCounter, ConfirmModal, Redirect, EditArticle) {

		if (Login.isLoggedIn()) {
			$scope.user = Login.currentUser()
		}

		const id = $routeParams.id;

		$scope.reload = function(update) {
			ESPBA.get('article', { id: id }).then(function(r) {

				if (!r.data || !r.data.length) {
					Redirect._404();
					return
				}

				var a = r.data[0];
				a.dateStamp = moment(a.created_timestamp).local().fromNow(); 
				a.realDate = moment(a.created_timestamp); 
				if (a.edited_timestamp) a.editedDateStamp = moment(a.edited_timestamp).local().fromNow(); 

				var user = Lookup.getUser(a.user_id);
				a.userFullName = user.full_name;
				a.userUrlLink = Utils.userUrl(user.id, user.full_name);

				//test image
				if (a.image) {
					var imageUrl = 'media/artikel/'+a.image;
					var img = new Image();
					img.onload = function() {
						a.imageUrl = imageUrl;
						var imageHeight = img.height;
						var imageWidth = img.width;
						Meta.setOpenGraph(null, null, null, imageUrl, imageWidth, imageHeight);
					}
					img.src = imageUrl;
				}
				$scope.article = a;

				//meta
				var desc = a.sub_header || Utils.plainText(a.content, 170);
				Meta.setTitle(a.header);
				Meta.setDesc(desc);
				Meta.setOpenGraph(window.location, a.header, desc);
	
				//update visitor count
				if (!update) {
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
			$scope.reload(false);
		})

		//actions copy paste
		$scope.action = '';

		$scope.setAction = function(action) {
			if (action != '' && $scope.action != '' && $scope.action != action) return;
			$scope.action = action;
		}

		$scope.actionCancel = function() {
			$scope.action = '';
			$scope.reload(true);
		}

		$scope.actionDisable = function(action) {
			return $scope.action != action && $scope.action != '';
		}	

		$scope.actionSaved = function(item) {
			$scope.action = '';
			$scope.reload(true);
		}

		$scope.unpublishArticle = function() {
			var params = {
				message: 'Er du sikker på at du vil trække artiklen tilbage?'
			}
			ConfirmModal.show(params).then(function(answer) {
				if (answer) {
					ESPBA.update('article', { published: 0, id: id }).then(function() {
						$scope.reload(true);
					})
				}
			})
		}


/* new interface */
		$scope.editArticle = function(article_id) {
			var article_info = {};
			if (article_id) {
				article_info.article_id = article_id
			} 
			EditArticle.show(article_info).then(function(r) {
				if (r) {
					if (article_id) {
						$timeout(function() {
							$scope.reload()
						}, 500);
					} else {
						//we asssume r hold the inserted article info
						$timeout(function() {
							var urlName = Utils.urlName(r.header);
							$location.path('/artikel/'+r.id+'/'+urlName);
						}, 500);
					}
				}
			})
		}


});

