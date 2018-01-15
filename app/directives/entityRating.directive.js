'use strict';

angular.module('indeuApp')
	.directive('entityRating', function($timeout, $compile, Utils, Login, ESPBA, Lookup, Log) {

	return {
		templateUrl: "views/inc/inc.entityRating.html",
		restrict: 'EA',
		replace: true,
		scope: {
			hash: '@',
			userId: '@',
			isSelf: '='
		},
		link: function(scope, element, attrs) {
			scope.user = {
				id: undefined,
				rating: undefined,
				readonly: true
			};

			scope.canSaveRating = function() {
				return scope.user && scope.user.rating>0
			}

			function reloadRating() {
				ESPBA.prepared('GetStarRating', { user_id: scope.userId, hash: scope.hash}).then(function(r) {
					var d = r.data.length ? r.data[0] : false;
					if (d) {
						if (d.rating) {
							delete scope.user;
						} else {
							scope.user.id = scope.userId;
							scope.user.rating = 0;
							scope.user.readonly = false;
						}
						if (d.counter>0) {
							var title = 'Samlet vurdering ' + Utils.ratingStr(d.average) + ' givet af '+d.counter;
							title += d.counter == 1 ? ' bruger. ' : ' brugere. ';
							if (d.user_id) {
								title += 'Du gav karakteren '+ Utils.ratingStr(d.rating)+' ';
								title += 'for '+moment(d.created_timestamp).fromNow(); 
							}
						} else {
							var title = 'Ingen har vurderet dette endnu';
						}							
						scope.total = {
							average: d.average,
							title: title
						}
					}
				})
			}

			scope.saveRating = function() {
				ESPBA.insert('user_stars', { hash: scope.hash, user_id: scope.user.id, rating: scope.user.rating }).then(function() {
					$('.btn-ngrateit').hide();
					scope.user.readonly = true;
					ESPBA.prepared('UpdateStarRating', { hash: scope.hash}).then(function(r) {
						reloadRating()
					});
					Log.log({
						type: Log.USER_ENTITY_RATING,
						user_id: scope.user.id,
						hash: scope.hash
					});
				})
			}

			attrs.$observe('hash', function() {
				if (scope.userId) {
					scope.user.id = scope.userId;
					scope.user.rating = 0;
					scope.user.readonly = false;
				}
				if (scope.hash) {
					reloadRating()
				}
			})
		}

	}
});


