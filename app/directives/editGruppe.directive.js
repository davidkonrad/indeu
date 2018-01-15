'use strict';

angular.module('indeuApp')
	.directive('editGruppe', 
	function($rootScope, $q, $timeout, $location, Utils, ESPBA, Lookup, Form, ImageUploadModal, SelectBrugerModal, Notification, 
		Const, Log, Login, Settings,	DTOptionsBuilder, DTColumnBuilder, AlertModal, ConfirmModal) {

	return {
		templateUrl: "views/inc/editGruppe.directive.html",
		restrict: 'A',
		transclude: true,
		scope: {
			editProfile: '@',
			onSave: '&',
			onCancel: '&'
		},
		replace: true,

		controller: function($scope) {
			Settings.init($scope);

			$scope.edit = {
				id: false,
				name: '',
				about: '',
				visibility_level: '1',
				access_level: '1',
				owner_id: Login.currentUser().id,
				events_enabled: '1',
				articles_enabled: '1',
				visible_social_media: '1',
				visible_members: '1',
				comments_enabled: '1',
				active: '1',
				accepted: '1'
			};

			$scope.owner_btn_caption = Lookup.getUser( Login.currentUser().id ).full_name;
			$scope.save_btn_caption = 'Opret og gem';
			$scope.header = 'Opret ny gruppe';

			$scope.changed = false;

			$scope.formSaveEnabled = function(formId) {
				return Form.isEdited(formId) && $scope.edit.id;
			}

			$scope.canSave = function() {
				var e = $scope.edit;
				if (!e) return false;
				return e.name !='' && e.about !='' && e.visibility_level !='' && e.owner_id !=''
			}

			$scope.formSave = function(formId) {
				var params = Form.toObj(formId);
				params.id = $scope.edit.id;
				ESPBA.update('group', params).then(function() {
					Log.log({
						type: Log.GROUP_EDITED,
						hash: $scope.edit.hash,
						user_id: Login.currentUser().id
					});
					Form.reset(formId);
				})
			}

			$scope.selectOwner = function() {
				SelectBrugerModal.show($scope, false, $scope.edit.owner_id).then(function(owner) {
					if (owner) {
						$scope.edit.owner_id = owner.id;
						$scope.owner_btn_caption = owner.full_name;
					}
				})
			}
			
			//group members
			$scope.dtOptions = DTOptionsBuilder
				.fromFnPromise(function() {
					var defer = $q.defer();
					ESPBA.get('group_user', { group_id: $scope.edit.id }).then(function(r) {
						$scope.data = [];
						$scope.current_user_ids = [];
						for (var i=0,l=r.data.length;i<l;i++) {
							$scope.data.push(Lookup.getUser(r.data[i].user_id));
							$scope.current_user_ids.push(r.data[i].user_id);
						}	
						defer.resolve($scope.data);
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
							SelectBrugerModal.show($scope, false, $scope.current_user_ids).then(function(user) {
								if (user) {
									ESPBA.insert('group_user', { group_id: $scope.edit.id, user_id: user.id }).then(function() {
										$scope.dtInstance.reloadData();
									})
								}
							});
	 					}
					}
				]);

			$scope.dtInstanceCallback = function(instance) {
				$scope.dtInstance = instance
			}

			$scope.dtColumns = [
	      DTColumnBuilder.newColumn('id')
					.withTitle('#')
					.renderWith(function(data, type, full) {
						if (type === 'display') {
							if (data != $scope.edit.owner_id) {
								return '<i class="fa fa-remove text-danger remove-medlem" data-user-id="'+data+'" title="Fjern medlem"></i>'
							} else {
								return '<i class="fa fa-user text-primary"></i>'
							}
						} else {
							return data;
						}
					}),					
	      DTColumnBuilder.newColumn('full_name').withTitle('Navn'),
	      DTColumnBuilder.newColumn('alias').withTitle('Alias'),
	      DTColumnBuilder.newColumn('email').withTitle('Email')
			];

			$('body').on('click', '.remove-medlem', function() {
				var user_id = $(this).data('user-id');
				if (user_id == $scope.edit.owner_id) {
					AlertModal.show('Gruppeejeren kan ikke fjernes fra medlemslisten', 'No can do');
					return
				}
				ConfirmModal.show('Fjern medlem fra gruppe?').then(function(answer) {
					if (answer) {
						ESPBA.delete('group_user', { group_id: $scope.edit.id, user_id: user_id }).then(function() {
							$scope.dtInstance.reloadData();
						})
					}
				})
			});
		},


		link: function(scope, element, attrs) {

			var onSave = attrs['onSave'] || false;
			var onCancel = attrs['onCancel'] || false;
			
			attrs.$observe('editGruppe', function(newVal) {
				scope.edit.id = attrs['editGruppe'];
				
				if (parseInt(scope.edit.id)) ESPBA.get('group', { id: scope.edit.id }).then(function(u) {
					scope.save_btn_caption = 'Gem og luk';
					scope.header = 'Rediger gruppe';
					scope.edit = u.data[0];
					scope.$watch('edit.about', function(newVal, oldVal) {
						if (newVal && newVal != oldVal) scope.changed = true
					}, true);
				})
			});

			scope.doSaveClose = function() {
				if (scope.edit.id) {
					ESPBA.update('group', scope.edit).then(function(g) {
						$rootScope.$emit('indeu.groupChange');
						Notification('Gruppe opdateret ...');
						if (onSave) scope.onSave();
						Log.log({
							type: Log.GROUP_EDITED,
							hash: scope.edit.hash,
							user_id: Login.currentUser().id
						});
					})
				} else {
					scope.edit.hash = Utils.getHash();
					scope.active = true;
					scope.accepted = true;
					ESPBA.insert('group', scope.edit).then(function(g) {
						$rootScope.$emit('indeu.groupChange');
						g = g.data[0];
						Notification('Gruppen <strong>'+g.name+'</strong> er oprettet');
						if (onSave) scope.onSave();
						Log.log({
							type: Log.GROUP_CREATED,
							hash: g.hash,
							user_id: Login.currentUser().id
						});

						//add user as group member
						ESPBA.insert('group_user', { user_id: Login.currentUser().id, group_id: g.id }).then(function(u) {
							Log.log({
								type: Log.GROUP_MEMBER_ADDED,
								hash: g.hash,
								user_id: Login.currentUser().id
							})
							Notification('Du følger nu gruppen <strong>'+g.name+'</strong>');

							//jump to group immediately
							$timeout(function() {
								$location.path( Utils.gruppeUrl(g.id, g.name).replace('/#/', '') );
							})
						})

					})
				} 
			}

			scope.doCancel = function() {
				if (onCancel) scope.onCancel();
			}
					
		}
	}
});


