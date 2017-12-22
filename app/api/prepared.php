<?

trait Prepared {

	//******************
	//Log
	public function Log() {
		$user_id = isset($this->array['user_id']) ? $this->array['user_id'] : false;
		$hash = isset($this->array['hash']) ? $this->array['hash'] : false;
		$not_seen = isset($this->array['not_seen']) ? $this->array['not_seen'] : false;
		$limit = isset($this->array['limit']) ? $this->array['limit'] : false;
$SQL = <<<SQL
		select 
			l.id,
			l.hash,
			l.type,
			l.created_timestamp,
			l.user_id,
			l.context_user_id,

			u.full_name as user_full_name,
			c.full_name as context_user_full_name,

			f.name as forening_name,
			f.id as forening_id,

			a.header as article_name,
			a.id as article_id,

			e.name as event_name,
			e.id as event_id,

			g.name as group_name,
			g.id as group_id

		from log l

		left join user u on u.id = l.user_id
		left join user c on c.id = l.context_user_id
		left join association f on f.hash = l.hash
		left join article a on a.hash = l.hash
		left join event e on e.hash = l.hash
		left join `group` g on g.hash = l.hash
SQL;
		//**must** have either user_id or hash
		if ($user_id) {
			$SQL.=' where l.context_user_id = '.$user_id.' or l.user_id = '.$user_id;
		}
		if ($hash) {
			$SQL.=' where l.hash = '.$this->s($hash);
		}

		if ($not_seen) {
			$SQL.=' and l.seen<>1 or l.context_seen<>1 ';
		}

		$SQL.='	order by l.created_timestamp desc ';

		if ($limit) {
			$SQL.=' limit '.$limit;
		}

		//echo $SQL;
		return $SQL;
	}


	//******************
	//MenuGroups
	public function MenuGroups() {
		$user_id = isset($this->array['user_id']) ? $this->array['user_id'] : false;

		if (!$user_id) {
$SQL = <<<SQL
		select
			g.id,
			g.visibility_level,
			g.name,
			(select count(*) from group_user where group_id	= g.id) as user_count
		from `group` g 
		where g.visibility_level = 1
		and g.active = 1
		order by user_count desc
SQL;
		} else {
$SQL = <<<SQL
		select
			g.id,
			g.visibility_level,
			g.name,
			u.user_id,
			(select count(*) from group_user where group_id	= g.id) as user_count
		from `group` g
		left join group_user u on u.group_id = g.id and u.user_id = {$user_id} 
		where 
			(g.visibility_level = 1	and g.active = 1)
		or
			(g.visibility_level = 2	and g.active = 1)
		or
			(g.visibility_level = 3	and g.active = 1 and u.id > 0)
		order by user_count desc
SQL;
		}
		return $SQL;
	}

			

	//******************
	//Search
	public function Search() {
		$term = $this->array['term'];
		$articles = isset($this->array['articles']) ? $this->array['articles'] : false;
		$events = isset($this->array['events']) ? $this->array['events'] : false;

		if ($articles) {
$SQL = <<<SQL
			select 
				'a' as type,
				a.id,
				a.hash,
				a.image,
				a.header as caption,
				a.created_timestamp,
				a.content,
				a.user_id,
				u.full_name
			from article a 
			left join user u on u.id = a.user_id 
SQL;
			$SQL.= ' where a.content like "%' .$term .'%" ';
			$SQL.= ' order by a.created_timestamp desc';
			$a = $this->query($SQL);
		}

		if ($events) {
$SQL = <<<SQL
			select 
				'e' as type,
				e.id,
				e.hash,
				e.image,
				e.name as caption,
				e.created_timestamp,
				e.about as content,
				e.user_id,
				u.full_name
			from event e 
			left join user u on u.id = e.user_id 
SQL;
			$SQL.= ' where e.name like "%' .$term .'%" or e.about like "%' .$term .'%" ';
			$SQL.= ' order by e.created_timestamp desc';
			$e = $this->query($SQL);
		}

		$return = array();
		if ($a) while ($row = $a->fetch()) {
			$return[] = $row;
		}
		if ($e) while ($row = $e->fetch()) {
			$return[] = $row;
		}
		return json_encode($return);

	}


	//******************
	//RecentComments
	public function RecentComments() {
		$hash = $this->s($this->array['hash']);
		$limit = isset($this->array['limit']) ? $this->array['limit'] : 10;

$SQL = <<<SQL
		select 
			c.id,
			c.created_timestamp,
			length(c.content) as content_length,
			left(c.content, 30) as content,
			c.user_id,
			u.full_name,
			u.image
		from comment c
		left join user u on c.user_id = u.id
SQL;
		$SQL.= ' where c.hash = '. $hash;
		$SQL.= ' order by c.created_timestamp desc';
		$SQL.= ' limit '.$limit;
		//echo $SQL;
		return $SQL;
}


	//******************
	//RecentArticles
	public function RecentArticles() {
		$user_id = isset($this->array['user_id']) ? $this->array['user_id'] : false;
		if ($user_id) {
$SQL = <<<SQL
			select 
				distinct
				a.id, 
				a.header, 
				a.user_id, 
				a.image, 
				u.full_name,
				v.created_timestamp as user_visited
			from article a
			left join user u on u.id = a.user_id
SQL;
			$SQL.= ' left join user_visits v on v.hash = a.hash and v.user_id ='.$user_id;
			$SQL.= ' order by a.created_timestamp desc ';
			$SQL.= ' limit 10 ';
		} else {
$SQL = <<<SQL
		select a.id, a.header, a.user_id, a.image, u.full_name from article a, user u
		where a.user_id = u.id
		and a.visibility_level = 1
		order by a.created_timestamp desc
		limit 10
SQL;
		}
		//echo $SQL;
		return $SQL;
	}

	//******************
	//RecentArticlesLoggedIn
	public function RecentArticlesLoggedIn() {
$SQL = <<<SQL
		select a.id, a.header, a.user_id, a.image, u.full_name from article a, user u
		where a.user_id = u.id
		order by a.created_timestamp desc
		limit 10
SQL;
		return $SQL;
	}


	//******************
	//star ratings
	public function UpdateStarRating() {
		$hash = $this->s($this->array['hash']);

		$SQL = 'select ';
		$SQL.= 'count(*) as c,';
		$SQL.= 'sum(rating) as s ';
		$SQL.= 'from user_stars ';
		$SQL.= 'where hash = '.$hash;

		$res = $this->query($SQL);
		$row = $res->fetch();

		$count = $row['c'];
		$sum = $row['s'];
		$avg = (float)$sum / (float)$count;

		if ($this->rowExists('star_rating', 'hash', $this->array['hash'])) {
			$SQL = 'update star_rating set ';
			$SQL.= 'counter = '.$this->s($count).', ';
			$SQL.= 'average = '.$this->s($avg).' ';
			$SQL.='where hash ='.$this->s($this->array['hash']);
		} else {
			$SQL =' insert into star_rating (hash, counter, average) values(';
			$SQL.= $hash .', '. $this->s($count) .', '. $this->s($avg);
			$SQL.= ')';
		}
		$this->exec($SQL);
		return false;
	}

	//******************
	//calc StarRating
	public function GetStarRating() {
		$hash = $this->array['hash'];
		$user_id = $this->array['user_id'];
$SQL = <<<SQL
		select 
			count(stars.user_id) as counter,
			sum(stars.rating) / count(stars.user_id) as average,
			s.user_id,
			s.rating,
			s.created_timestamp
		from user_stars stars 
SQL;
		if ($user_id) {
			//$SQL.=' left join user_stars s on (stars.user_id = s.user_id and stars.hash = s.hash) ';
			$SQL.=' left join user_stars s on stars.hash = s.hash and s.user_id = '.$user_id;
		}
		$SQL.=' where stars.hash = '.$this->s($hash);
		//echo $SQL;
		return $SQL;
	}

	//******************
	//update visitor_count
	public function UpdateVisitCounter() {
		$hash = $this->array['hash'];
		$SQL = 'insert into visit_counter (hash, counter) values(';
		$SQL.= $this->s($hash).', 1) ';
		$SQL.= ' on duplicate key update counter = counter +1;';
		$this->exec($SQL);
		return false;
	}

}

?>
