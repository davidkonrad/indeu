'use strict';

angular.module('indeuApp').directive('userReactions', function($timeout, Login, Utils, Lookup, ESPBA, Settings) {

	return {
		templateUrl: "views/inc/inc.userReactions.html",
		restrict: 'A',
		transclude: true,
		scope: {},
		controller: function($scope) {
			Settings.init($scope);
		},
		replace: true,
		link: function(scope, element, attrs) {

			if (!Login.isLoggedIn()) return;
			var user_id = Login.currentUser().id;

			scope.showEmpty = function() {
				return element.find('.list-group-item').length <= 0
			}

			var reactions, reactionsAll;

			ESPBA.prepared('UserReactions', { user_id: user_id}).then(function(r) {
				var rr = r.data.sort(function(a, b){
					return new Date(b.created_timestamp).valueOf() - new Date(a.created_timestamp).valueOf()
				})
				rr.forEach(function(r) {
					r.show_name = r.full_name.length>10 ? r.first_name : r.full_name;
					r.title = r.full_name;

					r.userUrl = Utils.isLocalHost() ? '/#/' : '/';
					r.userUrl += 'medlemmer/'+r.user_id+'/'+Utils.urlName(r.full_name);

					r.url = Utils.isLocalHost() ? '/#/' : '/';
					switch (r.type) {
						case 'f' :
							r.title += ' tilmeldte sig eventen '+r.caption;
							r.url += 'event/';
							break;
						case 'e' :
							r.title += ' skrev en kommentar til '+r.caption;
							r.url+='event/';
							break;
						case 'a' :
							r.title += ' skrev en kommentar til '+r.caption;
							r.url+='artikel/';
							break;
						case 'c' :
							r.title += ' svarede på din kommentar '+r.caption;
							break;
						default:
							break;
					}
					r.url += r.id + '/' + Utils.urlName(r.caption);
				})
				reactionsAll = rr;
				reactions = rr.slice(0,5);
				scope.reactions = scope.Settings.recentReactionsShowAll ? reactionsAll : reactions;

				scope.$watch('Settings.recentReactionsShowAll', function() {
					scope.reactions = scope.Settings.recentReactionsShowAll ? reactionsAll : reactions;
				});

			})
		}
	}
});

