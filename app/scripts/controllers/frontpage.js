'use strict';

/**
 *
 *
 */
angular.module('indeuApp')
  .controller('FrontpageCtrl', function($scope, ESPBA, Lookup, Meta, Utils, Redirect, Notification) {


		Meta.setTitle('indeu.org');
		Meta.setDescription('bla bla.');

		function init() {
			ESPBA.get('frontpage').then(function(f) {
				var front = f.data[0];
				ESPBA.get('article', { id: front.promoted_article_id }).then(function(a) {
					a = a.data[0];
					a.urlName = Utils.urlName(a.header);

					var html = Utils.trimHtml(a.content, 500);
					var link = Utils.isLocalHost() 
						? '&nbsp;&nbsp;<a href="#/artikel/'+a.id+'/'+a.urlName+'" debug-link>Læs mere ...</a>'
						: '&nbsp;&nbsp;<a href="artikel/'+a.id+'/'+a.urlName+'" debug-link>Læs mere ...</a>';

					//</p></div>
					html = [html.slice(0, html.length-10), link, html.slice(html.length-10)].join('');
				
					a.html = html;
					//console.log('html', a.html);
					$scope.article = a;
				})
			})
		}

		Lookup.init().then(function() {
			init();
		});

		if (Redirect.message()) {
			Notification(Redirect.message());
			Redirect.clear();
		}
	

});
