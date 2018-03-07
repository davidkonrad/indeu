'use strict';

/**
 *
 *
 */
angular.module('indeuApp').controller('IssueCtrl', 
	function($scope, $timeout, $routeParams, $location, Login, ESPBA, Lookup, Utils, Notification, Redirect, Meta) {

	ESPBA.get('issue_label', {}).then(function(r) {
		r.data.forEach(function(l) {
			l.item = '<i class="fa fa-square fa-fw" style="color:'+l.color+';"></i>&nbsp;'+l.name;
		})
		$scope.labelList = r.data
	})

	var id, action;

	if ($routeParams.id) {
		id = parseInt($routeParams.id) == $routeParams.id ? parseInt($routeParams.id) : undefined;
	}

	if ($routeParams.action) {
		action = $routeParams.action
	} else {
		action = 'opret';
	}

	Meta.setTitle('Issues');

	function setHeader(item) {
		$scope.header = {
			user_id: item.user_id,
			created_timestamp: item.created_timestamp,
			edited_timestamp: item.edited_timestamp,
			dateStamp: moment(item.created_timestamp).local().fromNow(),
			realDate: moment(item.created_timestamp),
			editedDateStamp: (item.edited_timestamp != '0000-00-00 00:00:00') ? moment(item.edited_timestamp).local().fromNow() : undefined
		}	
	}

	switch(action) {
		case 'opret': 
			$scope.edit = {};
			$scope.btn_ok_caption = 'Opret issue';
			break;
		case 'rediger' : 
			ESPBA.get('issue', { id: id }).then(function(r) {
				$scope.edit = r.data[0];
				ESPBA.get('issue_labels', { issue_id: $scope.edit.id }).then(function(i) {
					i.data.forEach(function(label) {
						$scope.labels.push(getIssueLabel(label.issue_label_id))
					})
				})
				setHeader($scope.edit);
			})
			$scope.btn_ok_caption = 'Opdater issue';
			break;
		case 'se' :
			ESPBA.get('issue', { id: id }).then(function(r) {
				$scope.issue = r.data[0];
				if ($scope.issue.image) {
					$scope.issue.image_url = 'media/issue/'+$scope.issue.image
				}
				setHeader($scope.issue);
				ESPBA.get('issue_labels', { issue_id: $scope.issue.id }).then(function(i) {
					i.data.forEach(function(label) {
						$scope.labels.push(getIssueLabel(label.issue_label_id))
					})
				})
			})
			break;
		
		default :
			Redirect._404();
			break;
	}	

	$scope.labels = [];
	$scope.select = {
		label : undefined
	}

	function remove(list, label) {
		for (var i=0, l=list.length; i<l; i++) {
			if (list[i].id == label.id) {
				list.splice(i, 1);
				return
			}
		}
	}
	function getIssueLabel(id) {
		for (var i=0, l=$scope.labelList.length; i<l; i++) {
			if ($scope.labelList[i].id == id) return $scope.labelList[i]
		}
		return {}
	}
			
	$scope.canSave = function() {
		return $scope.edit.title != '' &&
			$scope.labels.length > 0
	}

	$scope.removeLabel = function(label) {
		$scope.labelList.push(label);
		remove($scope.labels, label);
	}
		
	$scope.$watch('select.label', function(label) {
		if (label) {
			$scope.labels.push(label);
			remove($scope.labelList, label);
			$scope.select.label = undefined;
		}
	})

	$scope.updateIssue = function() {

		function updateLabels(issue_id) {
			$scope.labels.forEach(function(l) {
				ESPBA.insert('issue_labels', { issue_id: issue_id, issue_label_id: l.id })
			})
		}

		if ($scope.edit.hash == undefined) {
			$scope.edit.hash = Utils.getHash();
			$scope.edit.user_id = Login.currentUser().id
			ESPBA.insert('issue', $scope.edit).then(function(r) {
				var issue_id = r.data[0].id;
				updateLabels(issue_id);
				$location.path('/issues/se/'+issue_id);
				Notification('Issue #'+issue_id+' er blevet oprettet');
			})
		} else {
			$scope.edit.edited_timestamp = 'CURRENT_TIMESTAMP';
			ESPBA.update('issue', $scope.edit);
			ESPBA.delete('issue_labels', { issue_id: $scope.edit.id }).then(function() {
				updateLabels($scope.edit.id);
				$location.path('/issues/se/'+$scope.edit.id);
				Notification('Issue #'+$scope.edit.id+' er blevet redigeret');
			})
		}
	}
	
});

