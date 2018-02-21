'use strict';

/**
 *
 *
 */
angular.module('indeuApp').factory('EventModal', function($modal, $q) {

	var modal;
	var deferred;
	var local = this;

	local.modalInstance = ['$scope', '$timeout', 'ESPBA', 'KR', 'Login', 'Lookup', 'Utils', 'Const', 'SelectBrugerModal', 'DTOptionsBuilder', 'DTColumnBuilder', 'ConfirmModal', 'event_id', 
	function($scope, $timeout, ESPBA, KR, Login, Lookup, Utils, Const, SelectBrugerModal, DTOptionsBuilder, DTColumnBuilder, ConfirmModal, event_id) {

		$scope.eventTypes = Lookup.eventTypes();
		$scope.visibilityLevels = Lookup.visibilityLevels();

		$scope.__eventModal = {
			btnOk: event_id ? 'Gem og luk' : 'Opret event og luk',
		};

		$scope.user_btn_caption ='Vælg bruger';

		$scope.edit = {};
		if (event_id) {
			ESPBA.get('event', { id: event_id }).then(function(r) {
				$scope.edit = r.data[0];
				Utils.debugObj($scope.edit);

				$scope.edit.visibility_level = $scope.edit.visibility_level;
				$scope.edit.event_type_id = $scope.edit.event_type_id;
				$scope.edit.from = Utils.createTime( $scope.edit.from );
				$scope.edit.to = Utils.createTime( $scope.edit.to );

				$scope.__eventModal.title = 'Rediger event <span class="text-muted">#'+$scope.edit.id+'</span>, <strong>'+$scope.edit.name+'</strong>';
				if ($scope.edit.user_id) {
					$scope.user_btn_caption = Lookup.getUser($scope.edit.user_id).full_name
				} 
			})
		} else {
			$scope.__eventModal.title = 'Opret en ny event';
			$scope.__eventModal.create = true;
			$scope.edit.user_id = Login.currentUser().id;
			$scope.user_btn_caption = Lookup.getUser($scope.edit.user_id).full_name
		}

		$scope.canSave = function() {
			return $scope.edit.address != undefined &&
				$scope.edit.user_id != undefined &&
				$scope.edit.name != undefined &&
				$scope.edit.date != undefined &&
				$scope.edit.visibility_level != undefined &&
				$scope.edit.from != undefined;
		};

		$scope.__eventModal.selectUser = function() {
			SelectBrugerModal.show($scope, false, $scope.edit.user_id).then(function(user) {
				if (user) {
					$scope.edit.user_id = user[0].id;
					$scope.user_btn_caption = user[0].full_name;
				}
			})
		}

		$scope.dtInstanceCPCallback = function(instance) {
			$scope.dtInstanceCP = instance;
    };

		var current_contactpersons = [];

		$scope.dtOptionsCP = DTOptionsBuilder
			.fromFnPromise(function() {
				var defer = $q.defer();
				ESPBA.prepared('EventContactPersons', { event_id: event_id }).then(function(r) {
					current_contactpersons = [];
					r.data.forEach(function(u) {
						current_contactpersons.push(u.user_id)
					})
					defer.resolve(r.data);
				});
				return defer.promise;
	    })
			.withOption('scrollY', 200)
			.withOption('paging', false)
			.withOption('dom', 'ft')
			.withOption('stateSave', true)
			.withOption('language', Const.dataTables_daDk )
			.withButtons([ 
				{ text: '<span><i class="fa fa-plus text-success"></i>&nbsp;Tilføj kontaktperson</span>',
					className: 'btn btn-xs',
					action: function() {
						SelectBrugerModal.show($scope, false, current_contactpersons).then(function(user) {
							if (user) {
								ESPBA.insert('event_contactperson', { event_id: event_id, user_id: user.id }).then(function(r) {
									$scope.dtInstanceCP.reloadData();
								})
							}
						});
 					}
				}
			]);

		$scope.dtColumnsCP = [
      DTColumnBuilder.newColumn('id').withTitle('#').notSortable().renderWith(function(data) {
				return '<button class="btn btn-xs btn-danger remove-contactperson" id="'+data+'"><i class="fa fa-times"></i></button>';
			}),
      DTColumnBuilder.newColumn('full_name').withTitle('Fulde navn'),
      DTColumnBuilder.newColumn('alias').withTitle('Alias'),
      DTColumnBuilder.newColumn('email').withTitle('Email')
		];

		$scope.adresseClick = function() {
			var item = $('#adresse').data('item');			
			if (item) {
				$('#adresse').val( item.streetName+' ');
				$('#adresse').trigger('keyup');
			}
		}

		$scope.adresseSelect = function(item) {
			if (item) {
				$scope.edit.city = item.districtSubDivisionIdentifier || item.districtName;
				$scope.edit.lat = item.x;
				$scope.edit.lng = item.y;
				$scope.edit.postal_code = item.postCodeIdentifier;
				$timeout(function() {
					$scope.$apply();
				})
			}
		}

		$scope.eventModalClose = function(value) {

			function close() {
				modal.hide();
				modal.destroy();
				modal = null;
				delete $scope.__eventModal;
	      deferred.resolve(value)
			}

			if (value) {
				if (user_id) {
					ESPBA.update('event', $scope.edit).then(function(r) {
						close()
					})
				} else {
					$scope.edit.hash = Utils.getHash();
					ESPBA.insert('event', $scope.edit).then(function(r) {
						close()
					})
				}
			} else {
				close()
			}
		};

		$('body').on('click', '.remove-contactperson', function(e) {
			e.stopPropagation();
			var data = $scope.dtInstanceCP.DataTable.row( $(this).closest('tr') ).data();
			ConfirmModal.show('Fjern <strong>'+data.full_name+'</strong> som kontaktperson?').then(function(answer) {
				if (answer) {
					ESPBA.delete('event_contactperson', { id: data.id }).then(function() {
						$scope.dtInstanceCP.reloadData()
					})
				}
			})
		});

	}];

	return {

		show: function(event_id) {
			deferred = $q.defer()
			modal = $modal({
				templateUrl: 'views/admin/admin.event.modal.html',
				backdrop: 'static',
				show: true,
				keyboard: false,
				controller: local.modalInstance,
				locals: { event_id: event_id }
			});
      return deferred.promise;
		}

	}

});
