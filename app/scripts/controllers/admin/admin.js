'use strict';

/**
 *
 *
 */
angular.module('indeuApp')
  .controller('AdminCtrl', function($scope, $location, $timeout, ESPBA, Lookup, Meta, Utils, Login, Redirect, AdminRights, Email) {

		if (!Login.isLoggedIn()) {
			Redirect.home('Du er ikke logget ind');
		} else {
			if (!Login.isAdmin()) {
				Redirect.home('Du er ikke administrator');
			}
		}

		if (!AdminRights.dictionary().frontpageView) {
			Redirect.home('Du har ingen administrator-rettigheder');
		} else {
			$scope.adminRights = AdminRights.dictionary()
		}


		//frontpage content
		ESPBA.prepared('AdminContentOverview', {}).then(function(r) {
			$scope.overview = r.data[0]
		})

		ESPBA.prepared('AdminMostCommented', {}).then(function(r) {

			$scope.most_commented = r.data.map(function(c) {
				var item = {
					count: c.comment_count
				};

				if (c.article_id) {
					item.fa = 'fa-file-text-o';
					item.url = Utils.articleUrl(c.article_id, c.article_header);
					item.name = c.article_header;
				}

				if (c.event_id) {
					item.fa = 'fa-calendar';
					item.url = Utils.eventUrl(c.event_id, c.event_name);
					item.name = c.event_name;
				}

				if (c.group_id) {
					item.fa = 'fa-users';
					item.url = Utils.gruppeUrl(c.group_id, c.group_name);
					item.name = c.group_name;
				}

				if (c.user_id) {
					item.fa = 'fa-user';
					item.url = Utils.userUrl(c.user_id, c.user_name);
					item.name = c.user_name;
				}

				if (c.association_id) {
					item.fa = 'fa-sitemap';
					item.url = Utils.userUrl(c.association_id, c.association_name);
					item.name = c.association_name;
				}

				if (c.static_page_id) {
					item.fa = 'fa-file-text';
					item.url = Utils.staticUrl(c.static_page_id, c.static_page_header);
					item.name = c.static_page_header;
				}

				return item
			})

		})

});

