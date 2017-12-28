'use strict';

/**
 *
 *
 */
angular.module('indeuApp')
	.factory('ArtikelModal', function($modal, $q, ESPBA, Lookup, Utils, Login, SelectBrugerModal, SelectGruppeModal, DTOptionsBuilder, DTColumnBuilder) {

	var deferred = null;
	var modal = null;

	return {

		isShown: function() {
			return modal != null;
		},
		show: function($scope, article_id) {
			deferred = $q.defer()

			$scope.accessLevels = Lookup.accessLevels();
			$scope.visibilityLevels = Lookup.visibilityLevels();

			$scope.__artikelModal = {
				btnOk: article_id ? 'Gem og luk' : 'Opret artikel og luk',
				author_btn_caption: 'Vælg forfatter',
				group_btn_caption: 'Vælg gruppe'
			};

			$scope.edit = {};
			if (article_id) {
				ESPBA.get('article', { id: article_id }).then(function(r) {
					$scope.edit = r.data[0];
					$scope.edit.visibility_level = parseInt($scope.edit.visibility_level);
					$scope.__artikelModal.title = 'Rediger <span class="text-muted">#'+$scope.edit.id+'</span>, <strong>'+$scope.edit.header+'</strong>';

					if (parseInt($scope.edit.author_id)) {
						$scope.__artikelModal.author_btn_caption = Lookup.getUser($scope.edit.author_id).full_name
					} else {
						$scope.__artikelModal.author_btn_caption = 'Sæt artiklens bruger (forfatter)'
					}

					if ($scope.edit.reviewed_user_id) {
						$scope.__artikelModal.reviewerFullName = Lookup.getUser($scope.edit.reviewed_user_id).full_name
					}
					$scope.$watch('edit.accepted', function(newVal, oldVal) {
						if (newVal && newVal != oldVal) {
							$scope.edit.reviewed_user_id = Login.currentUser().id;
							$scope.__artikelModal.reviewerFullName = Login.currentUser().full_name;
						}
					});
				})
			} else {
				$scope.__artikelModal.title = 'Opret ny artikel';
				$scope.__artikelModal.create = true;
			}

			$scope.canSave = function() {
				return $scope.edit.user_id != undefined &&
					$scope.edit.header != undefined &&
					$scope.edit.content != undefined;
			};

			$scope.__artikelModal.selectAuthor = function() {
				SelectBrugerModal.show($scope, false, $scope.edit.author_id).then(function(author) {
					if (author) {
						$scope.edit.author_id = author[0].id;
						$scope.__artikelModal.author_btn_caption = author[0].full_name;
					}
				})
			}

/* groups */
			$scope.__artikelModal.reloadGroups = function() {
				ESPBA.get('group_articles', { article_id: article_id }).then(function(gr) {
					gr.data.forEach(function(g) {
						g.name = Lookup.getGroup(g.group_id).name;
					});
					$scope.__artikelModal.article_groups = gr.data;
				})
			}
			$scope.__artikelModal.reloadGroups();

			$scope.__artikelModal.removeGroup = function(id) {
				ESPBA.delete('group_articles', { id: id }).then(function() {
					$scope.__artikelModal.reloadGroups();
				});
			}

			$scope.__artikelModal.addGroup = function() {
				var ids = $scope.__artikelModal.article_groups.map(function(g) {
					return g.group_id
				});
				SelectGruppeModal.show($scope, false, ids).then(function(group) {
					if (group) {
						ESPBA.insert('group_articles', { article_id: article_id, group_id: group[0].id}).then(function(g) {
							$scope.__artikelModal.reloadGroups();
						});
					}
				})
			}

			modal = $modal({
				scope: $scope,
				templateUrl: 'views/admin/admin.artikel.modal.html',
				backdrop: 'static',
				show: false,
				keyboard: false
			});

			modal.$promise.then(function() {
				console.log('modal promise');
			});

			modal.$promise.then(modal.show).then(function() {
				console.log('modal show');
			});

			$scope.artikelModalClose = function(value) {

				function close() {
					modal.hide();
					modal.destroy();
					modal = null;
					delete $scope.__artikelModal;
		      deferred.resolve(value)
				}

				if (value) {
					if (article_id) {
						ESPBA.update('article', $scope.edit).then(function(r) {
							close()
						})
					} else {
						$scope.edit.hash = Utils.getHash();
						ESPBA.insert('article', $scope.edit).then(function(r) {
							close()
						})
					}
				} else {
					close()
				}
			};

			angular.element('body').on('keydown', function(e) {
				if (e.charCode == 27) $scope.gruppeModalClose(false)
			});

      return deferred.promise;
		}

	}

});
