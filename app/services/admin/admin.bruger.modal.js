'use strict';

/**
 *
 *
 */
angular.module('indeuApp').factory('BrugerModal', function($modal, $q) {

	var modal;
	var deferred;
	var local = this;

	local.modalInstance = ['$scope', '$timeout', 'ESPBA', 'Utils', 'Lookup', 'ImageUploadModal', 'DTOptionsBuilder', 'DTColumnBuilder', 'Const', 'Log', 'Login', 'AdminRights', 'AdminRightsUpdater', 'user_id', 
	function($scope, $timeout, ESPBA, Utils, Lookup, ImageUploadModal, DTOptionsBuilder, DTColumnBuilder, Const, Log, Login, AdminRights, AdminRightsUpdater, user_id) {

		$scope.adminRights = AdminRights.dictionary();

		$scope.user_id = user_id || false;
		$scope.is_self = user_id == Login.currentUser().id && Login.currentUser().id != 1;

		$scope.brugerModalClose = function(value) {

			function close() {
				modal.hide();
				modal.destroy();
				modal = null;
	      deferred.resolve(value)
			}

			if (value) {
				if (user_id) {
					$scope.__addressSave();
					ESPBA.update('user', $scope.edit).then(function(r) {
						Log.log({
							type: Log.USER_EDITED_BY_ADMIN,
							user_id: Login.currentUser().id,
							hash: $scope.edit.hash
						});
						$scope.updateAdminRights();
						close()
					})
				} else {
					$scope.edit.hash = Utils.getHash();
					ESPBA.insert('user', $scope.edit).then(function(r) {
						Log.log({
							type: Log.USER_CREATED_BY_ADMIN,
							user_id: Login.currentUser().id,
							hash: $scope.edit.hash
						});
						close()
					})
				}
			} else {
				close()
			}
		};

		$scope.__brugerModal = {
			btnOk: user_id ? 'Gem og luk' : 'Opret bruger og luk'
		};

		$scope.edit = {};
		if (user_id) {
			ESPBA.get('user', { id: user_id }).then(function(r) {
				$scope.edit = r.data[0];
				Utils.debugObj($scope.edit);
				$scope.__brugerModal.title = 'Rediger #'+$scope.edit.id+', '+$scope.edit.first_name+' '+$scope.edit.last_name;

				if ($scope.edit.role == 2) {
					AdminRightsUpdater.loadUser($scope.edit.id, true).then(function(dict) {
						$scope.edit_admin_rights = dict
					})
				} else {
					//get or create AdminRights if the user role changes
					$scope.$watch('edit.role', function(newVal, oldVal) {
						if (newVal != oldVal && newVal == 2) {
							AdminRightsUpdater.loadUser($scope.edit.id, true).then(function(dict) {
								$scope.edit_admin_rights = dict
							})
						}
					})
				}
			})
		} else {
			$scope.__brugerModal.title = 'Opret bruger';
		}

		$scope.canSave = function() {
			if (!AdminRights.userEdit()) return false;
			return $scope.edit.first_name != undefined &&
				$scope.edit.last_name != undefined &&
				$scope.edit.full_name != undefined &&
				$scope.edit.email != undefined &&
				$scope.edit.alias != undefined &&
				$scope.edit.password != undefined
		};

		//grupper
		$scope.dtColumns_grupper = [
      DTColumnBuilder.newColumn('id')
				.withTitle('#')
				.withClass('no-click')
				.notSortable()
				.renderWith(function(data, type, full, meta) {
					if (type === 'display') {
						return '<a href="#/grupper/'+full.id+'/'+Utils.urlName(full.name)+'"><i class="fa fa-eye"></i></a>'
					} else {
						return data;
					}
				}),

      DTColumnBuilder.newColumn('name').withTitle('Navn'),
      DTColumnBuilder.newColumn('owner_id')
				.withTitle('Ejer')
				.withClass('text-center')
				.renderWith(function(data, type, full, meta) {
					if (type === 'display') {
						return data == user_id ? '<i class="fa fa-check"></i>' : ''
					} else {
						return data;
					}
				}),

      DTColumnBuilder.newColumn('created_timestamp').withTitle('Oprettet'),
		];

		$scope.dtOptions_grupper = DTOptionsBuilder
			.fromFnPromise(function() {
				return Lookup.getGroupsByUser(user_id)
	    })
			.withOption('rowCallback', function(row, data /*, index*/) {
				$(row).attr('user-id', data.id);
			})
			.withOption('dom', 'Blfrtip')
			.withOption('stateSave', true)
			.withOption('language', Const.dataTables_daDk )
			.withButtons([ 
				{ extend : 'colvis',
					text: 'Vis kolonner &nbsp;<i class="caret" style="position:relative;top:-3px;"></i>',
					className: 'btn btn-default btn-xs colvis-btn'
				},
			]);


		$scope.updateAdminRights = function() {
			if (!$scope.edit_admin_rights) return;

			AdminRightsUpdater.frontpageView( $scope.edit_admin_rights.frontpageView );
			AdminRightsUpdater.frontpageUpdate( $scope.edit_admin_rights.frontpageUpdate );

			AdminRightsUpdater.userView( $scope.edit_admin_rights.userView );
			AdminRightsUpdater.userEdit( $scope.edit_admin_rights.userEdit );
			AdminRightsUpdater.userCreate( $scope.edit_admin_rights.userCreate );
			AdminRightsUpdater.userGrantAdmin( $scope.edit_admin_rights.userGrantAdmin );
			AdminRightsUpdater.userQuarantine( $scope.edit_admin_rights.userQuarantine );

			AdminRightsUpdater.user_requestView( $scope.edit_admin_rights.user_requestView );
			AdminRightsUpdater.user_requestAccept( $scope.edit_admin_rights.user_requestAccept );
			AdminRightsUpdater.user_requestRemove( $scope.edit_admin_rights.user_requestRemove );

			AdminRightsUpdater.eventView( $scope.edit_admin_rights.eventView );
			AdminRightsUpdater.eventEdit( $scope.edit_admin_rights.eventEdit );
			AdminRightsUpdater.eventCreate( $scope.edit_admin_rights.eventCreate );
			AdminRightsUpdater.eventRemove( $scope.edit_admin_rights.eventRemove );

			AdminRightsUpdater.groupView( $scope.edit_admin_rights.groupView );
			AdminRightsUpdater.groupEdit( $scope.edit_admin_rights.groupEdit );
			AdminRightsUpdater.groupCreate( $scope.edit_admin_rights.groupCreate );
			AdminRightsUpdater.groupRemove( $scope.edit_admin_rights.groupRemove );

			AdminRightsUpdater.associationView( $scope.edit_admin_rights.associationView );
			AdminRightsUpdater.associationEdit( $scope.edit_admin_rights.associationEdit );
			AdminRightsUpdater.associationCreate( $scope.edit_admin_rights.associationCreate );
			AdminRightsUpdater.associationRemove( $scope.edit_admin_rights.associationRemove );

			AdminRightsUpdater.articleView( $scope.edit_admin_rights.articleView );
			AdminRightsUpdater.articleEdit( $scope.edit_admin_rights.articleEdit );
			AdminRightsUpdater.articleCreate( $scope.edit_admin_rights.articleCreate );
			AdminRightsUpdater.articleRemove( $scope.edit_admin_rights.articleRemove );

			AdminRightsUpdater.static_pageView( $scope.edit_admin_rights.static_pageView );
			AdminRightsUpdater.static_pageEdit( $scope.edit_admin_rights.static_pageEdit );
			AdminRightsUpdater.static_pageCreate( $scope.edit_admin_rights.static_pageCreate );
			AdminRightsUpdater.static_pageRemove( $scope.edit_admin_rights.static_pageRemove );

			AdminRightsUpdater.commentView( $scope.edit_admin_rights.commentView );
			AdminRightsUpdater.commentEdit( $scope.edit_admin_rights.commentEdit );
			AdminRightsUpdater.commentRemove( $scope.edit_admin_rights.commentRemove );

			//...
			$timeout(function() {
				AdminRightsUpdater.updateUser();
			})
		}
	}];

	return {

		show: function(user_id) {
			deferred = $q.defer()

			modal = $modal({
				templateUrl: 'views/admin/admin.bruger.modal.html',
				backdrop: 'static',
				show: true,
				keyboard: false,
				controller: local.modalInstance,
				locals: { user_id: user_id }
			});

			angular.element('body').on('keydown', function(e) {
				if (e.charCode == 27) $scope.brugerModalClose(false)
			});

      return deferred.promise;
		}

	}

});

