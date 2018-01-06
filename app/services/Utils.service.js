'use strict';

angular.module('indeuApp').factory('Utils', function($location, $window) {

	var isLocalHost = (location.hostname === "localhost" || location.hostname === "127.0.0.1");
	var urlLinkBase = isLocalHost ? 'http://localhost:9000/' : 'https://opgavesnyd.dk/'; // 'https://indeu.org/';

	var redirectMessage = undefined;

	String.prototype.quote = function() {
		return '"' + this + '"';
	}
	String.prototype.ldQuote = function() {
		return '“' + this + '”';
	}
	String.prototype.capitalize = function() {
		return this.charAt(0).toUpperCase() + this.slice(1);
	}

	return {
		isLocalHost: function() {
			return isLocalHost
		},

		articleUrl: function(id, header) {
			var u = this.isLocalHost() ? '/#/' : '/';
			return u + 'artikel/' + id + '/' + this.urlName(header);
		},

		gruppeUrl: function(id, navn) {
			var u = this.isLocalHost() ? '/#/' : '/';
			return u + 'grupper/' + id + '/' + this.urlName(navn);
		},

		eventUrl: function(id, name) {
			var u = this.isLocalHost() ? '/#/' : '/';
			return u + 'event/' + id + '/' + this.urlName(name);
		},

		foreningUrl: function(id, name) {
			var u = this.isLocalHost() ? '/#/' : '/';
			return u + 'forening/' + id + '/' + this.urlName(name);
		},

		userUrl: function(id, full_name) {
			var u = this.isLocalHost() ? '/#/' : '/';
			return u + 'medlemmer/' + id + '/' + this.urlName(full_name);
		},

		isEmpty: function(obj) {
			//https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
			return angular.equals({}, obj);
		},

		//fix name with spaces and æøå for url use
		urlName: function(s) {
			if (!s) return '';
			s = s.replace(/ /g, '-');
			s = s.replace(/[\/]/g, '-');
			s = s.replace(/æ/g, 'ae');
			s = s.replace(/Æ/g, 'Ae');
			s = s.replace(/ø/g, 'oe');
			s = s.replace(/å/g, 'aa');
			s = s.replace(/é/g, 'e');
			s = s.replace(/---/g, '-');
			s = s.replace(/--/g, '-');
			return s.toLowerCase();
		},

		//get current date in danish format
		todayStr: function(delimiter) {
			if (!delimiter) delimiter = '-';
			var d = new Date();	
			var s = d.getDate();
			s+= delimiter + (d.getMonth()+1);
			s+= delimiter + d.getFullYear();
			return s;
		},

		//remove secs from a timestamp, if it is set
		removeSecs: function(time) {
			if (!time) return '';
			time = time.toString().split(':');
			if (time.length == 3) {
				time.splice(-1,1)
			} else if (time.length == 1) {
				time.push('00');
			}
			return time.join(':');
		},

		ratingStr: function(r) {
			do {
				r = r.slice(0, -1)
			} while (r.slice(-1) == '0');
			if (r.slice(-1) == '.') r = r.slice(0, -1);
			return r;
		},

		//return plain text from HTML snippet
		plainText: function(snippet, maxLength) {
			var div = document.createElement("div"); //will be garbage collected, no need to remove
			div.innerHTML = snippet;
			var text = div.textContent || div.innerText || "";
			if (maxLength) {
				if (text.length > maxLength) {
					text = text.substring(0, maxLength) + ' ...';
				}
			}
			return text;
		},

			
		trimHtml: function(html, length) {

			//https://codereview.stackexchange.com/questions/92801/truncating-text-with-jquery-but-keep-the-html-formatting
			function cutKeepingTags(elem, reqCount) {
			  var grabText = '',
			      missCount = reqCount;

			  $(elem).contents().each(function() {
			    switch (this.nodeType) {
			      case Node.TEXT_NODE:
			        // Get node text, limited to missCount.
			        grabText += this.data.substr(0,missCount);
			        missCount -= Math.min(this.data.length, missCount);
			        break;
			      case Node.ELEMENT_NODE:
			        // Explore current child:
			        var childPart = cutKeepingTags(this, missCount);
			        grabText += childPart.text;
			        missCount -= childPart.count;
			        break;
			    }
			    if (missCount == 0) {
			      // We got text enough, stop looping.
			      return false;
			    }
			  });
			  return {
			    text:
			      // Wrap text using current elem tag.
			      elem.outerHTML.match(/^<[^>]+>/m)[0]
			      + grabText
			      + '</' + elem.localName + '>',
			    count: reqCount - missCount
			  };
			}

			var div = document.createElement("div"); //will be garbage collected, no need to remove
			div.innerHTML = html;
			return cutKeepingTags(div, length).text;
		},		

		//return a datetime for bs-timepicker
		createTime : function(time) {
			var d = new Date()
			if (time) {
				time = time.split(':')
				d.setHours( time[0] ? time[0] : 12, time[1] ? time[1] : 0  )
			}
			return d
		},

		//go to page and reload
		refreshPage: function(page) {
			if (isLocalHost) page = '#'+page;
			$location.path(page);
			$window.location.reload();
		},

		scrollTop: function() {
			var navBar = angular.element('#indeu-navbar');
			angular.element('body').animate({scrollTop: navBar.offset().top}, "slow");
		},

		scrollTo: function(selector, speed) {
			if (!speed) speed = 300;
			var e = angular.element(selector);
			angular.element('body').animate({scrollTop: e.offset().top - 50}, speed);
		},

		//https://gist.github.com/gordonbrander/2230317
		getHash: function(id) {
			return (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase()
		},

		parse_url: function(url) { 
			var parser = document.createElement('a');
			parser.href = url;
			return {
				protocol: parser.protocol ? parser.protocol : null,
				hostname: parser.hostname ? parser.hostname : null,
				port: parser.port ? parser.port : null,
				path: parser.pathname ? parser.pathname : null,
				query: parser.search ? parser.search : null,
				hash: parser.hash ? parser.hash : null,
				host: parser.host ? parser.host : null
			}
		}

	}

});


angular.module('indeuApp').directive('debugCss', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			console.log('debugCSS', element)
		}
	}
});

