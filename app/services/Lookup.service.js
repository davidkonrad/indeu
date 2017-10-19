'use strict';

angular.module('indeuApp').factory('Lookup', function($q, $timeout, ESPBA, Utils, Const) {

	//pass data between pages
	var passData = undefined;

	var access_levels = [
		{ id: Const.ACCESS_LEVEL_PUBLIC, name: 'Offentlig' },
		{ id: Const.ACCESS_LEVEL_USER, name: 'Alle brugere' },
		{ id: Const.ACCESS_LEVEL_CLOSED, name: 'Lukket' }
	];

	var visibility_levels = [
		{ id: 1, name: 'Offentlig' },
		{ id: 2, name: 'Alle brugere' },
		{ id: 3, name: 'Lukket' }
	];

	var event_types = [
		{ id: 1, name: 'Møde' },
		{ id: 2, name: 'Foredrag' },
		{ id: 3, name: 'Demonstration' },
		{ id: 4, name: 'Generalforsamling' }
	];

	//lookups
	var user = undefined;
	var group = undefined;


	function idToName(data, id, field) {
		if (!field) field = 'name';
		for (var i=0, l=data.length; i<l; i++) {
			if (data[i].id == id) return data[i][field];
		}
		return '';
	};

	function idToItem(data, id) {
		if (!data || !data.length) return {};
		for (var i=0, l=data.length; i<l; i++) {
			if (data[i].id == id) return data[i];
		}
		return {};
	};

	return {

		setPassData: function(data) {
			passData = data;
		},
		getPassData: function(reset) {
			var p = passData;
			//reset by default
			if (reset == undefined || reset == true) passData = undefined;
			return p;
		},

		//lookup service
		init: function() {
			var	deferred = $q.defer();

			var check = function() {
				if (user && group) {
		      deferred.resolve();
				}
			}

			ESPBA.get({ user: ['id', 'first_name', 'last_name', 'full_name', 'alias', 'created_timestamp', 'image', 'email', 'last_seen']}, {}).then(function(r) {
				//user = r.data;
				user = r.data.map(function(u) {
					u.urlName = Utils.urlName(u.full_name);
					return u;
				});
				//user = [];
				check();
			});

			ESPBA.get('group', {}).then(function(r) {
				group = r.data;
				check();
			});

      return deferred.promise;
		},

		//get names for record
		accessLevelName: function(id) {
			return idToName(access_levels, id)
		},
		visibilityLevelName: function(id) {
			return idToName(visibility_levels, id)
		},
		eventTypeName: function(id) {
			return idToName(event_types, id)
		},


		//return tables
		accessLevels: function() {
			return access_levels
		},
		visibilityLevels: function() {
			return visibility_levels
		},
		eventTypes: function() {
			return event_types
		},
		user: function() {
			return user
		},
		group: function() {
			return group
		},

		//lookup
		getUser: function(id) {
			return idToItem(user, id); 
			/*
			var self = this;
			var r = idToItem(user, id);
			console.log('r', r, id);
			if ( Utils.isEmpty(r) ) {
				ESPBA.get('user', { id: id }).then(function(u) {
					console.log('getuser', u.data[0]);
					user.push(u.data[0]);
				})
				return $timeout(function() {
					return self.getUser(id)
				}, 500);
			} else {
				return r
			}
			*/
		},
		getGroup: function(id) {
			return idToItem(group, id)
		},
		getGroupsByUser: function(user_id) {
			var	deferred = $q.defer();
			var that = this;
			ESPBA.get('group_user', { user_id: user_id }).then(function(r) {
				var groups = [];
				if (r.data.length == 0) deferred.resolve(groups);		
				for (var i=0, l=r.data.length; i<l; i++) {
					var g = r.data[i];
					var gruppe = that.getGroup(g.group_id);
					gruppe.is_owner = gruppe.owner_id == user_id;
					gruppe.urlName = Utils.urlName(gruppe.name);
					gruppe.urlTitle = Utils.plainText(gruppe.about, 200);
					groups.push(gruppe);

					if (i == r.data.length-1) {
			      deferred.resolve(groups);		
					}
				}
			});
      return deferred.promise;
		}

	}

});

