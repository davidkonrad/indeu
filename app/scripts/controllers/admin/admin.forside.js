'use strict';

/**
 *
 *
 */
angular.module('indeuApp').controller('AdminForsideCtrl', 
	function($scope, $timeout, $location, Log, Login, Utils, ESPBA, SelectEventModal, SelectArtikelModal, SelectForeningModal, 
	SelectStaticPageModal, Notification, AdminRights, ConfirmModal) {

	if (!AdminRights.frontpageView()) {
		$location.path('/admin-overblik').replace()
	}

	$scope.updateRights = AdminRights.frontpageUpdate();
	$scope.changed = false;

	function reloadContent() {
		ESPBA.get('frontpage_content', {}).then(function(f) {
			//sort by rank
			f.data.sort(function(a,b) {
				return a.rank > b.rank
			})
			$scope.content = f.data
		});
	}
	reloadContent();

	$scope.updateContent = function() {
		$scope.content.forEach(function(c) {
			var item = $.extend({}, c);
			delete item.$$hashKey;
			delete item.__action;
			delete item.__token;
			delete item.__table;
			ESPBA.update('frontpage_content', item, function(r) {
				//
			})
		})
		Notification.primary('Forside indhold ændret ..');
		$scope.changed = false;

		Log.log({
			type: Log.FRONTPAGE_CONTENT_CHANGED,
			user_id: Login.currentUser().id,
			context_user_id: null,
			hash: null
		});
	}

	$scope.setNewOrder = function() {
		var rank = 0;
		$scope.content.forEach(function(c) {
			rank++;
			c.rank = rank;
		})
		$scope.changed = true;
	}

	$scope.removeContent = function(item) {
		ConfirmModal.show('Fjern dette indhold fra forsiden?').then(function(answer) {
			if (answer) {
				var update = {
					id: item.id,
					content_id: '',
					hash: '',
					type: '',
					header: '',
					image: '', 
					extract: ''
				}					
				ESPBA.update('frontpage_content', update ).then(function(r) {
					reloadContent();
				})
			}
		})
	}

	function firstEmpty() {
		for (var i=0, l=$scope.content.length; i<l; i++) {
			if (!$scope.content[i].content_id) return i
		}
		return false
	}

	$scope.selectContent = function(item, content_type) {
		if (!$scope.updateRights) return;

		var empty = firstEmpty();
		if (empty && item.id > empty) item = $scope.content[empty]

		if (content_type == 'article') {
			SelectArtikelModal.show().then(function(a) {
				if (a) {
					a = a[0];
					item.header = a.header;
					item.content_id = a.id;
					item.hash = a.hash;
					item.type = 'Artikel';
					item.image = a.image;
					item.extract = a.sub_header || Utils.plainText(a.content, 200);
					$scope.changed = true;
				}
			})
		}

		if (content_type == 'association') {
			SelectForeningModal.show().then(function(a) {
				if (a) {
					a = a[0];
					item.header = a['name'];
					item.content_id = a.id;
					item.hash = a.hash;
					item.type = 'Forening';
					item.image = a.image;
					item.extract = Utils.plainText(a.about, 200);
					$scope.changed = true;
				}
			})
		}

		if (content_type == 'event') {
			SelectEventModal.show().then(function(a) {
				if (a) {
					a = a[0];
					item.header = a['name'];
					item.content_id = a.id;
					item.hash = a.hash;
					item.type = 'Event';
					item.image = a.image;
					item.extract = Utils.plainText(a.about, 200);
					$scope.changed = true;
				}
			})
		}

		if (content_type == 'static_page') {
			SelectStaticPageModal.show().then(function(a) {
				if (a) {
					a = a[0];
					item.header = a.header;
					item.content_id = a.id;
					item.hash = a.hash;
					item.type = 'Statisk';
					item.image = a.image;
					item.extract = a.sub_header || Utils.plainText(a.content, 200);
					$scope.changed = true;
				}
			})
		}
	}


});

