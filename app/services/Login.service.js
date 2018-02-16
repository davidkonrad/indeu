'use strict';

angular.module('indeuApp').factory('Login', 
	function($rootScope, $cookies, $timeout, $q, $location, ESPBA, RememberMe, AdminRights) {
    
	var cookieName = 'indeu.org';
	var	currentUser = null;

	function setCookie(user) {
		var expireDate = new Date();
		expireDate.setTime(expireDate.getTime()+(2*60*60*1000)) //two hours
		$cookies.put(cookieName, JSON.stringify(user), { expires: expireDate } )
	}
	function deleteCookie() {
		$cookies.remove(cookieName)
	}
	function updateOnlineStatus(user, status) {
		if (user) {
			ESPBA.update('user', { id: user.id, logged_in: status }).then(function(r) {
			})
		}
	}

	return {

		login: function(email, password, rememberMe) {
			var deferred = $q.defer();
			var self = this;
			deleteCookie();

			ESPBA.get('user', { email: email, password: password }).then(function(r) {
				if (!r || r && r.data && r.data.length == 0)  {
					deferred.resolve({ error : 'Email eller password ikke korrekt.' });
					return
				}
				if (r.data && r.data[0].id) {
					currentUser = r.data[0];
					delete currentUser.about; //the bio is irrelevant and just fill up space

					RememberMe.put(email, password, rememberMe);
					updateOnlineStatus(currentUser, 1);
					AdminRights.setUser(currentUser.id);
					self.getUserInfo();
					setCookie(currentUser);
					$rootScope.$emit('indeu.login');
		      deferred.resolve(currentUser);
				} else {
					deferred.resolve({ error : 'Email eller password ikke korrekt.' })
				}	
			})	
			return deferred.promise;
		},

		logout: function() {
			updateOnlineStatus(currentUser, 0);
			currentUser = null;
			deleteCookie();
		},
						
		isLoggedIn: function() {
			if (currentUser) {
				setCookie(currentUser); //force update of expire
				return true
			} else {
				var s = $cookies.get(cookieName);
				if (s) {
					currentUser = JSON.parse(s);
					this.getUserInfo();
					setCookie(currentUser);
					return true
				}
			}
			return false
		},

		check: function() {
			if (!this.isLoggedIn()) {
				$location.path('/');
			}
		},

		getUserInfo: function() {
			ESPBA.get('group_user', { user_id: currentUser.id }).then(function(g) {
				currentUser.groups = g.data;
			})
			ESPBA.get('association_user', { user_id: currentUser.id }).then(function(a) {
				currentUser.associations = a.data;
			})
		},

		isGroupMember: function(group_id) {
			if (!currentUser || !currentUser.groups) return false;
			for (var i=0,l=currentUser.groups.length; i<l; i++) {
				if (currentUser.groups[i].group_id == group_id) return true;
			}
			return false
		},

		isAssociationMember: function(association_id) {
			if (!currentUser || !currentUser.associations) return false;
			for (var i=0,l=currentUser.associations.length; i<l; i++) {
				if (currentUser.associations[i].association_id == association_id) return true;
			}
			return false
		},

		isAdmin: function() {
			if (!currentUser) return false;
			return (currentUser.role == 2);
		},

		updateLastSeen: function() {
			if (currentUser) {
				ESPBA.update('user', { id: currentUser.id, last_seen: 'CURRENT_TIMESTAMP' }).then(function(r) {
				})
			}
		},

		currentUser: function() {
			return currentUser
		}

	}

});
