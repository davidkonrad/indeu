'use strict';

/**
 *
 *
 */
angular.module('indeuApp').factory('StaticPageModal', function($modal, $q) {

	var modal;
	var deferred;
	var local = this;

	local.modalInstance = ['$scope', 'ESPBA', 'AdminRights', 'Login', 'Utils', 'static_page_id', 
	function($scope, ESPBA, AdminRights, Login, Utils, static_page_id) {
		
		$scope.updateRights = AdminRights.static_pageEdit();
		$scope.title = !static_page_id  ? 'Opret ny statisk side' : 'Rediger statisk side';
		$scope.btnSave = !static_page_id ? 'Opret og luk' : 'Gem og luk';

		$scope.closeModal = function(value) {
			$scope.$hide();					
			deferred.resolve(value);
		}

		$scope.save = function() {
			if (static_page_id) {
				$scope.edit.edited_timestamp = 'CURRENT_TIMESTAMP';
				ESPBA.update('static_page', $scope.edit).then(function() {
					$scope.closeModal(true)
				})
			} else {
				$scope.edit.hash = Utils.getHash();				
				ESPBA.insert('static_page', $scope.edit).then(function(s) {
					$scope.closeModal(true)
				})
			}
		}

		$scope.canSave = function() {
			return $scope.updateRights &&
				$scope.edit && 
				$scope.edit.header &&
				$scope.edit.header.length > 1 && 
				$scope.edit.content.length > 1
		}

		$scope.edit = {
			hash: '',
			header: '',
			content: '',
			user_id: Login.currentUser().id
		}

		if (static_page_id) {
			ESPBA.get('static_page', { id: static_page_id }).then(function(s) {
				$scope.edit = s.data[0]
			})
		} 
		
	}];

	return {

		show: function(static_page_id) {
			deferred = $q.defer()

			modal = $modal({
				controller: local.modalInstance,
				templateUrl: 'views/admin/admin.staticpage.modal.html',
				backdrop: 'static',
				show: true,
				keyboard: false,
				locals: {
					static_page_id: static_page_id
				}
			});

      return deferred.promise;
		}

	}

});
