'use strict';

/**
 *
 *
 */
angular.module('indeuApp').factory('StaticPageModal', function($modal, $q) {

	var modal;
	var deferred;
	var local = this;

	local.modalInstance = ['$scope', 'ESPBA', 'Login', 'Utils', 'static_page_id', function($scope, ESPBA, Login, Utils, static_page_id) {
		
		$scope.title = 'Opret ny statisk side';
		$scope.btnSave = 'Opret og luk';

		$scope.closeModal = function(value) {
			$scope.$hide();					
			deferred.resolve(value);
		}

		$scope.save = function() {
			if (static_page_id) {
				$scope.edited_timestamp = 'CURRENT_TIMESTAMP';
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
			//console.log($scope.edit)
			return $scope.edit && 
			$scope.edit.header &&
			$scope.edit.header.length > 1 && 
			$scope.edit.content.length > 1
		}

		if (static_page_id) {
			ESPBA.get('static_page', { id: static_page_id }).then(function(s) {
				$scope.edit = s.data[0]
			})
		} else {
			$scope.edit = {
				header: '',
				content: '',
				user_id: Login.currentUser().id
			}
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
