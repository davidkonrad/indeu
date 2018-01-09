<?

trait Articles {

	//******************
	//ArticlesByUser
	//@user_id
	//@orderBy 'date' or 'visits'
	public function ArticlesByUser() {
		$user_id = isset($this->array['user_id']) ? $this->array['user_id'] : false;
		$orderBy = isset($this->array['orderBy']) ? $this->array['orderBy'] : 'false';

		if ($orderBy == 'visits') {
$SQL = <<<SQL
			select 
				a.id,
				a.header
				a.created_timestamp,
				v.visit_counter
			from
				articles a
			left join visit_counter v on v.hash = a.hash 
			order by v.visit_counter desc
SQL;
		} else {
$SQL = <<<SQL
			select 
				a.id,
				a.header
				a.created_timestamp
			from
				articles a
			order by a.created_timestamp
SQL;
		}
		return $SQL;
	}	

}

?>
