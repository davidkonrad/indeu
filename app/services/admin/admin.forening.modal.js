'use strict';

/**
 *
 *
 */
angular.module('indeuApp').factory('ForeningModal', function($modal, $q) {

	var deferred = null;
	var modal = null;
	var local = this;

	local.modalInstance = ['$scope', 'ESPBA', 'Lookup', 'Utils', 'Login', 'Const', 'Log', 'SelectBrugerModal', 'SelectGruppeModal', 'DTOptionsBuilder', 'DTColumnBuilder', 'association_id', 
	function($scope, ESPBA, Lookup, Utils, Login, Const, Log, SelectBrugerModal, SelectGruppeModal, DTOptionsBuilder, DTColumnBuilder, association_id) {

		const id = association_id || false;

		$scope.accessLevels = Lookup.accessLevels();
		$scope.visibilityLevels = Lookup.visibilityLevels();

		$scope.btnOk = id ? 'Gem og luk' : 'Opret forening og luk';
		$scope.group_btn_caption = 'Vælg gruppe';
		$scope.owner_btn_caption = 'Vælg ejer';
		$scope.edit = {};

		if (id) {
			ESPBA.get('association', { id: id }).then(function(r) {
				$scope.edit = r.data[0];
				Utils.debugObj($scope.edit);

				$scope.edit.visibility_level = parseInt($scope.edit.visibility_level);
				$scope.title = 'Rediger <span class="text-muted">#'+$scope.edit.id+'</span>, <strong>'+$scope.edit.name+'</strong>';

				if (parseInt($scope.edit.owner_id)) {
					$scope.owner_btn_caption = Lookup.getUser($scope.edit.owner_id).full_name
				} else {
					$scope.owner_btn_caption = 'Sæt foreningens ejer (admin)'
				}

			})
		} else {
			$scope.title = 'Opret ny forening';
			$scope.create = true;

			$scope.edit.user_id = Login.currentUser().id;
			$scope.edit.owner_id = Login.currentUser().id;
			$scope.owner_btn_caption = Login.currentUser().full_name;
		};

		$scope.canSave = function() {
			return $scope.edit.owner_id != undefined &&	
				$scope.edit.name != undefined &&
				$scope.edit.visibility_level != undefined
		};

		$scope.selectOwner = function() {
			SelectBrugerModal.show($scope, false, $scope.edit.author_id).then(function(owner) {
				if (owner) {
					$scope.edit.owner_id = owner.id;
					$scope.owner_btn_caption = owner.full_name;
				}
			})
		}

		/* medlemmer */
		$scope.medlemmer = {};
		$scope.medlemmer.dtInstanceCallback = function(instance) {
			$scope.medlemmer.dtInstance = instance;
    };

		$scope.medlemmer.dtColumns = [
      DTColumnBuilder.newColumn('id')
				.withTitle('')
				.notSortable()
				.withClass('no-click text-center')
				.renderWith(function(data, type, full) {
					if (type === 'display') {
						return '<a href="'+Utils.userUrl(full.id, full.full_name)+'" target=_blank><i class="fa fa-eye"></i></a>'
					} else {
						return data;
					}
				}),
      DTColumnBuilder.newColumn('full_name')
				.withTitle('Navn'),
      DTColumnBuilder.newColumn('email')
				.withTitle('Email'),
      DTColumnBuilder.newColumn(null)
				.notSortable()
				.withClass('no-click text-center')
				.renderWith(function(data, type, full) {
					return '<i class="fa fa-remove text-danger btn-remove-member" association-user-id="'+full.id+'" user-id="'+full.user_id+'" title="Fjern bruger som medlem"></i>'
				})
		];

		$scope.medlemmer.dtOptions = DTOptionsBuilder
			.fromFnPromise(function() {
				var defer = $q.defer();
				ESPBA.get('association_user', { association_id: association_id }).then(function(res) {
					var current = [];
					res.data.forEach(function(d) {
						current.push(d.user_id);
						var u = Lookup.getUser(d.user_id);
						d.email = u.email;
						d.full_name = u.full_name;
					})
					$scope.current_members = current;
					defer.resolve(res.data);
				});
				return defer.promise;
	    })
			.withOption('dom', 'Blfrtip')
			.withOption('stateSave', true)
			.withOption('language', Const.dataTables_daDk )
			.withButtons([ 
				{ text: '<span><i class="fa fa-plus text-success"></i>&nbsp;Medlem</span>',
					className: 'btn btn-xs',
					action: function( /* e, dt, node, config */) {
						SelectBrugerModal.show($scope, false, $scope.current_members).then(function(u) {
							if (u) {
								if (u.length) u = u[0];
								ESPBA.insert('association_user', { association_id: association_id, user_id: u.id }).then(function() {
									Log.log({
										type: Log.ASSOCIATION_MEMBER_ADDED,
										user_id: Login.currentUser().id,
										context_user_id: u.id,
										hash: $scope.edit.hash
									})
									$scope.medlemmer.dtInstance.reloadData();
								})
							}
						});
 					}
				}
			]);

		$('body').on('click', '.btn-remove-member', function() {
			var id = $(this).attr('association-user-id');
			if (id) {
				if (confirm('Er du sikker på du vil fjerne dette medlem?')) {
					var user_id = $(this).attr('user-id');
					ESPBA.delete('association_user', { id: id } ).then(function() {
						Log.log({
							type: Log.ASSOCIATION_MEMBER_REMOVED,
							user_id: Login.currentUser().id,
							context_user_id: user_id,
							hash: $scope.edit.hash
						})
						$scope.medlemmer.dtInstance.reloadData();
					})
				}
			}
		})


/* groups */
/*
			$scope.__forModal.reloadGroups = function() {
				ESPBA.get('group_articles', { association_id: association_id }).then(function(gr) {
					gr.data.forEach(function(g) {
						g.name = Lookup.getGroup(g.group_id).name;
					});
					$scope.__forModal.article_groups = gr.data;
				})
			}
			$scope.__forModal.reloadGroups();

			$scope.__forModal.removeGroup = function(id) {
				ESPBA.delete('group_articles', { id: id }).then(function() {
					$scope.__forModal.reloadGroups();
				});
			}

			$scope.__forModal.addGroup = function() {
				var ids = $scope.__forModal.article_groups.map(function(g) {
					return g.group_id
				});
				SelectGruppeModal.show($scope, false, ids).then(function(group) {
					if (group) {
						ESPBA.insert('group_articles', { association_id: association_id, group_id: group[0].id}).then(function(g) {
							$scope.__forModal.reloadGroups();
						});
					}
				})
			}
*/


/* save, update, cancel */
		$scope.modalClose = function(value) {

			function close(ret) {
				modal.hide();
				modal.destroy();
				modal = null;
				delete $scope.__forModal;
	      deferred.resolve(ret)
			}

			if (value) {
				if (association_id) {
					$scope.__addressSave();
					$scope.__socialMediaSave();
					ESPBA.update('association', $scope.edit).then(function(r) {
						//we should probably sanity check
						r = r.data[0];
						Log.log({
							type: Log.ASSOCIATION_EDITED,
							user_id: Login.currentUser().id,
							hash: r.hash
						})
						close(r)
					})
				} else {
					$scope.edit.hash = Utils.getHash();
					ESPBA.insert('association', $scope.edit).then(function(r) {
						r = r.data[0];
						Log.log({
							type: Log.ASSOCIATION_CREATED,
							user_id: Login.currentUser().id,
							hash: r.hash
						})
						close(r)
					})
				}
			} else {
				close(false)
			}
		};

	}];


	return {
		show: function(association_id) {
			deferred = $q.defer()
			modal = $modal({
				controller: local.modalInstance,				
				templateUrl: 'views/admin/admin.forening.modal.html',
				backdrop: 'static',
				show: true,
				keyboard: false,
				locals: {
					association_id: association_id
				}				
			});
      return deferred.promise;
		}
	}

});
