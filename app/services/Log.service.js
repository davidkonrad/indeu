'use strict';

angular.module('indeuApp').factory('Log', function(ESPBA) {

	return {
		USER_MEMBER_REQUEST: 1,
		USER_MEMBER_ACCEPTED: 2,
		USER_PROFILE_EDITED: 3,
		USER_ENTITY_RATING: 4,
		USER_CREATED_BY_ADMIN: 5,
		USER_EDITED_BY_ADMIN: 6,

		ARTICLE_CREATED: 10,
		ARTICLE_EDITED: 11,

		EVENT_CREATED: 20,
		EVENT_EDITED: 21,
		EVENT_FEEDBACK_1: 23,
		EVENT_FEEDBACK_2: 24,
		EVENT_FEEDBACK_REMOVE: 25,
		EVENT_CONTACTPERSON_ADDED: 26,
		EVENT_CONTACTPERSON_REMOVED: 27,
		EVENT_GROUP_ADDED: 28,
		EVENT_GROUP_REMOVED: 29,

		GROUP_CREATED: 30,
		GROUP_EDITED: 31,
		GROUP_MEMBER_REQUEST: 32,
		GROUP_MEMBER_DECLINED: 34,
		GROUP_MEMBER_ADDED: 33,
		GROUP_MEMBER_REMOVED: 35,
		GROUP_MEMBER_EXCLUDED: 36,
		GROUP_ARTICLE_CREATED: 37,

		COMMENT_ENTITY: 40,
		COMMENT_COMMENT: 41,
		COMMENT_OWN_COMMENT: 42,
		COMMENT_EDIT: 43,

		ASSOCIATION_CREATED: 50,
		ASSOCIATION_EDITED: 51,
		ASSOCIATION_GROUP_ADDED: 52,
		ASSOCIATION_GROUP_REMOVED: 53,
		ASSOCIATION_MEMBER_ADDED: 54,
		ASSOCIATION_MEMBER_REMOVED: 55,
		ASSOCIATION_OWNER_CHANGED: 56,
		ASSOCIATION_MEMBER_EXCLUDED: 57,
		ASSOCIATION_ARTICLE_CREATED: 58,
	

		log: function(opt) {
			var params = {
				type: opt.type,
				user_id: opt.user_id,
				context_user_id: opt.context_user_id || null,
				hash: opt.hash || null
			};
			ESPBA.insert('log', params).then(function(m) {
				//console.log('log', m);
			})
		},

		//return the log variable name for a value
		logName: function(value) {
			if (typeof value == 'number') {
				for (var name in this) {
					if (this[name] === value) return name
				}
			}
			return '__UNKOWN__'
		}

	}
});


