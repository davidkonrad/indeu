'use strict';

angular.module('indeuApp')
	.directive('editGruppe', 
	function($q, Utils, ESPBA, Lookup, Form, ImageUploadModal, SelectBrugerModal, Notification, Const, Log, Login, Settings,
					DTOptionsBuilder, DTColumnBuilder, DTDefaultOptions) {

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
				id: -1,
				name: '',
				about: '',
				visibility_level: 1,
				access_level: 1,
				owner_id: Login.currentUser().id,
				events_enabled: 1,
				articles_enabled: true,
				visible_social: true,
				visible_members: 1,
				allow_comments: true,
				active: true,
				accepted: true,
				
			};

			$scope.owner_btn_caption = Lookup.getUser( Login.currentUser().id ).full_name;
			$scope.save_btn_caption = 'Opret og gem';

			$scope.changed = false;

			$scope.formSaveEnabled = function(formId) {
				return Form.isEdited(formId)
			}

			$scope.canSave = function() {
				var e = $scope.edit;// || {};
				if (!e) return false;
				//console.log(e);
				return e.name !='' && e.about !='' && e.visibility_level !='' && e.owner_id !=''
			}

			$scope.formSave = function(formId) {
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
									ESPBA.insert('group_user', { group_id: group_id, user_id: user[0].id }).then(function() {
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
						$scope.dtInstance.reloadData();
					})
				}
			});


		},


		link: function(scope, element, attrs) {

			var onSave = attrs['onSave'] || false;
			var onCancel = attrs['onCancel'] || false;
			
			attrs.$observe('editGruppe', function(newVal) {
				scope.edit.id = attrs['editGruppe'];
				console.log(scope.edit.id);
				if (parseInt(scope.edit.id)) ESPBA.get('group', { id: scope.edit.id }).then(function(u) {
					//test for errors
					console.log('GROUP LOAD!!!!');
					scope.edit = u.data[0];

					scope.$watch('edit.about', function(newVal, oldVal) {
						if (newVal && newVal != oldVal) scope.changed = true
					}, true);
				
					//$('.panel-collapse:not(".in")').collapse('show');
				})
			});

			scope.doSaveClose = function() {
				if (scope.edit.id) {
					ESPBA.update('group', scope.edit).then(function(g) {
						console.log(g);
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
					ESPBA.insert('group', scope.edit).then(function(g) {
						g = g.data[0];
						Notification('Gruppen <strong>'+g.name+'</strong> er oprettet.');
						if (onSave) scope.onSave();
						Log.log({
							type: Log.GROUP_CREATED,
							hash: g.hash,
							user_id: Login.currentUser().id
						});

						//add user as group member
						ESPBA.insert('group_user', { user_id: Login.currentUser().id, group_id: g.id }).then(function(x) {
							Log.log({
								type: Log.GROUP_MEMBER_ADDED,
								hash: g.hash,
								user_id: Login.currentUser().id
							})
							Notification('Du følger nu gruppen <strong>'+g.name+'</strong>');
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


