'use strict';

angular.module('indeuApp')
	.directive('editArticle', 
	function($location, $timeout, Utils, ESPBA, Login, Log, ImageUploadModal, Notification, SelectGruppeModal, Lookup) {

	return {
		templateUrl: "views/inc/inc.editArticle.html",
		restrict: 'A',
		transclude: true,
		scope: {
			onSave: '&',
			onCancel: '&',
			userId: '@',
			groupId: '@',
			associationId: '@'
		},
		replace: true,
		controller: function($scope) {
			$scope.article = {
				visibility_level: 2,
				header: '',
				sub_header: '',
				content: '',
				image: '',
				user_id: null,
				author_id: null
			}
		},
		link: function(scope, element, attrs) {
			scope.group_id = attrs['groupId'] || false;
			scope.user_id = attrs['userId'] || false;
			scope.association_id = attrs['associationId'] || false;

			scope.article.user_id = scope.user_id;

			var user_id = attrs['userId'] || false;
			var group_id = attrs['groupId'] || false;
			var onSave = attrs['onSave'] || false;
			var onCancel = attrs['onCancel'] || false;
			var article_id = attrs['editArticle'] || false;

			if (article_id) {
				ESPBA.get('article', { id: article_id }).then(function(e) {
					scope.article = e.data[0];
					scope.article.visibility_level = parseInt(scope.article.visibility_level);
				});
			}

			scope.reloadGroups = function() {
				ESPBA.get('group_articles', { article_id: article_id }).then(function(gr) {
					gr.data.forEach(function(g) {
						g.name = Lookup.getGroup(g.group_id).name;
					});
					scope.article_groups = gr.data;
				});
			}
			scope.reloadGroups();

			scope.articleAction = {};
			scope.articleAction.caption = article_id ? 'Gem og afslut' : 'Opret og afslut';
			
			scope.articleAction.canSave = function() {
				var a = scope.article;
				return (a.header != '' && a.content != '' && a.content.length > 2)
			}

			scope.articleUploadImage = function() {
				ImageUploadModal.show(scope, 'artikel').then(function(image) {
					if (image) {
						scope.article.image = image.filename;
					}
				});
			}

			scope.articleAction.save = function() {
				if (article_id) {
					scope.article.edited_timestamp = 'CURRENT_TIMESTAMP';
					ESPBA.update('article', scope.article).then(function(a) {
						Notification.primary('Artiklen <strong>' + scope.article.header +'</strong> er opdateret');
						if (onSave) scope.onSave(a.data[0]);

						Log.log({
							type: Log.ARTICLE_EDITED,
							user_id: Login.currentUser().id,
							hash: scope.article.hash
						});

						//refresh article info
						scope.article = a.data[0];

					})
				} else {
					scope.article.user_id = scope.user_id;
					scope.article.hash = Utils.getHash();
			
					var extra_message = '';
					//we dont care about accepted or published articles if they are none public
					if (scope.article.visibility_level > 1) {
						scope.article.accepted = 1;
						scope.article.published = 1;
					} else {
						extra_message = '<br>Fordi artiklen er offentlig skal den godkendes før den bliver endeligt publiseret.';	
					}

					ESPBA.insert('article', scope.article).then(function(a) {
						if (scope.group_id) {
							ESPBA.insert('group_articles', { group_id: scope.group_id, article_id: a.data[0].id }).then(function() {
								//
							})
						}
						if (scope.association_id) {
							ESPBA.insert('association_articles', { association_id: scope.association_id, article_id: a.data[0].id }).then(function() {			
								//
							})
						}

						Log.log({
							type: Log.ARTICLE_CREATED,
							user_id: Login.currentUser().id,
							hash: a.data[0].hash
						});

						//jump to article immediately
						$timeout(function() {
							$location.path( Utils.articleUrl(a.data[0].id, a.data[0].header).replace('/#/', '') );
							$timeout(function() {							
								Notification.primary('Artiklen <strong>' + a.data[0].header +'</strong> er oprettet. '+extra_message);
							})
						})

					})
				}
			}

			scope.articleAction.cancel = function() {
				if (onCancel) scope.onCancel();
			}

/* groups */
			scope.articleAction.addGroup = function() {
				var ids = scope.article_groups.map(function(g) {
					return g.group_id
				});
				SelectGruppeModal.show(scope, false, ids).then(function(group) {
					if (group) {
						ESPBA.insert('group_articles', { article_id: article_id, group_id: group[0].id}).then(function(g) {
							scope.reloadGroups();
						});
					}
				})
			}

			scope.articleAction.removeGroup = function(id) {
				ESPBA.delete('group_articles', { id: id }).then(function() {
					scope.reloadGroups();
				});
			}
			
		}
	}
});


