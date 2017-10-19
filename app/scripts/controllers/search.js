'use strict';

/**
 *
 *
 */
angular.module('indeuApp')
	.controller('SearchCtrl', function($scope, $timeout, ESPBA, Lookup, Meta, Utils, Redirect, Notification, Settings) {

		$scope.term = Redirect.message(true);

		Settings.init($scope);

		var search = function() {
			var params = { 
				term: $scope.term, 
				articles: $scope.Settings.searchWithinArticles,
				events: $scope.Settings.searchWithinEvents
			};

			ESPBA.prepared('Search', params).then(function(s) {

				s.data.map(function(r) {

					r.date_str = moment(r.created_timestamp).format('llll').capitalize();

					switch (r.type) {
						case 'a' :
							r.url = Utils.articleUrl(r.id, r.caption);
							break;
						case 'e' :
							r.url = Utils.eventUrl(r.id, r.caption);
							break;
						default: 
							r.url = 'NOT SET!';
							break;
					}	
					
					var regexp = new RegExp(params.term, 'gi');
					var text = Utils.plainText(r.content);
					var match;
					var s = '';

					while (match = regexp.exec(text)) {
						if (s !='') s+= ' ...';

						var i = (match.index-18)<0
							? 10-(match.index+18)
							: 10;

						s += text.substr(match.index-i, i);
						s += '<strong>'+match[0]+'</strong>';
						s += text.substr(regexp.lastIndex, 33);

						if (s.length>200) break;
					}
					r.content_extract = s;
				})
				$scope.results = s.data;
			})
		}
		if ($scope.term) search();

		var input = angular.element('#input');
		input.on('keydown', function(e) {
			if (e.which === 13 && this.value.length>0) {
				search()
			}
		});

		$timeout(function() {
			input.focus();
		}, 15)

});


