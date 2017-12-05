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
	// user_id, start_date, end_date	
	public function EventsByPeriod() {
		$user_id = isset($this->array['user_id']) ? $this->array['user_id'] : false;
		$start_date = isset($this->array['start_date']) ? $this->s($this->array['start_date']) : false;
		$end_date = isset($this->array['end_date']) ? $this->s($this->array['end_date']) : false;
		
		//'2011-05-01'

$SQL = <<<SQL
			select 
				e.id,
				e.visibility_level,
				e.name,
				e.lat,
				e.lng,
				e.group_id,
				e.date,
				e.from,
				e.to

				from event e
SQL;

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
/*

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
		//echo $SQL;
		return $SQL;
*/
	}
}


?>
