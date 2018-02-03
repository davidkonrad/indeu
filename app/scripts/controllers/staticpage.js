'use strict';

/**
 *
 *
 */
angular.module('indeuApp')
  .controller('StaticPageCtrl', function($scope, Login, $routeParams, ESPBA, Lookup, Meta, Utils, UserVisits, VisitCounter, ConfirmModal) {

		if (Login.isLoggedIn()) {
			$scope.user = Login.currentUser()
		}

		const id = $routeParams.id;

		$scope.reload = function(update) {
			ESPBA.get('static_page', { id: id }).then(function(r) {
				var a = r.data[0];
				a.dateStamp = moment(a.created_timestamp).fromNow(); 
				a.realDate = moment(a.created_timestamp); 
				if (a.edited_timestamp) a.editedDateStamp = moment(a.edited_timestamp).fromNow(); 

				var user = Lookup.getUser(a.user_id);
				a.userFullName = user.full_name;
				a.userUrlLink = Utils.userUrl(user.id, user.full_name);

				//test image
				if (a.image) {
					var imageUrl = 'media/artikel/'+a.image;
					var img = new Image();
					img.onload = function() {
						a.imageUrl = imageUrl;
						console.log(img.width, img.height);
					}
					img.src = imageUrl;
				}
				$scope.page = a;

				if (update) {
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

			})
		}
		Lookup.init().then(function() {
			$scope.reload(true);
		})

//
		$scope.onCommentAdded = function(e) {
			console.log(arguments);
		}


});

