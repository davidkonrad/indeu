'use strict';

/**
 *
 *
 */
angular.module('indeuApp').factory('BrugerRequestModal', function($modal, $q) {

	var modal;
	var deferred;
	var local = this;

	local.modalInstance = ['$scope', '$timeout', 'ESPBA', 'Notification', 'Log', 'Login', 'AdminRights', 'ConfirmModal', 'Email', 'request_id', 
	function($scope, $timeout, ESPBA, Notification, Log, Login, AdminRights, ConfirmModal, Email, request_id) {

		$scope.adminRights = AdminRights.dictionary();

		$scope.modalClose = function(value) {
			function close() {
				modal.hide();
				modal.destroy();
				modal = null;
	      deferred.resolve(value)
			}
			close()
		};

		$scope.data = {};
		if (request_id) {
			ESPBA.get('user_request', { id: request_id }).then(function(r) {
				$scope.mayAccept = $scope.adminRights.user_requestAccept;
				$scope.mayRemove = $scope.adminRights.user_requestRemove;
				$scope.data = r.data[0];
			})
		} else {
			$scope.modalClose()
		}

		$scope.resendConfirmEmail = function() {
			var confirm = 'Gensend email-bekræftelses email? ';
			confirm += 'OBS: Bør kun benyttes hvis brugeren har anmodet om ændret email-adresse, ';
			confirm += 'eller ved en fejl ikke har modtaget den oprindelige automail efter brugeroprettelsen';
			var params = {
				message: confirm
			}
			ConfirmModal.show(params, 'Gensend bekræftelses-email?').then(function(answer) {
				if (answer) {
					Email.requestConfirmation($scope.data.email, $scope.data.full_name, $scope.data.hash);
					Log.log({
						type: Log.USER_EMAIL_CONFIRMATION_SENT,
						user_id: Login.currentUser().id,
						hash: $scope.data.hash
					});
					$scope.modalClose(true);
				}
			})
		}

		$scope.confirmUser = function() {
			var params = {
				header: 'Opret bruger',
				message: 'Opret bruger og send bekræftelsesemail?'
			}
			ConfirmModal.show(params).then(function(answer) {
				if (answer) {
					var user = {
						hash: $scope.data.hash,
						password: $scope.data.hash,
						accepted: 1,
						email: $scope.data.email,
						first_name: $scope.data.first_name,
						last_name: $scope.data.last_name,
						full_name: $scope.data.full_name
					}
					var address = {
						hash: $scope.data.hash,
						address: $scope.data.address,
						city: $scope.data.city,
						postal_code: $scope.data.postal_code,
						region: $scope.data.region,
						municipality: $scope.data.municipality,
						lat: $scope.data.lat,
						lng: $scope.data.lng
					}
					ESPBA.delete('user_request', { id: request_id }).then(function() {				
						ESPBA.insert('user', user).then(function() {
							ESPBA.insert('address', address).then(function() {
								$scope.modalClose(true);
								Notification('Bruger <strong>'+$scope.data.full_name+'</strong> er oprettet!');
								Email.requestAccepted(user.email, user.full_name, user.hash);
								Log.log({
									type: Log.USER_MEMBER_ACCEPTED,
									user_id: Login.currentUser().id,
									hash: $scope.data.hash
								});
							})
						})
					})
				}
			})
		}

		$scope.removeUser = function() {
			var params = {
				message: 'Slet brugeranmodning?'
			}
			ConfirmModal.show(params).then(function(answer) {
				if (answer) {
					ESPBA.delete('user_request', { id: request_id }).then(function() {
						$scope.modalClose(true)
					})
				}
			})
		}

	}];

	return {

		show: function(request_id) {
			deferred = $q.defer()

			modal = $modal({
				templateUrl: 'views/admin/admin.brugerrequest.modal.html',
				backdrop: 'static',
				show: true,
				keyboard: false,
				controller: local.modalInstance,
				locals: { request_id: request_id }
			});

			angular.element('body').on('keydown', function(e) {
				if (e.charCode == 27) $scope.brugerModalClose(false)
			});

      return deferred.promise;
		}

	}

});

