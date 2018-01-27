'use strict';

/**
 *
 *
 */
angular.module('indeuApp').factory('BrugerModal', function($modal, $q) {

	var modal;
	var deferred;
	var local = this;

	local.modalInstance = ['$scope', 'ESPBA', 'Utils', 'Lookup', 'ImageUploadModal', 'DTOptionsBuilder', 'DTColumnBuilder', 'Const', 'Log', 'Login', 'user_id', 
	function($scope, ESPBA, Utils, Lookup, ImageUploadModal, DTOptionsBuilder, DTColumnBuilder, Const, Log, Login, user_id) {
		$scope.user_id = user_id || false;

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
				$scope.__brugerModal.title = 'Rediger #'+$scope.edit.id+', '+$scope.edit.first_name+' '+$scope.edit.last_name;
			})
		} else {
			$scope.__brugerModal.title = 'Opret bruger';
		}

		$scope.__brugerModal.canSave = function() {
			return $scope.edit.first_name != undefined &&
				$scope.edit.last_name != undefined &&
				$scope.edit.full_name != undefined &&
				$scope.edit.email != undefined &&
				$scope.edit.alias != undefined &&
				$scope.edit.password != undefined
				/* now handled in address
				$scope.edit.address != undefined &&
				$scope.edit.postal_code != undefined &&
				$scope.edit.city != undefined;
				*/
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
			.withOption('drawCallback', function() {
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
				/*
				{ text: '<span><i class="fa fa-plus text-success"></i>&nbsp;Ny bruger</span>',
					className: 'btn btn-xs',
					action: function(e, dt, node, config) {
						BrugerModal.show($scope).then(function() {
							$scope.dtInstance.reloadData();
						});
 					}
				}
				*/
			]);
		
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

