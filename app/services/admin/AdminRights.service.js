'use strict';

angular.module('indeuApp').factory('AdminRights', function($q, ESPBA, Utils, Login) {

	var _user_id;
	var _rights;
	var _self;

	return {

		isLoaded: function() {
			return _rights != undefined
		},

		getAdminRights: function() {
			var user_id = Login.isLoggedIn() ? Login.currentUser().id : false;
			var	deferred = $q.defer();

			//user not set
			if (!user_id) {
				deferred.resolve( false )
			}

			//already loaded
			if (_rights && user_id == _user_id){
				deferred.resolve( this.dictionary() )
			}

			_user_id = user_id;
			_self = this;

			ESPBA.get('user_admin_rights', { user_id: user_id }).then(function(r) {
				if (r.data && r.data.length ==1) {
					_rights = r.data[0];
					deferred.resolve( _self.dictionary() )
				} else {
					//
				}
			})

      return deferred.promise;
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

		//indexes
		FRONTPAGE_VIEW: 0,
		FRONTPAGE_UPDATE: 1,

		USER_VIEW: 0,
		USER_EDIT: 1,
		USER_CREATE: 2,
		USER_GRANTADMIN: 3,
		USER_QUARANTINE: 4,

		USER_REQUEST_VIEW: 0,
		USER_REQUEST_ACCEPT: 1,
		USER_REQUEST_REMOVE: 2,

		EVENT_VIEW: 0,
		EVENT_EDIT: 1,
		EVENT_CREATE: 2,
		EVENT_REMOVE: 3,

		GROUP_VIEW: 0,
		GROUP_EDIT: 1,
		GROUP_CREATE: 2,
		GROUP_REMOVE: 3,

		ASSOCIATION_VIEW: 0,
		ASSOCIATION_EDIT: 1,
		ASSOCIATION_CREATE: 2,
		ASSOCIATION_REMOVE: 3,

		ARTICLE_VIEW: 0,
		ARTICLE_EDIT: 1,
		ARTICLE_CREATE: 2,
		ARTICLE_REMOVE: 3,

		STATIC_PAGE_VIEW: 0,
		STATIC_PAGE_EDIT: 1,
		STATIC_PAGE_CREATE: 2,
		STATIC_PAGE_REMOVE: 3,

		COMMENT_VIEW: 0,
		COMMENT_EDIT: 1,
		COMMENT_REMOVE: 2,

		//frontpage
		frontpageView: function() {
			return Utils.getBit( _rights.frontpage, this.FRONTPAGE_VIEW )
		},
		frontpageUpdate: function() {
			return Utils.getBit( _rights.frontpage, this.FRONTPAGE_UPDATE )
		},

		//user
		userView: function(value) {
			return Utils.getBit(_rights.user, this.USER_VIEW )
		},
		userEdit: function(value) {
			return Utils.getBit(_rights.user, this.USER_EDIT )
		},
		userCreate: function(value) {
			return Utils.getBit(_rights.user, this.USER_CREATE )
		},
		userGrantAdmin: function(value) {
			return Utils.getBit(_rights.user, this.USER_GRANTADMIN )
		},
		userQuarantine: function(value) {
			return Utils.getBit(_rights.user, this.USER_QUARANTINE )
		},

		//user requests
		user_requestView: function(value) {
			return Utils.getBit(_rights.user_request, this.USER_REQUEST_VIEW )
		},
		user_requestAccept: function(value) {
			return Utils.getBit(_rights.user_request, this.USER_REQUEST_ACCEPT )
		},
		user_requestRemove: function(value) {
			return Utils.getBit(_rights.user_request, this.USER_REQUEST_REMOVE )
		},

		//event
		eventView: function(value) {
			return Utils.getBit(_rights.event, this.EVENT_VIEW )
		},
		eventEdit: function(value) {
			return Utils.getBit(_rights.event, this.EVENT_EDIT )
		},
		eventCreate: function(value) {
			return Utils.getBit(_rights.event, this.EVENT_CREATE )
		},
		eventRemove: function(value) {
			return Utils.getBit(_rights.event, this.EVENT_REMOVE )
		},

		//group
		groupView: function(value) {
			return Utils.getBit(_rights.group, this.GROUP_VIEW )
		},
		groupEdit: function(value) {
			return Utils.getBit(_rights.group, this.GROUP_EDIT )
		},
		groupCreate: function(value) {
			return Utils.getBit(_rights.group, this.GROUP_CREATE )
		},
		groupRemove: function(value) {
			return Utils.getBit(_rights.group, this.GROUP_REMOVE )
		},

		//association
		associationView: function(value) {
			return Utils.getBit(_rights.association, this.ASSOCIATION_VIEW )
		},
		associationEdit: function(value) {
			return Utils.getBit(_rights.association, this.ASSOCIATION_EDIT )
		},
		associationCreate: function(value) {
			return Utils.getBit(_rights.association, this.ASSOCIATION_CREATE )
		},
		associationRemove: function(value) {
			return Utils.getBit(_rights.association, this.ASSOCIATION_REMOVE )
		},

		//article
		articleView: function(value) {
			return Utils.getBit(_rights.article, this.ARTICLE_VIEW )
		},
		articleEdit: function(value) {
			return Utils.getBit(_rights.article, this.ARTICLE_EDIT )
		},
		articleCreate: function(value) {
			return Utils.getBit(_rights.article, this.ARTICLE_CREATE )
		},
		articleRemove: function(value) {
			return Utils.getBit(_rights.article, this.ARTICLE_REMOVE )
		},

		//static_page
		static_pageView: function(value) {
			return Utils.getBit(_rights.static_page, this.STATIC_PAGE_VIEW )
		},
		static_pageEdit: function(value) {
			return Utils.getBit(_rights.static_page, this.STATIC_PAGE_EDIT )
		},
		static_pageCreate: function(value) {
			return Utils.getBit(_rights.static_page, this.STATIC_PAGE_CREATE )
		},
		static_pageRemove: function(value) {
			return Utils.getBit(_rights.static_page, this.STATIC_PAGE_REMOVE )
		},

		//comment 
		commentView: function(value) {
			return Utils.getBit(_rights.comment, this.COMMENT_VIEW )
		},
		commentEdit: function(value) {
			return Utils.getBit(_rights.comment, this.COMMENT_EDIT )
		},
		commentRemove: function(value) {
			return Utils.getBit(_rights.comment, this.COMMENT_REMOVE )
		},
	}

});


