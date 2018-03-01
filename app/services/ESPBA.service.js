;'use strict';

/**
 * ESPBA service
 *
 * @version v0.0.2 - 12-02-2018
 * @author David Konrad (davidkonrad@gmail.com)
 * @license MIT (https://opensource.org/licenses/MIT)
**/

angular.module('ESPBA', [])
	.factory('ESPBA', ['$http', '$location', '$q', function($http, $location, $q) {

		/**
			* Remember to set credentials for your app. A good place to do that is in app.run :
      * 
			* .run(function(ESPBA) {
			*   ESPBA.setHost('http://yourhost.com/');
			*   ESPBA.setPath('relative/path/to/espba.php');
			* })
			*
		**/
		var host = 'http://localhost/';
		var api_path = 'api/espba.php';	
		var returnMode = 'response'; //response || json
		var token = undefined;

		var process = function(r) {
			return returnMode == 'json' ? r.data : r
		};

		var parse = function(data, selectParams) {
			if (selectParams) {
				if (selectParams.limit) {
					data.__limit = selectParams.limit
				}
				//{ orderBy: { field: , order: }}
				if (selectParams.orderBy) {
					if (typeof selectParams.orderBy == 'object') {
						data.__orderBy = selectParams.orderBy.field;
						if (selectParams.orderBy.order) data.__orderBy += ' '+selectParams.orderBy.order
					} else {
						data.__orderBy = selectParams.orderBy;
					}
				}
			}			
			return data		
		};

		//remove dot in keys
		var sanitizeData = function(data) {
			for (var key in data) {
				if (~key.indexOf('.')) {
					var p = data[key];
					var newKey = key.replace(/\./, '&dot;');
					data[newKey] = p;
					delete data[key];
				}
			}
		}

		return {

			setHost: function(h) {
				host = h;
			},
			setApiPath: function(p) {
				api_path = p;
			},
			setReturnMode: function(m) {
				m = m.toString().toLowerCase();
				if (~['response', 'json'].indexOf(m)) {
					returnMode = m
				}
			},

			getHost: function() {
				return host;
			},
			getApiPath: function() {
				return api_path;
			},
			getToken: function() {
				return token;
			},

			init: function() {
				var deferred = $q.defer();
				if (token) {
					deferred.resolve(token);
				} else {
					var data = { __action: 'init' };
					$http({
						url: host + api_path,
						method: 'POST',
						params: data
					}).then(function(r) {
						token = r.data || false; 
			      deferred.resolve(process(token))
					})
				}
	      return deferred.promise;
			},
				
			get: function(table, data, selectParams) {
				var deferred = $q.defer();
				if (!data) data = {};
				data.__action = 'get';

				//we assume string for table, object for table with fields
				//ie tablename or { tablename: [field, field] }
				if (typeof table == 'string') {
					data.__table = table;
				} else {
					data.__table = Object.keys(table)[0];
					data.__fields = table[data.__table].toString(); 
				}

				data = parse(data, selectParams);

				$http({
					url: host + api_path,
					method: 'GET',
					params: data
				}).then(function(r) {
		      deferred.resolve( process(r) )
				})
	      return deferred.promise;
			},

			delete: function(table, data) {
				var deferred = $q.defer();
				data.__action = 'delete';
				data.__table = table;

				$http({
					url: host + api_path,
					method: 'POST',
					params: data
				}).then(function(r) {
		      deferred.resolve( process(r) )
				})
	      return deferred.promise;
			},

			update: function(table, data) {
				var deferred = $q.defer();
				data.__action = 'update';
				data.__table = table;

				$http({
					url: host + api_path,
					method: 'POST',
					params: data
				}).then(function(r) {
		      deferred.resolve( process(r) )
				})
	      return deferred.promise;
			},

			insert: function(table, data) {
				var deferred = $q.defer();
				data.__action = 'insert';
				data.__table = table;

				$http({
					url: host + api_path,
					method: 'POST',
					params: data
				}).then(function(r) {
		      deferred.resolve(r);
				})
	      return deferred.promise;
			},

			prepared: function(func, data) {
				var deferred = $q.defer();
				if (!data) data = {};
				
				//replace . with &dot
				/*
				for (var key in data) {
					if (~key.indexOf('.')) {
						var p = data[key];
						var newKey = key.replace(/\./, '&dot;');
						data[newKey] = p;
						delete data[key];
					}
				}
				*/
				sanitizeData(data);

				data.__action = 'prepared';
				data.__table = func;
				data.__token = token;

				$http({
					url: host + api_path,
					method: 'GET',
					params: data
				}).then(function(r) {
		      deferred.resolve(r);
				})
	      return deferred.promise;
			},


			//			
			$prepared: function(func, data) {
				var deferred = $q.defer();
				if (!data) data = {};
				
				data.__action = 'prepared';
				data.__table = func;
				data.__crypt = true;

				//replace . with &dot
				/*
				for (var key in data) {
					if (~key.indexOf('.')) {
						var p = data[key];
						var newKey = key.replace(/\./, '&dot;');
						data[newKey] = p;
						delete data[key];
					}
				}
				*/
				sanitizeData(data);

				this.init().then(function() {
					console.log('ok', data);
					$http({
						url: host + api_path,
						method: 'GET',
						params: data
					}).then(function(r) {
						var encrypted = r.data.data;
						var salt = CryptoJS.enc.Hex.parse(r.data.salt);
						var iv = CryptoJS.enc.Hex.parse(r.data.iv);   
						var key = CryptoJS.PBKDF2(token.token, salt, { hasher: CryptoJS.algo.SHA512, keySize: 64/8, iterations: 999});
						var decrypted = CryptoJS.AES.decrypt(encrypted, key, { iv: iv});
	
						var text = decrypted.toString(CryptoJS.enc.Utf8);
						var data = JSON.parse(text);
	
			      deferred.resolve({ data: data });
					})
				})
	      return deferred.promise;
			}

		}		

}]);

