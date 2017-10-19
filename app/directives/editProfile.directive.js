'use strict';

angular.module('indeuApp')
	.directive('editProfile', function(Utils, ESPBA, Lookup, Form, ImageUploadModal, Notification, Const, Log, Login) {

	return {
		templateUrl: "views/inc/inc.editProfile.html",
		restrict: 'A',
		transclude: true,
		scope: {
			editProfile: '@',
			onSave: '&',
			onCancel: '&'
		},
		replace: true,

		controller: function($scope) {
			$scope.changed = false;

			$('body').on('click', '.panel-heading', function() {
				var $this = $(this);
				var $i = $(this).find('i');
				var _in = $this.parent().find('.in').length;
				//fa-minus-square-o fa-plus-square-o
				if (_in) {
					$i.removeClass('fa-plus').removeClass('fa-minus').addClass('fa-plus')
				} else {
					$i.removeClass('fa-plus').removeClass('fa-minus').addClass('fa-minus')
				}
			});

			$scope.formSaveEnabled = function(formId) {
				return Form.isEdited(formId)
			}

			$scope.saveEnabled = function() {
				return $scope.changed
			}

			$scope.formSave = function(formId) {
				/*
				var obj = Form.toObj(formId);
				ESPBA.update('user', $scope.edit).then(function(x) {
					Form.reset(formId);
				})
				*/
				ESPBA.update('user', $scope.edit).then(function(x) {
					Form.reset(formId);
					$scope.changed = false;
				})
			}
			
			$scope.adresseSelect = function(item) {
				$scope.edit.postal_code = item.postCodeIdentifier;
				$scope.edit.city = item.districtName;
			}

			$scope.changeImage = function() {
				var options = {
					target: 'medlem',
					title: 'Skift profil billede',
					btnOk: 'Ok',
					btnCancel: 'Fortryd',
					currentImage: $scope.edit.image ? '../media/medlem/'+$scope.edit.image : null
				};
				ImageUploadModal.show($scope, options).then(function(image) {
					if (image) {
						$scope.edit.image = image.filename;
						$scope.changed = true;
					}
				});
			}

		},


		link: function(scope, element, attrs) {

			var onSave = attrs['onSave'] || false;
			var onCancel = attrs['onCancel'] || false;
			
			attrs.$observe('editProfile', function(newVal) {
				scope.user_id = attrs['editProfile'];
				ESPBA.get('user', { id: scope.user_id }).then(function(u) {
					//test for errors
					scope.edit = u.data[0];

					scope.$watch('edit.about', function(newVal, oldVal) {
						if (newVal && newVal != oldVal) scope.changed = true
					}, true);
				
					$('.panel-collapse:not(".in")').collapse('show');
				})
			});

			scope.doSaveClose = function() {
				ESPBA.update('user', scope.edit).then(function(x) {
					Notification('Profil opdateret ...');
					if (onSave) scope.onSave();
					Log.log({
						type: Log.USER_PROFILE_EDITED,
						user_id: Login.currentUser().id
					});
				})
			}

			scope.doCancel = function() {
				if (onCancel) scope.onCancel();
			}
					
		}
	}
});


