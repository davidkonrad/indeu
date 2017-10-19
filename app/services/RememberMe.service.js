
angular.module('indeuApp')
  .factory('RememberMe', ['$cookies', function($cookies) {

		var cookieName = 'indeu.org.rememberme';
		var rmDefaults = {
			p: '',
			m: ''
		};

		function setCookie(r) {
			var expireDate = new Date()
			expireDate.setTime(expireDate.getTime()+(10 * 365 * 24 * 60 * 60)) //10yrs
			$cookies.put(cookieName, JSON.stringify(r), { expires: expireDate } )
		}
		function deleteCookie() {
			$cookies.remove(cookieName)
		}

		return {

			get: function() {
				var r = $cookies.get(cookieName)
				return r ? JSON.parse(r) : angular.copy(rmDefaults)
			},

			put: function(email, password, rememberMe) {
				//console.log('put', arguments);
				if (!rememberMe) {
					deleteCookie()
				} else {
					setCookie({ m: email, p: password, rememberMe: true })
				}
			}

		}


}]);

