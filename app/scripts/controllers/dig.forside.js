'use strict';

/**
 *
 *
 */
angular.module('indeuApp').controller('DigForsideCtrl', 
	function($scope, $location, Settings, Login, ESPBA, Lookup, Meta, Utils, ImageUploadModal, Redirect, AlertModal, EditArticle) {

		Redirect.checkLogin('Du skal være logget ind for at kunne se din egen forside');

		Settings.init($scope);

		$scope.limitToItems = [
			{ id: '10', navn: '10' },
			{ id: '25', navn: '25' },
			{ id: '50', navn: '50' },
			{ id: '', navn: 'Alle' }
		];
		$scope.articleOrderByItems = [
			{ id: '-created_timestamp', navn: 'Nyeste' },
			{ id: '-counter', navn: 'Mest viste' },
			{ id: 'draft', navn: 'Kladder øverst' }
		];
		$scope.eventOrderByItems = [
			{ id: '-dateInt', navn: 'Event dato / tid' },
			{ id: '-feedback_total', navn: 'Tilmeldinger' },
			{ id: '-counter', navn: 'Mest viste' }
		];
		
		$scope.view = {
			artikler: {
				limitTo: $scope.limitToItems[0].id,
				orderBy: $scope.articleOrderByItems[0].id
			},
			events: {
				limitTo: $scope.limitToItems[0].id,
				orderBy: $scope.eventOrderByItems[0].id
			}
		};

		//get logged in user id
		if (Login.isLoggedIn()) {
			var user_id = Login.currentUser().id;
		}

		$scope.edit_event_id = undefined;
		$scope.edit_article_id = undefined;

		$scope.action = '';
		$scope.setAction = function(action) {
			if (action != '' && $scope.action != '' && $scope.action != action) return;
			$scope.action = action;
		}

		$scope.actionCancel = function() {
			$scope.action = '';
			$scope.edit_article_id = undefined;
			$scope.edit_event_id = undefined;
		}

		$scope.actionDisable = function(action) {
			return $scope.action != action && $scope.action != '';
		}	

		$scope.actionSaved = function(item) {
			$scope.action = '';
			$scope.edit_article_id = undefined;
			$scope.edit_event_id = undefined;
		}

		$scope.editEvent = function(event_id) {
			$scope.edit_event_id = event_id;
			$scope.action = 'e';
			Utils.scrollTop();
		}

		$scope.actionProfileSaved = function() {
			$scope.actionSaved();
			$scope.reload();
		}

		$scope.$watch('action', function() {
			switch ($scope.action) {
				case 'a' : 
					$scope.action_caption = $scope.edit_article_id ? 'rediger artikel' : 'opret artikel';
					break;
				case 'g' : 
					$scope.action_caption = $scope.edit_gruppe_id ? 'rediger gruppe' : 'opret gruppe';
					break;
				case 'e' : 
					$scope.action_caption = $scope.edit_gruppe_id ? 'rediger event' : 'opret event';
					break;
				case 'r' :
					AlertModal.show('Du har rettigheder til at reviewe nye brugere, men funktionaliteten er endnu ikke implementeret på brugerniveau', 'Desværre').then(function() {
						$scope.setAction('');
					})
					break;
				default: 
					$scope.action_caption = undefined
					break;
			}
		});
			
		
/* load profile */
		$scope.reload = function() {
			ESPBA.get('user', { id: user_id }).then(function(r) {
				$scope.user = r.data[0];
				$scope.user.image = $scope.user.image || '';
				$scope.user.url = Utils.userUrl($scope.user.id, $scope.user.full_name);
				Lookup.init().then(function() {
					Meta.setTitle(Lookup.getUser($scope.user.id).signature_str);				
				})
				var a = $scope.user.about;
				if (!a || a.trim() == '') $scope.user.about = 'Du har endnu ikke udfyldt en beskrivelse af dig selv. Klik på linket "Rediger profil" til højre. '
			});
		}
		$scope.reload();

/* calendar */
		$scope.calConfig = {
			buttonText: {
		    today: 'I dag',
		    month: 'Denne måned',
		    week: 'uge',
		    day:'dag',
		    list: 'list'
			},
			axisFormat: 'HH:mm',
			fixedWeekCount: false,
			height: 'auto',
			editable: false,
			displayEventTime: false,
			defaultView: 'agendaFiveDay',
			views: {
        agendaFiveDay: {
					type: 'agenda',
					duration: { days: 5 },
					buttonText: 'Kommende 5 dage',
					allDaySlot: false,
					allDayText: 'all-day',
					slotDuration: '02:00:00',
					minTime: '06:00:00',
					maxTime: '24:00:00',
					slotEventOverlap: true,
					columnFormat: 'DD/MM',
				}
	    },
			header:{
				left: 'title',
				center: 'agendaFiveDay,month',
				right: 'prev,next'
			},
			eventClick: function(event) {
				var url = '/event/'+event.event_id+'/'+event.urlName;
				$location.path(url);
			}
			/*
       eventDrop: $scope.alertOnDrop,
       eventResize: $scope.alertOnResize,
       eventRender: $scope.eventRender,
				eventSources: $scope.eventSources,
       
			dayClick: $scope.dayClick
		*/
	};

/* all comitted events */
		ESPBA.prepared('UserEventsParticipate', { user_id: user_id }).then(function(p) {
			var events = p.data.map(function(e) {
				return {
					start: new Date(e.date+' '+e.from),
					end: new Date(e.date+' '+e.to),
					title: e.name,
					name: e.name,
					urlName: Utils.urlName(e.name),
					event_id: e.event_id,
					color: '#257e4a',
					allDay: false
				}
			});
			var now = new Date();
			var future = p.data.filter(function(e) {
				var start = new Date(e.date+' '+e.from);
				if (start.valueOf() >= now.valueOf()) {
					e.date = start; //new Date(e.date+' '+e.from);
					e.start = start; //new Date(e.date+' '+e.from);
					e.end = new Date(e.date+' '+e.to);
					e.urlName = Utils.urlName(e.name);
					e.urlLink = Utils.isLocalHost() 
						? '#/event/'+e.event_id+'/'+e.urlName
						: '/event/'+e.event_id+'/'+e.urlName;

					return true
				} 
			})
			$scope.calConfig.futureEvents = future;
			$scope.calConfig.events = events;
		});

/* groups */
		ESPBA.get('group_user', { user_id: user_id }).then(function(r) {
			var groups = [];
			r.data.forEach(function(g) {
				var group = Lookup.getGroup(g.group_id);
				group.is_owner = group.owner_id == user_id;
				//group.owner_title = !personal ? 'Du er administrator af denne gruppe' : personal+' er administrator af denne gruppe';
				group.urlName = Utils.urlName(group.name);
				group.urlTitle = Utils.plainText(group.about, 200);
				group.url = Utils.gruppeUrl(group.id, group.name);
				groups.push(group);
			});
			$scope.groups = groups;
		});

/* new interface */
	$scope.editArticle = function(article_id) {
		var article_info = article_id ? { article_id: article_id } : {};
		EditArticle.show(article_info).then(function() {
		})
	}
	


});

