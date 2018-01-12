'use strict';

angular.module('indeuApp')
	.directive('editAddress', function(Utils, ESPBA, Lookup, Form, KR, Notification, Const, Log) {

	return {
		templateUrl: "views/inc/inc.editAddress.html",
		restrict: 'EA',
		transclude: true,
		scope: {
			hash: '@',
			userId: '@',
		},
		replace: true,
		controller: function($scope) {
			$scope.edit = {
			};

			$scope.formSave = function() {
				if ($scope.edit.id) {
					ESPBA.update('address', $scope.edit).then(function(a) {
						//
					})
				} else {
					ESPBA.insert('address', $scope.edit).then(function(a) {
						//
					})
				}
				Form.reset('#address');
			}

			$scope.formSaveEnabled = function() {
				return Form.isEdited('#address');
			}

			$scope.addressSelect = function(item) {
				//console.log(item);
				$scope.edit.postal_code = item.postCodeIdentifier;
				$scope.edit.city = item.districtName;
				$scope.edit.lat = item.y || item.yMin;
				$scope.edit.lng = item.x || item.xMin;
				$scope.edit.municipality = item.municipalityName;
				$scope.edit.country = 'Danmark';
				if (item.municipalityCode) {
					$scope.edit.region = KR.regionByKommuneNr(item.municipalityCode);
				}
				$scope.$apply();
			}


		},

		link: function(scope, element, attrs) {
			scope.user_id = attrs['userId'] || false;

			attrs.$observe('hash', function(hash) {
				scope.edit.hash = hash;
				ESPBA.get('address', { hash: hash }).then(function(a) {
					if (a.data && a.data[0]) {
						scope.edit = a.data[0]
					} else {		
						scope.edit.hash = hash;
					}
				})
			})

			//add a method so changes can be saved from outside the directive
			scope.$root.__addressSave = function() {
				if (scope.edit.id) {
					ESPBA.update('address', scope.edit).then(function(a) {
						//
					})
				} else {
					ESPBA.insert('address', scope.edit).then(function(a) {
						//
					})
				}
			}

		}
	}
});


