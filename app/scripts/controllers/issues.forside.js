'use strict';

/**
 *
 *
 */
angular.module('indeuApp').controller('IssuesForsideCtrl', 
	function($scope, $location, $q, ESPBA, Utils, Lookup, Const, DTOptionsBuilder, DTColumnBuilder, Meta, Redirect, Login) {

	var issueLabels = [];
	ESPBA.get('issue_label', {}).then(function(r) {
		r.data.forEach(function(l) {
			l.item = '<button class="btn btn-xs" style="margin-right:5px;color:white;font-weight:bold;background-color:'+l.color+';">'+l.name+'</button>'
		})
		issueLabels = r.data
	})
	function getLabelButton(id) {
		for (var i=0, l=issueLabels.length; i<l; i++) {
			if (issueLabels[i].id == id) return issueLabels[i].item
		}
		return ''
	}

	Meta.setTitle('Issues');
	var current_user = Login.currentUser();

	$scope.dtInstance = {};
	$scope.dtInstanceCallback = function(instance) {
		$scope.dtInstance = instance
	}

	$scope.dtColumns = [
		DTColumnBuilder.newColumn('id')
		.withTitle('')
		.withClass('td-icon')
		.renderWith(function(data, type, full, meta) {
			if (type === 'display') {
				return '#'+data
			} else {
				return data;
			}
		}),
		DTColumnBuilder.newColumn('id')
		.withTitle('')
		.withClass('td-icon')
		.notSortable()
		.renderWith(function(data, type, full, meta) {
			if (type === 'display') {
				if (current_user.id == full.user_id) {
					return '<a href="'+Utils.issueUrl(full.id, true)+'" title="Rediger issue"><i class="fa fa-pencil"></i></a>'
				} else {
					return '<i class="fa fa-pencil text-muted"></i>'
				}
			} else {
				return data;
			}
		}),
		DTColumnBuilder.newColumn('solved')
		.withTitle('Status')
		.renderWith(function(data, type, full, meta) {
			if (type === 'display') {
				return data == '1' ? 'Løst' : 'Åben'
			} else {
				return data;
			}
		}),
		DTColumnBuilder.newColumn('created_timestamp')
		.withTitle('Oprettet')
		.renderWith(function(data, type, full, meta) {
			if (type === 'display') {
				return Utils.calendar(data)
			} else {
				return data;
			}
		}),
		DTColumnBuilder.newColumn('user_id')
		.withTitle('Bruger')
		.withClass('no-click')
		.renderWith(function(data, type, full, meta) {
			var user = Lookup.getUser(data);
			return '<a href="'+user.url+'">'+user.signature_str+'</a>'
		}),
		DTColumnBuilder.newColumn('labels')
			.withTitle('Labels')
			.renderWith(function(data, type, full, meta) {
				var r = '';
				for (var i=0, l=data.length; i<l; i++) {
					r += getLabelButton(data[i]);
				}
				return r
		}),
		DTColumnBuilder.newColumn('title')
			.withClass('td-text-400')
			.withTitle('Overskrift'),
	];

	$scope.dtOptions = DTOptionsBuilder
		.fromFnPromise(function() {
			var defer = $q.defer();

			ESPBA.get('issue_labels', {}).then(function(i) {
				var labels = i.data;
				
				function getLabels(issue_id) {
					return labels.map(function(f) {
						if (f.issue_id == issue_id) {
							return f.issue_label_id
						}
					})
				}

				ESPBA.get('issue', {}).then(function(r) {
					var processed = 0;
					var length = r.data.length;
					r.data.forEach(function(d) {				
						processed++;
						d.labels = getLabels(d.id)
						if (processed == length) defer.resolve(r.data);
					})
				})
			/*
			ESPBA.get('issue', {}).then(function(r) {
				var processed = 0;
				var length = r.data.length;
				r.data.forEach(function(d) {
					ESPBA.get('issue_labels', { issue_id: d.id }).then(function(i) {
						processed++;
						d.labels = i.data.map(function(f) {
							return f.issue_label_id
						})
						if (processed == length) defer.resolve(r.data);
					})
				})
				*/
			});
			return defer.promise;
	   })
		.withOption('order', [[ 2, "desc" ]])
		.withOption('dom', 'Bl<"#open-issues">frtip')
		.withOption('stateSave', true)
		.withOption('createdRow', function(row, data, index) {
			if (data.solved == 1) $(row).addClass('warning');
		})
		.withOption('rowCallback', function(row, data /*, index*/) {
			$(row).attr('issue-id', data.id);
		})
		.withOption('initComplete', function() {
			$('#open-issues').append('<div class="checkbox no-select" style="margin-left:30px;margin-top:3px;"><label class="checkbox-inline"><input type="checkbox" id="open-issues-check" style="position:relative;top:3px;">&nbsp;Kun åbne issues</label></div>');
		})
		.withOption('language', Const.dataTables_daDk )
		.withButtons([
			{ text: '<span><i class="fa fa-plus"></i>&nbsp;Opret nyt issue</span>',
				className: 'btn btn-sm btn-success',
				action: function(e, dt, node, config) {
					$location.path('/issues/opret');
					$scope.$apply()
 				}
			}
		]);

		$('body').on('change', '#open-issues-check', function() {
			if (this.checked) {
				$.fn.dataTable.ext.search.push(function( settings, data, dataIndex ) {
					return data[2] != '1'
				})
			} else {
				$.fn.dataTable.ext.search.pop()
			}
			$scope.dtInstance.DataTable.draw()
		})

		angular.element('#table-issues').on('click', 'tbody td:not(.no-click)', function(e) {
			var id=$(this).parent().attr('issue-id');
			$location.path('/issues/se/'+id);
			$scope.$apply()
		});
		/*
		.withButtons({
			dom: {
				button: {
					tag: 'input',
					className: ''
				}
			},
			buttons: [{ text: '<span><i class="fa fa-plus text-success"></i>&nbsp;Opret nyt issue</span>',
				className: 'btn btn-xs',
				action: function(e, dt, node, config) {
					$location.path('/issues/opret');
					$scope.$apply()
 				}
			}]
		});
		*/
	if (Redirect.message()) {
		Notification(Redirect.message());
		Redirect.clear();
	}


});
