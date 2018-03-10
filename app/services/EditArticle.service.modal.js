'use strict';

/**
 article_info 
 -------------
 {
	article_id //or
	association: {
		id: 
		name:
	} //or
	group: {
		id:
		name:
	}
} 
 */
angular.module('indeuApp').factory('EditArticle', function($modal, $q) {

	var deferred;
	var local = this;

	local.modalInstance = ['$scope', '$timeout', 'Notification', 'ESPBA', 'SelectGruppeModal', 'SelectForeningModal', 'Utils', 'Login', 'article_info', 
		function($scope, $timeout, Notification, ESPBA, SelectGruppeModal, SelectForeningModal, Utils, Login, article_info) {
		$scope.header = !article_id ? 'Ny artikel' : 'Rediger artikel';
		$scope.ok_btn = !article_id ? 'Opret og luk' : 'Gem og luk';

		var article_id = article_info.article_id || undefined;

		$scope.edit = {};
		$scope.groups = [];
		$scope.forening = undefined;

		var checkStr, groupChanged, foreningChanged;
		function updateCheck() {
			checkStr = JSON.stringify($scope.edit);
			groupChanged = false;
			foreningChanged = false;
		}

		if (article_id) {
			ESPBA.get('article', { id: article_id }).then(function(r) {
				$scope.edit = r.data[0];
				Utils.debugObj($scope.edit);
				updateCheck()
			})
			ESPBA.prepared('ArticleGroups', { article_id: article_id }).then(function(r) {
				$scope.groups = r.data;
			})
			ESPBA.prepared('ArticleAssociation', { article_id: article_id }).then(function(r) {
				if (r.data && r.data.length) $scope.forening = r.data[0]
			})
		} else {
			$scope.edit.user_id = Login.currentUser().id;
			$scope.edit.header = '';
			$scope.edit.sub_header = '';
			$scope.edit.content = '';
			$scope.edit.allow_comments = 1;
			$scope.edit.visibility_level = 2;

			if (article_info.group) {
				$scope.groups.push({ 
					group_id: article_info.group.id,
					group_name: article_info.group.name
				})
			}

			if (article_info.association) {
				$scope.forening = {
					id: article_info.association.id,
					name: article_info.association.name
				}
			}

		}

		$scope.canSave = function() {
			return typeof $scope.edit.visibility_level == 'number' &&
				$scope.edit.header.length > 5 &&
				$scope.edit.content.length > 5
		}

		$scope.canUpdate = function() {
			return $scope.edit.id && $scope.hasChanged()
		}

		$scope.hasChanged = function() {
			return (JSON.stringify($scope.edit) != checkStr) || groupChanged || foreningChanged
		}

		$scope.update = function() {
			$scope.edit.edited_timestamp = 'CURRENT_TIMESTAMP';
			ESPBA.update('article', $scope.edit).then(function() {
				Notification('Ændringer i "<strong>'+$scope.edit.header+'</strong>" er gemt');
				if (groupChanged) saveGroups();
				if (foreningChanged) saveForening();
				updateCheck();
			})
		}

		$scope.save = function() {
			if (!$scope.edit.hash) {
				$scope.edit.hash = Utils.getHash();
				ESPBA.insert('article', $scope.edit).then(function(r) {
					$scope.edit = r.data[0];
					Notification('Artiklen "<strong>'+$scope.edit.header+'</strong>" er blevet oprettet');
					saveGroups();
					saveForening();
					updateCheck();
				})
			} else {
				$scope.update();
			}
		}
			
/* groups */
		$scope.addGroup = function() {
			var ids = $scope.groups.map(function(g) {
				return g.group_id
			})
			SelectGruppeModal.show($scope, false, ids).then(function(g) {
				if (g) {
					$scope.groups.push({
						group_id: g[0].id,
						group_name: g[0].name
					})
					groupChanged = true
				}
			})
		}

		$scope.removeGroup = function(group_id) {
			$scope.groups = $scope.groups.filter(function(g) {
				if (g.group_id != group_id) return g
			})
			groupChanged = true
		}

		function saveGroups() {
			ESPBA.delete('group_articles', { article_id: $scope.edit.id }).then(function() {
				$scope.groups.forEach(function(g) {
					ESPBA.insert('group_articles', { article_id: $scope.edit.id, group_id: g.group_id })
				})
			})
		}


/* forening */
		$scope.selectForening = function() {
			SelectForeningModal.show().then(function(f) {
				if (f) {
					$scope.forening = f[0];
					foreningChanged = true;
				}
			})
		}

		function saveForening() {
			ESPBA.delete('association_articles', { article_id: $scope.edit.id }).then(function() {
				if ($scope.forening) {
					ESPBA.insert('association_articles', { article_id: $scope.edit.id, association_id: $scope.forening.id })
				}
			})
		}
	

/* close */
		$scope.closeModal = function(value){
			$scope.$hide();
			deferred.resolve(value)
		}
	}];

	return {
		show: function(article_info) {
			deferred = $q.defer();

			var modal = $modal({
				templateUrl: 'views/EditArticle.service.modal.html',
				controller: local.modalInstance,
				backdrop: 'static',
				keyboard: false,
				locals: { article_info: article_info }
			});

      return deferred.promise;
		}
	}
});


