<?

trait UserReactions {

	public function UserReactions() {
		$user_id = $this->array['user_id'];
		//on articles
$SQL = <<<SQL
		select 
			'a' as type,
			a.id,
			a.user_id as author,
			a.header as caption,
			c.content,
			c.user_id,
			c.created_timestamp,
			u.first_name,
			u.full_name
		from article a
		right join comment c on a.hash = c.hash and a.user_id <> c.user_id
		left join user u on u.id = c.user_id
SQL;
		$SQL.= ' where a.user_id = '.$user_id;
		$SQL.= ' and c.created_timestamp >= DATE(NOW()) - INTERVAL 7 DAY';
		$SQL.= ' order by c.created_timestamp desc';
		//$SQL.= ' limit 5';
		$a = $this->query($SQL);
		
		//on events
$SQL = <<<SQL
		select 
			'e' as type,
			e.id,
			e.user_id as author,
			e.name as caption,
			c.content,
			c.user_id,
			c.created_timestamp,
			u.first_name,
			u.full_name
		from event e
		right join comment c on e.hash = c.hash and e.user_id <> c.user_id
		left join user u on u.id = c.user_id
SQL;
		$SQL.= ' where e.user_id = '.$user_id;
		$SQL.= ' and c.created_timestamp >= DATE(NOW()) - INTERVAL 7 DAY';
		$SQL.= ' order by c.created_timestamp desc';
		//$SQL.= ' limit 5';
		$e = $this->query($SQL);

		//on comments
$SQL = <<<SQL
		select 
			'c' as type,
			p.user_id as author,
			p.content as caption,
			c.content,
			c.user_id,
			c.created_timestamp,
			u.first_name,
			u.full_name
		from comment p
SQL;
		$SQL.= ' right join comment c on p.hash = c.hash and p.id = c.parent_id and c.user_id <> '.$user_id;
		$SQL.= ' left join user u on u.id = c.user_id';
		$SQL.= ' where p.user_id = '.$user_id;
		$SQL.= ' and c.created_timestamp >= DATE(NOW()) - INTERVAL 7 DAY';
		$SQL.= ' order by c.created_timestamp desc';
		//$SQL.= ' limit 5';
		$c = $this->query($SQL);

		//on submissions
$SQL = <<<SQL
		select 
			'f' as type,
			e.user_id as author,
			e.name as caption,
			f.event_id as id,
			f.user_id,
			f.created_timestamp,
			u.first_name,
			u.full_name
		from event e
SQL;
		$SQL.= ' right join event_user_feedback f on f.event_id = e.id and f.feedback = 2 and f.user_id <> '.$user_id;
		$SQL.= ' left join user u on u.id = f.user_id';
		$SQL.= ' where e.user_id = '.$user_id;
		$SQL.= ' and f.created_timestamp BETWEEN DATE_SUB(NOW(), INTERVAL 7 DAY) AND NOW()';
		$SQL.= ' order by f.created_timestamp desc';
		//$SQL.= ' limit 5';
		$f = $this->query($SQL);

//
		$return = array();
		while ($row = $a->fetch()) {
			$return[] = $row;
		}
		while ($row = $e->fetch()) {
			$return[] = $row;
		}
		while ($row = $c->fetch()) {
			$return[] = $row;
		}
		while ($row = $f->fetch()) {
			$return[] = $row;
		}
		return json_encode($return);
	}

}

?>
