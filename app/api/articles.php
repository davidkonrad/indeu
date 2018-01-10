<?

trait Articles {

	//******************
	//ArticlesByUser
	//@user_id
	//@orderBy 'date', 'visits' or "stars'
	public function ArticlesByUser() {
		$user_id = isset($this->array['user_id']) ? $this->array['user_id'] : false;
		$scope = isset($this->array['scope']) ? $this->array['scope'] : 'false';
		$limit = isset($this->array['limit']) ? ' limit '.$this->array['limit'] : 'false';

		if ($scope == 'visits') {
$SQL = <<<SQL
				select 
					a.id,
					a.header,
					a.created_timestamp,
					v.counter
				from
					article a
				left join visit_counter v on v.hash = a.hash 
				where
					a.user_id = $user_id
				order by v.counter desc
SQL;
		}
		if ($scope == 'stars') {
$SQL = <<<SQL
				select 
					a.id,
					a.header,
					a.created_timestamp,
					(select avg(rating) from user_stars where hash = a.hash) as stars,
					(select count(rating) from user_stars where hash = a.hash) as votes
				from
					article a
				where
					a.user_id = $user_id
				order by stars desc
SQL;
		}

		if (!isset($SQL)) {
$SQL = <<<SQL
			select 
				a.id,
				a.header
				a.created_timestamp
			from
				articles a
			order by a.created_timestamp desc
SQL;
		}
		
		if ($limit) $SQL.=$limit;
		//echo $SQL;
		return $SQL;
	}	

}

?>
