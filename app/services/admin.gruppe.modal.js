'use strict';

/**
 *
 *
 */
angular.module('indeuApp').factory('GruppeModal', 
	function($modal, $q, ESPBA, Lookup, Const, Utils, SelectBrugerModal, DTOptionsBuilder, DTColumnBuilder, DTDefaultOptions, 
					ImageUploadModal, Login, Log) {

	var deferred = null;
	var modal = null;

	return {

		isShown: function() {
			return modal != null;
		},
		show: function($scope, group_id) {
			deferred = $q.defer()

			$scope.accessLevels = Lookup.accessLevels();
			$scope.visibilityLevels = Lookup.visibilityLevels();

			$scope.__gruppeModal = {
				btnOk: group_id ? 'Gem og luk' : 'Opret gruppe og luk'
			};

			$scope.edit = {};
			if (group_id) {
				ESPBA.get('group', { id: group_id }).then(function(r) {
					$scope.edit = r.data[0];
					$scope.edit.access_level = parseInt($scope.edit.access_level);
					$scope.edit.visibility_level = parseInt($scope.edit.visibility_level);
					$scope.__gruppeModal.title = 'Rediger <span class="text-muted">#'+$scope.edit.id+'</span>, <strong>'+$scope.edit.name+'</strong>';
					if ($scope.edit.owner_id) {
						$scope.__gruppeModal.owner_btn_caption = Lookup.getUser($scope.edit.owner_id).full_name
					} else {
						$scope.__gruppeModal.owner_btn_caption = 'Vælg gruppeejer';
					}
				})
			} else {
				$scope.__gruppeModal.title = 'Opret gruppe';
				$scope.__gruppeModal.create = true;
			}

			$scope.__gruppeModal.canSave = function() {
				//console.log('gruppe cansave', $scope.edit);
				return $scope.edit.name != undefined &&
					$scope.edit.owner_id != undefined &&
					$scope.edit.visibility_level != undefined &&
					$scope.edit.access_level != undefined;
			};

			$scope.__gruppeModal.selectOwner = function() {
				SelectBrugerModal.show($scope, false, $scope.edit.owner_id).then(function(owner) {
					if (owner) {
						$scope.edit.owner_id = owner[0].id;
						$scope.__gruppeModal.owner_btn_caption = owner[0].full_name;
					}
				})
			}

			$scope.__gruppeModal.medlemmer = {};
			$scope.__gruppeModal.medlemmer.dtOptions = DTOptionsBuilder
				.fromFnPromise(function() {
					var defer = $q.defer();
					ESPBA.get('group_user', { group_id: $scope.edit.id }).then(function(r) {
						$scope.__gruppeModal.medlemmer.data = [];
						$scope.__gruppeModal.medlemmer.current_user_ids = [];
						for (var i=0,l=r.data.length;i<l;i++) {
							$scope.__gruppeModal.medlemmer.data.push(Lookup.getUser(r.data[i].user_id));
							$scope.__gruppeModal.medlemmer.current_user_ids.push(r.data[i].user_id);
						}	
						defer.resolve($scope.__gruppeModal.medlemmer.data);
					});
					return defer.promise;
		    })
				.withOption('drawCallback', function() {
				})
				.withOption('scrollY', 200)
				.withOption('paging', false)
				.withOption('rowCallback', function(row, data /*, index*/) {
					$(row).attr('user-id', data.id);
				})
				.withOption('dom', 'ft')
				.withOption('stateSave', true)
				.withOption('language', Const.dataTables_daDk )
				.withButtons([ 
					{ text: '<span><i class="fa fa-plus text-success"></i>&nbsp;Tilføj medlem</span>',
						className: 'btn btn-xs',
						action: function( /* e, dt, node, config */) {
							SelectBrugerModal.show($scope, false, $scope.__gruppeModal.medlemmer.current_user_ids).then(function(user) {
								if (user) {
									ESPBA.insert('group_user', { group_id: group_id, user_id: user[0].id }).then(function() {
										$scope.__gruppeModal.medlemmer.dtInstance.reloadData();
									})
								}
							});
	 					}
					}
				]);

			$scope.__gruppeModal.medlemmer.dtInstanceCallback = function(instance) {
				$scope.__gruppeModal.medlemmer.dtInstance = instance
			}

			$scope.__gruppeModal.medlemmer.dtColumns = [
	      DTColumnBuilder.newColumn('id')
					.withTitle('#')
					.renderWith(function(data, type, full) {
						if (type === 'display') {
							return '<i class="fa fa-remove text-danger remove-medlem" data-user-id="'+data+'" title="Fjern medlem"></i>'
						} else {
							return data;
						}
					}),					
	      DTColumnBuilder.newColumn('full_name').withTitle('Navn'),
	      DTColumnBuilder.newColumn('alias').withTitle('Alias'),
	      DTColumnBuilder.newColumn('email').withTitle('Email')
			];

			$('body').on('click', '.remove-medlem', function() {
				if (confirm('Fjern medlem fra gruppe?')) {
					ESPBA.delete('group_user', { group_id: group_id, user_id: $(this).data('user-id') }).then(function() {
						$scope.__gruppeModal.medlemmer.dtInstance.reloadData();
					})
				}
			});

			modal = $modal({
				scope: $scope,
				templateUrl: 'views/admin.gruppe.modal.html',
				backdrop: 'static',
				show: false,
				keyboard: false
			});

			$scope.disableMedlemmerTab = function() {
				if ($scope.__gruppeModal.create) return true;
				if ($scope.edit.access_level != Const.ACCESS_LEVEL_CLOSED) return true;
				return false;
			}

			modal.$promise.then(function() {
				//console.log('modal promise');
			});

			modal.$promise.then(modal.show).then(function() {
				//console.log('modal show');
			});

			$scope.__gruppeModal.uploadImage = function() {
				ImageUploadModal.show($scope, 'gruppe').then(function(image) {
					if (image) {
						$scope.edit.image = image.filename;
					}
				});
			}

			$scope.gruppeModalClose = function(value) {

				function close() {
					modal.hide();
					modal.destroy();
					modal = null;
					delete $scope.__gruppeModal;
		      deferred.resolve(value)
				}

				if (value) {
					if (group_id) {
						ESPBA.update('group', $scope.edit).then(function(r) {
							Log.log({
								type: Log.GROUP_EDITED,
								user_id: Login.currentUser().id,
								hash: $scope.edit.hash
							});
							close();
						})
					} else {
						$scope.edit.hash = Utils.getHash();
						ESPBA.insert('group', $scope.edit).then(function(r) {
							Log.log({
								type: Log.GROUP_CREATED,
								user_id: Login.currentUser().id,
								hash: r.data[0].hash
							});
							close();
						})
					}
				} else {
					close()
				}
			};

			angular.element('body').on('keydown', function(e) {
				if (e.charCode == 27) $scope.gruppeModalClose(false)
			});

      return deferred.promise;
		}

	}

});
