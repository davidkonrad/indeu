'use strict';

angular.module('indeuApp').factory('UserVisits', function($q, Login, ESPBA) {

	var visits = undefined;

	return {

		visit: function(hash) {
			if (!visits) {
				var service = this;
				this.reload().then(function() {
					service.visit(hash);
				})
			} else {
				if (!this.visited(hash)) {
					this.save(hash);
				}
			}
		},

		reload: function() {
			var deferred = $q.defer();
			if (!Login.isLoggedIn()) {
				visits = [];
	     	deferred.resolve();
				return deferred.promise;
			}
			var deferred = $q.defer();
			var user_id = Login.currentUser().id;
			var service = this;
			ESPBA.get('user_visits', { user_id: user_id }).then(function(v) {
				visits = v.data;
	      deferred.resolve();
			})
      return deferred.promise;
		},

		visited: function(hash) {
			for (var i=0, l=visits.length; i<l; i++) {
				if (visits[i].hash == hash) return true
			}
			return false
		},

		save: function(hash) {
			if (!Login.isLoggedIn()) return;
			var user_id = Login.currentUser().id;
			var service = this;
			ESPBA.insert('user_visits', { hash: hash, user_id: user_id }).then(function(v) {
				service.reload()
			})
		}

	}
});

