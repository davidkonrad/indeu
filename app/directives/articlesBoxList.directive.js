'use strict';

/*
	render out a raw list of articles as a series of boxes
	intended to be used by forside, gruppe, forening, medlem
	rely on article.css
*/
angular.module('indeuApp')
	.directive('articlesBoxList', function(Utils) {

	return {
		templateUrl: "views/inc/inc.articlesBoxList.html",
		restrict: 'E',
		scope: {
			articles: '@'
		},
		link: function(scope, element, attrs) {

			scope.getBackgroundStyle = function(image) {
				if (image) {
					return {
						'background-image':'url(' + image + ')',
						'background-size': 'cover'
			    }
				}	 else {
					return {
						'background':'gray'
			    }
				}
			}

			attrs.$observe('articles', function(newVal) {
				if (!newVal) return;
				var articles = JSON.parse(newVal);
				articles.forEach(function(item) {
					item.url = Utils.articleUrl(item.id, item.header);
					item.image = item.image != '' ? 'media/artikel/thumbs/'+item.image : undefined;
					item.showHeader = Utils.plainText(item.header, 90);
					if (item.stars) {
						item.ratingTitle = 'Vurdering '+parseFloat(item.stars).toFixed(1)+' af '+item.votes;
						item.ratingTitle += item.votes == 1 ? ' stemme' : ' stemmer';
					} else {
						item.ratingTitle = 'Bliv den første til at bedømme artiklen';
					}
				})
				scope.articles = articles;
			})

		}
	}

});

