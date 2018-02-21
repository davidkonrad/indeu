<?

trait Events {

	//******************
	//UpcomingEvents
	public function UpcomingEvents() {
$SQL = <<<SQL
		select e.id, e.name, e.city, e.image, e.date, e.from, e.to
		from event e
		where 
		e.visibility_level = 1
		and e.date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
		order by e.date
SQL;
		return $SQL;
	}


	//******************
	//RecentEvents
	public function RecentEvents() {
		$user_id = isset($this->array['user_id']) ? $this->array['user_id'] : false;

		if (!$user_id) {
$SQL = <<<SQL
			select 
				e.*
			from event e
			where visibility_level = 1
			order by e.created_timestamp desc
			limit 10	
SQL;
	} else {
$SQL = <<<SQL
			select 
				e.*,
				u.created_timestamp as user_visited,
				g.name as group_name,
				g.id as group_id
			from event e 
SQL;
			$SQL.= ' left join user_visits u on e.hash = u.hash and u.user_id ='.$user_id;
			$SQL.= ' left join group_events ge on e.id = ge.id';
			$SQL.= ' left join `group` g on g.id = ge.group_id';
			$SQL.= ' order by e.created_timestamp desc 	';
			$SQL.= ' limit 10 ';
		}
		return $SQL;
	}


	//******************
	//UpcomingEventsLoggedIn
	public function UpcomingEventsLoggedIn() {
$SQL = <<<SQL
		select e.id, e.name, e.city, e.image, e.date, e.from, e.to
		from event e
		where 
		e.date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
		order by e.date
SQL;
		return $SQL;
	}

	//******************
	//User events participate
	public function UserEventsParticipate() {
		$user_id = $this->array['user_id'];
$SQL = <<<SQL
		select 
			event_user_feedback.event_id,
			event_user_feedback.user_id,
			event.name,
			event.date,
			event.from,
			event.to,
			event.city
		from event_user_feedback 
		left join event on event_user_feedback.event_id = event.id 
SQL;
		$SQL.=' where event_user_feedback.user_id='.$user_id;
		$SQL.='	order by event.date desc';
		return $SQL;
	}


	//******************
	//EventsByPeriod
	//user_id, start_date, end_date	
	public function EventsByPeriod() {
		$user_id = isset($this->array['user_id']) ? $this->array['user_id'] : false;
		$start_date = isset($this->array['start_date']) ? $this->s($this->array['start_date']) : false;
		$end_date = isset($this->array['end_date']) ? $this->s($this->array['end_date']) : false;
		
$SQL = <<<SQL
			select 
				e.id,
				e.visibility_level,
				e.name,
				e.lat,
				e.lng,
				e.date,
				e.from,
				e.to,

				ae.association_id,
				a.name as association_name

				from event e
				left join `association_events` ae on ae.event_id = e.id
				left join `association` a on a.id = ae.association_id
SQL;

/*
	removed group joins
				ge.group_id,
				g.name as group_name,

				left join `group_events` ge on ge.event_id = e.id
				left join `group` g on g.id = ge.group_id
*/

		$d = '';
		if ($start_date && $end_date) {
			$d.=' date BETWEEN '.$start_date.' AND '.$end_date.' ';
		}
		if ($start_date && !$end_date) {
			$d.=' date >= '.$start_date.' ';
		}
		if (!$start_date && $end_date) {
			$d.=' date <= '.$end_date.' ';
		}
		$where = ' where '.$d;
		if ($user_id) {
			if ($d) {
				$where.' and user_id = '.$user_id;
			} else {
				$where.' user_id = '.$user_id;
			}
		}

		$SQL.=$where;
		return $SQL;
	}


	//******************
	//EventsByUser
	//user_id
	public function EventsByUser() {
		$user_id = isset($this->array['user_id']) ? $this->array['user_id'] : false;

$SQL = <<<SQL
			select 
				e.created_timestamp,
				e.id,
				e.visibility_level,
				e.name,
				e.address,
				e.city,
				e.lat,
				e.lng,
				e.date,
				e.from,
				e.to,
				(select count(*) from event_user_feedback where event_id = e.id and feedback = 1) as feedback1,
				(select count(*) from event_user_feedback where event_id = e.id and feedback = 2) as feedback2

			from event e
				left join `association_events` ae on ae.event_id = e.id
				left join `association` a on a.id = ae.association_id
			where e.user_id = $user_id
SQL;
		return $SQL;	
	}


	//******************
	//EventsByGroup
	//group_id
	public function EventsByGroup() {
		$group_id = isset($this->array['group_id']) ? $this->array['group_id'] : false;

$SQL = <<<SQL
			select 
				e.created_timestamp,
				e.id,
				e.visibility_level,
				e.name,
				e.address,
				e.city,
				e.lat,
				e.lng,
				e.date,
				e.from,
				e.to,
				(select count(*) from event_user_feedback where event_id = e.id and feedback = 1) as feedback1,
				(select count(*) from event_user_feedback where event_id = e.id and feedback = 2) as feedback2

			from group_events ge
				left join `event` e on e.id = ge.event_id
			where 
				ge.group_id = $group_id
SQL;
		return $SQL;	
	}


	//******************
	//EventsByAssociation
	//association_id
	public function EventsByAssociation() {
		$association_id = isset($this->array['association_id']) ? $this->array['association_id'] : false;

$SQL = <<<SQL
			select 
				e.created_timestamp,
				e.id,
				e.visibility_level,
				e.name,
				e.address,
				e.city,
				e.lat,
				e.lng,
				e.date,
				e.from,
				e.to,
				(select count(*) from event_user_feedback where event_id = e.id and feedback = 1) as feedback1,
				(select count(*) from event_user_feedback where event_id = e.id and feedback = 2) as feedback2

			from association_events ae
				left join `event` e on e.id = ae.event_id
			where 
				ae.association_id = $association_id
SQL;
		return $SQL;	
	}


	//******************
	//EventWithUser
	//event_id
	public function EventWithUser() {
		$event_id = isset($this->array['event_id']) ? $this->array['event_id'] : false;
$SQL = <<<SQL
		select e.*,
		u.full_name as user_full_name
		from event e
		left join user u on e.user_id = u.id
		where e.id = $event_id
SQL;
		return $SQL;	
	}


	//******************
	//EventContantPersons
	//event_id
	public function EventContactPersons() {
		$event_id = isset($this->array['event_id']) ? $this->array['event_id'] : false;
$SQL = <<<SQL
		select 
			ec.*,
			u.id as user_id,
			u.full_name,
			u.email,
			u.alias
		from event_contactperson ec
		left join user u on ec.user_id = u.id
		where ec.event_id = $event_id
SQL;
		return $SQL;	
	}


}


?>
