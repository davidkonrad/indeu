'use strict';

/**
 * 
 * 
 * 
 */
angular.module('indeuApp').directive('comments', function($timeout, Login, Utils, ESPBA, Lookup, Notification, Log) {

	return {
		templateUrl: "views/inc/inc.comments.html",
		restrict: 'E',
		scope: {
			onCommentAdded: '@',
			userId: '@',
			hash: '@'
		},
		link: function($scope, element, attrs) {

			$scope.isLoggedIn = Login.isLoggedIn();
			$scope.user = Login.currentUser();

			var run = function() {
				$scope.actionCancel();
			}
			
			$scope.$watch('hash', function() {
				$scope.reloadComments();
				if ($scope.hash && $scope.user) run()
  	  });

			$scope.canSave = function(attr) {
				if (!$scope.comment) return false;
				return $scope.comment[attr] != '';
			}

			$scope.textAreaAdjust = function(element) {
				var t = document.getElementById(element);
				if (!t) return;
				t.style.height = "1px";
				t.style.height = (25+t.scrollHeight)+"px";
			}

			$scope.actionCancel = function(element) {
				$scope.actionAnswer = '';
				$scope.actionEdit = '';
				$scope.comment = {
					hash: $scope.hash,
					user_id: $scope.user.id,
					parent_id: 0,
					content: ''
				}
				$timeout(function() {
					$scope.textAreaAdjust('comment-content');
				});
			}

			//insert a new comment
			$scope.actionSave = function() {
		
				var getParentUser = function(comment_id) {
					for (var i=0, l=$scope.comments.length; i<l; i++) {
						if ($scope.comments[i].id == comment_id) return $scope.comments[i].user
					}
					return false //!!!!
				}
				var logParams = {};
				if ($scope.comment.parent_id) {
					var parent_user = getParentUser($scope.comment.parent_id);
					logParams.type = parent_user.id == $scope.comment.user_id ? Log.COMMENT_OWN_COMMENT : Log.COMMENT_COMMENT;
					logParams.context_user_id = parent_user.id;
				} else {
					logParams.type = Log.COMMENT_ENTITY;
				}
				logParams.user_id = $scope.comment.user_id;
				logParams.hash = $scope.comment.hash;

				//
				if ($scope.comment.contentAnswer) {
					$scope.comment.content = $scope.comment.contentAnswer;
					delete $scope.comment.contentAnswer;
				}

				ESPBA.insert('comment', $scope.comment).then(function(c) {
					Log.log(logParams);
					$scope.actionCancel();
					$scope.reloadComments();
					$timeout(function() {
						var element = angular.element('#comment'+c.data[0].id);
						$("body").animate({scrollTop: element.offset().top-60}, "slow");
						$timeout(function() {
							Notification.primary('Din kommentar er blevet offentliggjort');
						}, 50);
					}, 200);
				});
			}

			//update edits to an existing comment
			$scope.actionSaveEdit = function() {
				var update = {
					id: $scope.comment.id,
					content: $scope.comment.contentAnswer,
					edited_timestamp: 'CURRENT_TIMESTAMP'
				}

				var logParams = {
					user_id: $scope.comment.user_id,
					hash: $scope.comment.hash,
					type: Log.COMMENT_EDIT
				}

				ESPBA.update('comment', update).then(function(c) {
					Log.log(logParams);
					$scope.actionCancel();
					$scope.reloadComments();
					$timeout(function() {
						var element = angular.element('#comment'+c.data[0].id);
						$("body").animate({scrollTop: element.offset().top-60}, "slow");
						$timeout(function() {
							Notification.primary('Din kommentar er blevet opdateret');
						}, 50);
					}, 200);
				});
			}

			function sortComments(arr) {
				function hierarchySortFunc(a,b ) {
					return new Date(a).valueOf() > new Date(b).valueOf()
				}
				function hierarhySort(hashArr, key, result) {
					if (hashArr[key] == undefined) return;
					var arr = hashArr[key].sort(hierarchySortFunc);
					for (var i=0; i<arr.length; i++) {
						result.push(arr[i]);
						hierarhySort(hashArr, arr[i].id, result);
					}
					return result;
				}

				var hashArr = {};

				for (var i=0; i<arr.length; i++) {
					if (hashArr[arr[i].parent_id] == undefined) hashArr[arr[i].parent_id] = [];
					hashArr[arr[i].parent_id].push(arr[i]);
				}

				var result = hierarhySort(hashArr, 0, []);
				return result
			}

			$scope.reloadComments = function() {
				var self = this;
				
				ESPBA.get('comment', { hash: $scope.hash }).then(function(comments) {
					var count = !comments.data.length ? 0 : comments.data.length;
					var countText = count == 1 ? 'kommentar' : 'kommentarer';
					$scope.commentsHeader = count+' '+countText;
					
					function getParentUser(parent_id) {
						for (var i=0, l=comments.data.length; i<l; i++) {
							if (comments.data[i].id == parent_id) {
								return Lookup.getUser(comments.data[i].user_id)
							}
						}
						return null
					}

					if (comments.data.length) {
						var sorted = sortComments(comments.data);
	
						sorted.forEach(function(c) {
							c.dateStamp = moment(c.created_timestamp).fromNow();  
							c.user = Lookup.getUser(c.user_id);
							c.content = self.testYoutube(c.content);

							if (c.parent_id) {
								c.parent_user = getParentUser(c.parent_id) 
							}
						})
						$scope.comments = sorted;
					}
				});
			}

			$scope.commentById = function(id) {
				var c = $scope.comments;
				for (var i=0,l=c.length; i<l; i++) {
					if (c[i].id == id) return c[i]
				}
				return false
			}

			$scope.indentClass = function(comment_id) {

				function getParent(id) {
					for (var i=0, l=$scope.comments.length; i<l; i++) {
						if ($scope.comments[i].id == id) return $scope.comments[i].parent_id;
					}
				}
				var indent = 0;
				var id = comment_id;
				do {
					id = getParent(id);
					if (id > 0) indent++;
				} while (id>0);

				switch (indent) {
					case 0 : return ''; break;
					case 1 : return 'indent1'; break;
					case 2 : return 'indent2'; break;
					case 3 : return 'indent3'; break;
					case 4 : return 'indent4'; break;
					case 5 : return 'indent5'; break;
					case 6 : return 'indent6'; break;
					case 7 : return 'indent7'; break;
					case 8 : return 'indent8'; break;
					default :	return 'indent9'; break;
				}
			}

			//reply to a comment 
			$scope.setActionAnswer = function(comment_id) {
				$scope.actionEdit = '';
				$scope.comment = {
					hash: $scope.hash,
					user_id: $scope.user.id,
					parent_id: comment_id,
					content: '',
					contentAnswer: ''
				}
				$scope.actionAnswer = comment_id;
				$timeout(function() {
					$('#answer-comment-content'+comment_id).focus().trigger('keyup');
				})
			},

			//edit existing comment
			$scope.setActionEdit = function(comment_id) {
				$scope.actionAnswer = '';
				$scope.comment = $scope.commentById(comment_id);
				$scope.comment.contentAnswer = $scope.comment.content;
				$scope.actionEdit = comment_id;
				$timeout(function() {
					$('#edit-comment-content'+comment_id).focus().trigger('keyup');
				})
			},

			$scope.testYoutube = function(content) {
				var s = '';
				var links;

				while (content.length>0) {
					links = content.match(/\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[A-Z0-9+&@#\/%=~_|]/i);
					if (links) {
						var index = links.index;
						var link = links[0];
						var linkName = link.length > 10 ? link.slice(0,30)+'...' : link;
						if (index>0) {
							s += content.slice(0,index);
						}
						
						var url = Utils.parse_url(link);
						var id = url.query ? url.query.split('=').pop() : null;
						var ext = url.path ? url.path.split('.').pop() : null;
						//var name = url.path ? url.path.split('.').slice(0,-1).join('.') : null;
						//if (name && name.slice(0,1) == '/') name = name.slice(1);
						//console.log(name, id, ext, url);

						if (~['www.youtube.com'].indexOf(url.host) && id) {
							s += '<iframe type="text/html" width="500" height="265" frameborder="0" allowfullscreen ';
							s += 'src="https://www.youtube.com/embed/'+id+'?autoplay=0&enablejsapi=1">';
							s += '</iframe>';
						} else if (~['gifv'].indexOf(ext)) {
							var name = link.split('.');
							name.pop();
							name.push('mp4');
							name = name.join('.');
							s += '<video width="500" height="265" controls>';
							s += '<source src="' + name + '" type="video/mp4">';
							s += 'Your browser does not support the video tag.';
							s += '</video>';
						} else if (~['jpg', 'png', 'gif'].indexOf(ext)) {
							s += '<img src="' + link + '">';
						} else {
							s += '<a href="' + link + '" target=_blank title="'+link+'">' + linkName + '</a>';
						}
						content = content.slice(index+link.length);
					} else {
						s += content.slice(0);
						content = '';
					}
				}
				return s;
			}

		}

	}

});


