'use strict';

angular.module('indeuApp').directive('logNotifications', function($timeout, $compile, Utils, Login, ESPBA, Log, Lookup) {

	return {
		templateUrl: "views/inc/inc.logNotifications.html",
		restrict: 'EA',
		replace: true,
		scope: {
			userId: '@',
			hash: '@',
			limit: '=',
			notSeen: '='
		},
		link: function(scope, element, attrs) {

			var login_user_id = Login.isLoggedIn() ? Login.currentUser().id	: null;

			function entityLink(item) {
				if (item.article_id) {
					return ' artiklen <a href="'+Utils.articleUrl(item.article_id, item.article_name)+'">'+item.article_name+'</a>';
				} else if (item.group_id) {
					return ' gruppen <a href="'+Utils.gruppeUrl(item.group_id, item.group_name)+'">'+item.group_name+'</a>';
				} else if (item.event_id) {
					return ' eventen <a href="'+Utils.eventUrl(item.event_id, item.event_name)+'">'+item.event_name+'</a>';
				} else if (item.forening_id) {
					return ' foreningen <a href="'+Utils.foreningUrl(item.forening_id, item.forening_name)+'">'+item.forening_name+'</a>';
				} else if (item.issue_id) {
					return ' <a href="'+Utils.issueUrl(item.issue_id)+'">issue #'+item.issue_id+'</a>';
				} else if (item.user_user_id) {
					return ' brugeren <a href="'+Utils.userUrl(item.user_user_id, item.user_user_full_name)+'">'+item.user_user_full_name+'</a>';
				}
				return 'Should never happen';
			}

			function process(item) {
				item.type = parseInt(item.type);
				item.type_name = Log.logName(item.type);
				item.display_timestamp = moment(item.created_timestamp).fromNow().capitalize();
				
				switch (item.type) {
					//user
					case Log.USER_MEMBER_ACCEPTED :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'bekræftede og oprettede';
						item.action += ' <a href="'+Utils.userUrl(item.user_user_id, item.user_user_full_name) + '">'+item.user_user_full_name+'</a> som bruger';
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;

					case Log.USER_PROFILE_EDITED :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'redigerede din';
						item.action += ' <a href="'+Utils.userUrl(item.user_id, item.user_full_name) + '">profil</a>';
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;

					case Log.USER_ENTITY_RATING :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'gav';
						item.action += ' '+entityLink(item);
						item.action += ' en brugervurdering';
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;

					case Log.USER_EDITED_BY_ADMIN :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'redigerede som administrator ';
						item.action += ' '+entityLink(item);
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;

					case Log.USER_CREATED_BY_ADMIN :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'oprettede som administrator ';
						item.action += ' '+entityLink(item);
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;

					//associations
					case Log.ASSOCIATION_CREATED :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'oprettede foreningen';
						item.action += ' <a href="'+Utils.foreningUrl(item.forening_id, item.forening_name) + '">'+item.forening_name+'</a>';
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;

					case Log.ASSOCIATION_EDITED :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'redigerede foreningen';
						item.action += ' <a href="'+Utils.foreningUrl(item.forening_id, item.forening_name) + '">'+item.forening_name+'</a>';
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;

					case Log.ASSOCIATION_MEMBER_ADDED :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						var contextName = item.context_user_id == login_user_id ? 'dig' : item.context_user_full_name;
						item.action = 'tilføjede <a href="'+Utils.userUrl(item.context_user_id, item.context_user_full_name)+'">'+ contextName +'</a>';
						item.action += ' til foreningen <a href="'+Utils.foreningUrl(item.forening_id, item.forening_name) + '">'+item.forening_name+'</a>';
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;

					case Log.ASSOCIATION_MEMBER_REMOVED :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						var contextName = item.context_user_id == login_user_id ? 'dig' : item.context_user_full_name;
						item.action = 'fjernede <a href="'+Utils.userUrl(item.context_user_id, item.context_user_full_name)+'">'+ contextName +'</a>';
						item.action += ' fra foreningen <a href="'+Utils.foreningUrl(item.forening_id, item.forening_name) + '">'+item.forening_name+'</a>';
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;
					
					//comments
					case Log.COMMENT_ENTITY :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'kommenterede';
						item.action += entityLink(item);
						item.title = Utils.plainText(item.action);	
						break;

					case Log.COMMENT_COMMENT :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'svarede ';
						item.action += ' <a href="'+Utils.userUrl(item.context_user_id, item.context_user_full_name)+'">' + item.context_user_full_name + '</a>';
						item.action += ' på '+entityLink(item);
						item.title = Utils.plainText(item.action);	
						break;

					case Log.COMMENT_OWN_COMMENT :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'besvarede din egen kommentar';
						item.action += ' på '+entityLink(item);
						item.title = Utils.plainText(item.action);	
						break;

					case Log.COMMENT_EDIT :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'redigerede en kommentar';
						item.action += ' i '+entityLink(item);
						item.title = Utils.plainText(item.action);	
						break;

					case Log.COMMENT_DELETE :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'slettede en kommentar';
						item.action += ' i '+entityLink(item);
						item.title = Utils.plainText(item.action);	
						break;
					
					//groups
					case Log.GROUP_MEMBER_ADDED :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.url = Utils.gruppeUrl(item.group_id, item.group_name);
						item.title = item.userName + ' ' + item.action + ' ' + item.group_name;
						item.action = 'følger nu gruppen <a href="'+item.url+'">' + item.group_name +'</a>';
						break;

					case Log.GROUP_MEMBER_REMOVED :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.url = Utils.gruppeUrl(item.group_id, item.group_name);
						item.title = item.userName + ' ' + item.action + ' ' + item.group_name;
						item.action = 'følger ikke længere gruppen <a href="'+item.url+'">' + item.group_name +'</a>';
						break;

					case Log.GROUP_CREATED :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'oprettede gruppen';
						item.action += ' <a href="'+Utils.gruppeUrl(item.group_id, item.group_name) + '">'+item.group_name+'</a>';
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;

					case Log.GROUP_EDITED :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'redigerede gruppen';
						item.action += ' <a href="'+Utils.gruppeUrl(item.group_id, item.group_name) + '">'+item.group_name+'</a>';
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;

					case Log.GROUP_MEMBER_REQUEST :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'anmodede om at følge den lukkede gruppe';
						item.action += ' <a href="'+Utils.gruppeUrl(item.group_id, item.group_name) + '">'+item.group_name+'</a>';
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;

					//events
					case Log.EVENT_CREATED :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'oprettede eventen ';
						item.action += ' <a href="'+Utils.eventUrl(item.event_id, item.event_name) + '">'+item.event_name+'</a>';
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;

					case Log.EVENT_EDITED :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'redigerede eventen';
						item.action += ' <a href="'+Utils.eventUrl(item.event_id, item.event_name) + '">'+item.event_name+'</a>';
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;

					case Log.EVENT_CONTACTPERSON_ADDED :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'tilføjede';
						var contextName = item.context_user_id == login_user_id ? 'dig' : item.context_user_full_name;
						item.action += ' <a href="'+Utils.userUrl(item.context_user_id, item.context_user_full_name) + '">' + contextName + '</a>';
						item.action += ' som kontaktperson til eventen <a href="'+Utils.eventUrl(item.event_id, item.event_name) + '">'+item.event_name+'</a>';
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;

					case Log.EVENT_CONTACTPERSON_REMOVED :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						var contextName = item.context_user_id == login_user_id ? 'dig' : item.context_user_full_name;
						item.action = 'fjernede';
						item.action += ' <a href="'+Utils.userUrl(item.context_user_id, item.context_user_full_name) + '">' + contextName + '</a>';
						item.action += ' som kontaktperson til eventen <a href="'+Utils.eventUrl(item.event_id, item.event_name) + '">'+item.event_name+'</a>';
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;

					case Log.EVENT_GROUP_ADDED :
						var group = Lookup.getGroup(item.context_user_id);
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'tilføjede gruppen ';
						item.action += ' <a href="'+Utils.gruppeUrl(group.id, group.name) + '">'+group.name+'</a>';
						item.action += ' til eventen <a href="'+Utils.eventUrl(item.event_id, item.event_name) + '">'+item.event_name+'</a>';
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;

					case Log.EVENT_GROUP_REMOVED :
						var group = Lookup.getGroup(item.context_user_id);
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'fjernede gruppen ';
						item.action += ' <a href="'+Utils.gruppeUrl(group.id, group.name) + '">'+group.name+'</a>';
						item.action += ' fra eventen <a href="'+Utils.eventUrl(item.event_id, item.event_name) + '">'+item.event_name+'</a>';
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;

					case Log.EVENT_FEEDBACK_1 :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'deltager måske i eventen';
						item.action += ' <a href="'+Utils.eventUrl(item.event_id, item.event_name) + '">' + item.event_name + '</a>';
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;

					case Log.EVENT_FEEDBACK_2 :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'deltager i eventen';
						item.action += ' <a href="'+Utils.eventUrl(item.event_id, item.event_name) + '">' + item.event_name + '</a>';
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;

					case Log.EVENT_FEEDBACK_REMOVE :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'deltager alligevel ikke i eventen';
						item.action += ' <a href="'+Utils.eventUrl(item.event_id, item.event_name) + '">' + item.event_name + '</a>';
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;

					case Log.EVENT_CANCELLED :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'markerede eventen';
						item.action += ' <a href="'+Utils.eventUrl(item.event_id, item.event_name) + '">' + item.event_name + '</a> som aflyst';
						break;

					case Log.EVENT_CANCELLED_RETRACTED :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'fortrød aflysning af eventen ';
						item.action += ' <a href="'+Utils.eventUrl(item.event_id, item.event_name) + '">' + item.event_name + '</a>';
						break;

					//articles
					case Log.ARTICLE_EDITED :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'redigerede artiklen';
						item.action += ' <a href="'+Utils.articleUrl(item.article_id, item.article_name) + '">'+item.article_name+'</a>';
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;

					case Log.ARTICLE_CREATED :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'oprettede en ny artikel';
						item.action += ' <a href="'+Utils.articleUrl(item.article_id, item.article_name) + '">'+item.article_name+'</a>';
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;

					case Log.ARTICLE_RETRACTED :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'trak artiklen';
						item.action += ' <a href="'+Utils.articleUrl(item.article_id, item.article_name) + '">'+item.article_name+'</a> tilbage';
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;

					//issues
					case Log.ISSUE_CREATED :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = ' oprettede et nyt issue';
						item.action += ' <a href="'+Utils.issueUrl(item.issue_id) + '">#'+item.issue_id+'</a>';
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;

					case Log.ISSUE_EDITED :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = ' redigerede';
						item.action += ' <a href="'+Utils.issueUrl(item.issue_id) + '">issue #'+item.issue_id+'</a>';
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;

					case Log.ISSUE_MARK_SOLVED :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = ' markerede';
						item.action += ' <a href="'+Utils.issueUrl(item.issue_id) + '">issue #'+item.issue_id+'</a> som løst';
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;

					case Log.ISSUE_REOPENED :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = ' genåbnede';
						item.action += ' <a href="'+Utils.issueUrl(item.issue_id) + '">issue #'+item.issue_id+'</a>';
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;

					//misc
					case Log.FRONTPAGE_CONTENT_CHANGED :
						item.userName = item.user_id == login_user_id ? 'Du' : item.user_full_name;
						item.action = 'redigerede forsidens promoverede indhold ';
						item.title = item.userName + ' ' + Utils.plainText(item.action);
						break;


					default : 
						break;
				}
			}
			
			function reload() {
				var params = {};
				if (scope.userId) params.user_id = scope.userId;
				if (scope.hash) params.hash = scope.hash;				
				if (scope.notSeen) params.notSeen = 'yes';
				if (scope.limit) params.limit = scope.limit;

				ESPBA.prepared('Log', params).then(function(p) {
					p.data.forEach(function(item) {
						process(item)
					})
					scope.notifications = p.data;

					$timeout(function() {
						//element.attr('datatable', 'ng');
						//$compile(element.contents())(scope);
					}, 1000)
				})
			}

			attrs.$observe('userId', function() {
				if (scope.userId) reload()
			})

			attrs.$observe('hash', function() {
				if (scope.hash) reload()
			})

		}
	}

});

