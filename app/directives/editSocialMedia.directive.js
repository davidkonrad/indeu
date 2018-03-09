'use strict';

angular.module('indeuApp')
	.directive('editSocialMedia', function(Utils, ESPBA, Form, Lookup, Login) {

	return {
		templateUrl: "views/inc/inc.editSocialMedia.html",
		restrict: 'EA',
		transclude: true,
		scope: {
			hash: '@'
		},
		replace: true,
		controller: function($scope) {
			$scope.edit = {
			};

			$scope.formSave = function() {
				if ($scope.edit.id) {
					ESPBA.update('social_media', $scope.edit).then(function(a) {
						//
					})
				} else {
					ESPBA.insert('social_media', $scope.edit).then(function(a) {
						//
					})
				}
				Form.reset('#social');
			}

			$scope.formSaveEnabled = function() {
				return Form.isEdited('#social');
			}

		},

		link: function(scope, element, attrs) {

			attrs.$observe('hash', function(hash) {
				scope.edit.hash = hash;
				ESPBA.get('social_media', { hash: hash }).then(function(a) {
					if (a.data && a.data[0]) {
						scope.edit = a.data[0]
					} else {		
						scope.edit.hash = hash;
					}
				})
			})

			//add a method so changes can be saved from outside the directive
			scope.$root.__socialMediaSave = function() {
				if (scope.edit.id) {
					ESPBA.update('social_media', scope.edit).then(function(a) {
						//
					})
				} else {
					ESPBA.insert('social_media', scope.edit).then(function(a) {
						//
					})
				}
			}

		}
	}
});

