'use strict';

angular.module('indeuApp').factory('AdminRightsUpdater', function($q, ESPBA, Utils, AdminRights) {

	var _user_id;
	var _rights;
	var _self;
	var	deferred;

	return {
		
		loadUser: function(user_id, create) {
			deferred = $q.defer()

			// already loaded
			if (_rights && _user_id && _user_id == user_id) {
				deferred.resolve( this.dictionary() )
			}

			_user_id = user_id;
			_self = this;

			ESPBA.get('user_admin_rights', { user_id: user_id }).then(function(r) {
				if (r.data && r.data.length ==1) {
					_rights = r.data[0];
					deferred.resolve( _self.dictionary() )
				} else {
					if (create) _self.createUser()
				}
			})

      return deferred.promise;
		},

		createUser: function() {
			var defaults = {
				user_id: _user_id,
				frontpage: '0000000000',
				user: '0000000000',
				user_request: '0000000000',
				event: '0000000000',
				group: '0000000000',
				association: '0000000000',
				article: '0000000000',
				static_page: '0000000000',
				comment: '0000000000'
			}
			ESPBA.insert('user_admin_rights', defaults).then(function(r) {
				if (r.data && r.data.length == 1) {
					_rights = r.data[0];
					deferred.resolve( _self.dictionary() )
				} else {
					console.error('Error creating user rights', r)
				}
			})
		},

		updateUser: function() {
			ESPBA.update('user_admin_rights', _rights)
		},

		//complete dictionary
		dictionary: function() {
			return {
				frontpageView: this.frontpageView(),
				frontpageUpdate: this.frontpageUpdate(),

				userView: this.userView(),
				userEdit: this.userEdit(),
				userCreate: this.userCreate(),
				userGrantAdmin: this.userGrantAdmin(),
				userQuarantine: this.userQuarantine(),

				user_requestView: this.user_requestView(),
				user_requestAccept: this.user_requestAccept(),
				user_requestRemove: this.user_requestRemove(),

				eventView: this.eventView(),
				eventEdit: this.eventEdit(),
				eventCreate: this.eventCreate(),
				eventRemove: this.eventRemove(),

				groupView: this.groupView(),
				groupEdit: this.groupEdit(),
				groupCreate: this.groupCreate(),
				groupRemove: this.groupRemove(),

				associationView: this.associationView(),
				associationEdit: this.associationEdit(),
				associationCreate: this.associationCreate(),
				associationRemove: this.associationRemove(),

				articleView: this.articleView(),
				articleEdit: this.articleEdit(),
				articleCreate: this.articleCreate(),
				articleRemove: this.articleRemove(),

				static_pageView: this.static_pageView(),
				static_pageEdit: this.static_pageEdit(),
				static_pageCreate: this.static_pageCreate(),
				static_pageRemove: this.static_pageRemove(),

				commentView: this.commentView(),
				commentEdit: this.commentEdit(),
				commentRemove: this.commentRemove(),
			}
		},

		//frontpage
		frontpageView: function(value) {
			if (typeof value !== 'undefined') {
				_rights.frontpage = Utils.setBit(_rights.frontpage, AdminRights.FRONTPAGE_VIEW, value)
			} else {
				return Utils.getBit(_rights.frontpage, AdminRights.FRONTPAGE_VIEW)
			}
		},
		frontpageUpdate: function(value) {
			if (typeof value !== 'undefined') {
				_rights.frontpage = Utils.setBit(_rights.frontpage, AdminRights.FRONTPAGE_UPDATE, value)
			} else {
				return Utils.getBit(_rights.frontpage, AdminRights.FRONTPAGE_UPDATE)
			}
		},

		//user
		userView: function(value) {
			if (typeof value !== 'undefined') {
				_rights.user = Utils.setBit(_rights.user, AdminRights.USER_VIEW, value)
			} else {
				return Utils.getBit(_rights.user, AdminRights.USER_VIEW)
			}
		},
		userEdit: function(value) {
			if (typeof value !== 'undefined') {
				_rights.user = Utils.setBit(_rights.user, AdminRights.USER_EDIT, value)
			} else {
				return Utils.getBit(_rights.user, AdminRights.USER_EDIT)
			}
		},
		userCreate: function(value) {
			if (typeof value !== 'undefined') {
				_rights.user = Utils.setBit(_rights.user, AdminRights.USER_CREATE, value)
			} else {
				return Utils.getBit(_rights.user, AdminRights.USER_CREATE)
			}
		},
		userGrantAdmin: function(value) {
			if (typeof value !== 'undefined') {
				_rights.user = Utils.setBit(_rights.user, AdminRights.USER_GRANTADMIN, value)
			} else {
				return Utils.getBit(_rights.user, AdminRights.USER_GRANTADMIN)
			}
		},
		userQuarantine: function(value) {
			if (typeof value !== 'undefined') {
				_rights.user = Utils.setBit(_rights.user, AdminRights.USER_QUARANTINE, value)
			} else {
				return Utils.getBit(_rights.user, AdminRights.USER_QUARANTINE)
			}
		},

		//user requests
		user_requestView: function(value) {
			if (typeof value !== 'undefined') {
				_rights.user_request = Utils.setBit(_rights.user_request, AdminRights.USER_REQUEST_VIEW, value)
			} else {
				return Utils.getBit(_rights.user_request, AdminRights.USER_REQUEST_VIEW)
			}
		},
		user_requestAccept: function(value) {
			if (typeof value !== 'undefined') {
				_rights.user_request = Utils.setBit(_rights.user_request, AdminRights.USER_REQUEST_ACCEPT, value)
			} else {
				return Utils.getBit(_rights.user_request, AdminRights.USER_REQUEST_ACCEPT)
			}
		},
		user_requestRemove: function(value) {
			if (typeof value !== 'undefined') {
				_rights.user_request = Utils.setBit(_rights.user_request, AdminRights.USER_REQUEST_REMOVE, value)
			} else {
				return Utils.getBit(_rights.user_request, AdminRights.USER_REQUEST_REMOVE)
			}
		},

		//event
		eventView: function(value) {
			if (typeof value !== 'undefined') {
				_rights.event = Utils.setBit(_rights.event, AdminRights.EVENT_VIEW, value)
			} else {
				return Utils.getBit(_rights.event, AdminRights.EVENT_VIEW)
			}
		},
		eventEdit: function(value) {
			if (typeof value !== 'undefined') {
				_rights.event = Utils.setBit(_rights.event, AdminRights.EVENT_EDIT, value)
			} else {
				return Utils.getBit(_rights.event, AdminRights.EVENT_EDIT)
			}
		},
		eventCreate: function(value) {
			if (typeof value !== 'undefined') {
				_rights.event = Utils.setBit(_rights.event, AdminRights.EVENT_CREATE, value)
			} else {
				return Utils.getBit(_rights.event, AdminRights.EVENT_CREATE)
			}
		},
		eventRemove: function(value) {
			if (typeof value !== 'undefined') {
				_rights.event = Utils.setBit(_rights.event, AdminRights.EVENT_REMOVE, value)
			} else {
				return Utils.getBit(_rights.event, AdminRights.EVENT_REMOVE)
			}
		},

		//group
		groupView: function(value) {
			if (typeof value !== 'undefined') {
				_rights.group = Utils.setBit(_rights.group, AdminRights.GROUP_VIEW, value)
			} else {
				return Utils.getBit(_rights.group, AdminRights.GROUP_VIEW)
			}
		},
		groupEdit: function(value) {
			if (typeof value !== 'undefined') {
				_rights.group = Utils.setBit(_rights.group, AdminRights.GROUP_EDIT, value)
			} else {
				return Utils.getBit(_rights.group, AdminRights.GROUP_EDIT)
			}
		},
		groupCreate: function(value) {
			if (typeof value !== 'undefined') {
				_rights.group = Utils.setBit(_rights.group, AdminRights.GROUP_CREATE, value)
			} else {
				return Utils.getBit(_rights.group, AdminRights.GROUP_CREATE)
			}
		},
		groupRemove: function(value) {
			if (typeof value !== 'undefined') {
				_rights.group = Utils.setBit(_rights.group, AdminRights.GROUP_REMOVE, value)
			} else {
				return Utils.getBit(_rights.group, AdminRights.GROUP_REMOVE)
			}
		},

		//association
		associationView: function(value) {
			if (typeof value !== 'undefined') {
				_rights.association = Utils.setBit(_rights.association, AdminRights.ASSOCIATION_VIEW, value)
			} else {
				return Utils.getBit(_rights.association, AdminRights.ASSOCIATION_VIEW)
			}
		},
		associationEdit: function(value) {
			if (typeof value !== 'undefined') {
				_rights.association = Utils.setBit(_rights.association, AdminRights.ASSOCIATION_EDIT, value)
			} else {
				return Utils.getBit(_rights.association, AdminRights.ASSOCIATION_EDIT)
			}
		},
		associationCreate: function(value) {
			if (typeof value !== 'undefined') {
				_rights.association = Utils.setBit(_rights.association, AdminRights.ASSOCIATION_CREATE, value)
			} else {
				return Utils.getBit(_rights.association, AdminRights.ASSOCIATION_CREATE)
			}
		},
		associationRemove: function(value) {
			if (typeof value !== 'undefined') {
				_rights.association = Utils.setBit(_rights.association, AdminRights.ASSOCIATION_REMOVE, value)
			} else {
				return Utils.getBit(_rights.association, AdminRights.ASSOCIATION_REMOVE)
			}
		},

		//article
		articleView: function(value) {
			if (typeof value !== 'undefined') {
				_rights.article = Utils.setBit(_rights.article, AdminRights.ARTICLE_VIEW, value)
			} else {
				return Utils.getBit(_rights.article, AdminRights.ARTICLE_VIEW)
			}
		},
		articleEdit: function(value) {
			if (typeof value !== 'undefined') {
				_rights.article = Utils.setBit(_rights.article, AdminRights.ARTICLE_EDIT, value)
			} else {
				return Utils.getBit(_rights.article, AdminRights.ARTICLE_EDIT)
			}
		},
		articleCreate: function(value) {
			if (typeof value !== 'undefined') {
				_rights.article = Utils.setBit(_rights.article, AdminRights.ARTICLE_CREATE, value)
			} else {
				return Utils.getBit(_rights.article, AdminRights.ARTICLE_CREATE)
			}
		},
		articleRemove: function(value) {
			if (typeof value !== 'undefined') {
				_rights.article = Utils.setBit(_rights.article, AdminRights.ARTICLE_REMOVE, value)
			} else {
				return Utils.getBit(_rights.article, AdminRights.ARTICLE_REMOVE)
			}
		},

		//static_page
		static_pageView: function(value) {
			if (typeof value !== 'undefined') {
				_rights.static_page = Utils.setBit(_rights.static_page, AdminRights.STATIC_PAGE_VIEW, value)
			} else {
				return Utils.getBit(_rights.static_page, AdminRights.STATIC_PAGE_VIEW)
			}
		},
		static_pageEdit: function(value) {
			if (typeof value !== 'undefined') {
				_rights.static_page = Utils.setBit(_rights.static_page, AdminRights.STATIC_PAGE_EDIT, value)
			} else {
				return Utils.getBit(_rights.static_page, AdminRights.STATIC_PAGE_EDIT)
			}
		},
		static_pageCreate: function(value) {
			if (typeof value !== 'undefined') {
				_rights.static_page = Utils.setBit(_rights.static_page, AdminRights.STATIC_PAGE_CREATE, value)
			} else {
				return Utils.getBit(_rights.static_page, AdminRights.STATIC_PAGE_CREATE)
			}
		},
		static_pageRemove: function(value) {
			if (typeof value !== 'undefined') {
				_rights.static_page = Utils.setBit(_rights.static_page, AdminRights.STATIC_PAGE_REMOVE, value)
			} else {
				return Utils.getBit(_rights.static_page, AdminRights.STATIC_PAGE_REMOVE)
			}
		},

		//comment 
		commentView: function(value) {
			if (typeof value !== 'undefined') {
				 _rights.comment = Utils.setBit(_rights.comment, AdminRights.COMMENT_VIEW, value)
			} else {
				return Utils.getBit(_rights.comment, AdminRights.COMMENT_VIEW)
			}
		},
		commentEdit: function(value) {
			if (typeof value !== 'undefined') {
				_rights.comment = Utils.setBit(_rights.comment, AdminRights.COMMENT_EDIT, value)
			} else {
				return Utils.getBit(_rights.comment, AdminRights.COMMENT_EDIT)
			}
		},
		commentRemove: function(value) {
			if (typeof value !== 'undefined') {
				_rights.comment = Utils.setBit(_rights.comment, AdminRights.COMMENT_REMOVE, value)
			} else {
				return Utils.getBit(_rights.comment, AdminRights.COMMENT_REMOVE)
			}
		},


	}

});
		

