'use strict';

/**
 *
 *
 */
angular.module('indeuApp').controller('AdminForsideCtrl', function($scope, $q, Utils, ESPBA, SelectContentModal, Notification) {

	$scope.changed = false;

	ESPBA.get('frontpage_content', {}).then(function(f) {
		//sort by rank
		f.data.sort(function(a,b) {
			return a.rank > b.rank
		})
		$scope.content = f.data
	});

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
	}

	$scope.setNewOrder = function() {
		var rank = 0;
		$scope.content.forEach(function(c) {
			rank++;
			c.rank = rank;
		})
		$scope.changed = true;
	}

	function firstEmpty() {
		for (var i=0, l=$scope.content.length; i<l; i++) {
			if (!$scope.content[i].content_id) return i
		}
		return false
	}

	$scope.selectContent = function(item, content_type) {
		SelectContentModal.show(content_type).then(function(a) {
			if (a) {
				a = a[0];

				//place on first available slot, if index.id>empty
				var empty = firstEmpty();
				if (item.id > empty) item = $scope.content[empty];

				$scope.changed = true;

				switch (content_type) {
					case 'article' :
						item.header = a.header;
						item.content_id = a.id;
						item.hash = a.hash;
						item.type = 'Artikel';
						item.image = a.image;
						item.extract = a.sub_header;
						break;

					case 'association' :
						item.header = a.name;
						item.content_id = a.id;
						item.hash = a.hash;
						item.type = 'Forening';
						item.image = a.image;
						item.extract = Utils.plainText(a.about, 200);
						break;

					case 'event' :
						item.header = a.name;
						item.content_id = a.id;
						item.hash = a.hash;
						item.type = 'Event';
						item.image = a.image;
						item.extract = Utils.plainText(a.about, 200);
						break;

					default:
						break //should never happen
				}
			}	
		})
	}


});

