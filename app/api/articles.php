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
		return $SQL;
	}	


	//******************
	//ArticlesByUserFull
	//@user_id
	public function ArticlesByUserFull() {
		$user_id = isset($this->array['user_id']) ? $this->array['user_id'] : false;

$SQL = <<<SQL
				select 
					a.id,
					a.header,
					a.sub_header,
					a.image,
					a.created_timestamp,
					v.counter,
					(select avg(rating) from user_stars where hash = a.hash) as stars,
					(select count(rating) from user_stars where hash = a.hash) as votes
				from
					article a
				left join visit_counter v on v.hash = a.hash 
				where
					a.user_id = $user_id
				order by a.created_timestamp desc
SQL;

		return $SQL;
	}


	//******************
	//ArticlesByGroupFull
	//@user_id
	public function ArticlesByGroupFull() {
		$group_id = isset($this->array['group_id']) ? $this->array['group_id'] : false;

$SQL = <<<SQL
				select 
					a.id,
					a.header,
					a.sub_header,
					a.image,
					a.hash,
					a.user_id,
					a.created_timestamp,
					(select avg(rating) from user_stars where hash = a.hash) as stars,
					(select count(rating) from user_stars where hash = a.hash) as votes,
					(select counter from visit_counter where hash = a.hash) as counter
				from
					article a, group_articles g
				where
					g.article_id = a.id
					and
					g.group_id = $group_id
				order by a.created_timestamp desc
SQL;

		return $SQL;
	}


	//******************
	//ArticlesByAssociationFull
	//@user_id
	public function ArticlesByAssociationFull() {
		$association_id = isset($this->array['association_id']) ? $this->array['association_id'] : false;

$SQL = <<<SQL
				select 
					a.id,
					a.header,
					a.sub_header,
					a.image,
					a.hash,
					a.user_id,
					a.created_timestamp,
					(select avg(rating) from user_stars where hash = a.hash) as stars,
					(select count(rating) from user_stars where hash = a.hash) as votes,
					(select counter from visit_counter where hash = a.hash) as counter
				from
					article a, association_articles aa
				where
					aa.article_id = a.id
					and
					aa.association_id = $association_id
				order by a.created_timestamp desc
SQL;

		return $SQL;
	}


	//******************
	//ArticleGroups
	//return groups associated with an 
	//@article_id
	public function ArticleGroups() {
		$article_id = isset($this->array['article_id']) ? $this->array['article_id'] : false;

$SQL = <<<SQL
		select 
			ga.group_id,
			g.name as group_name
		from
			group_articles ga 
		left join `group` as g on g.id = ga.group_id
		where
			ga.article_id = $article_id
SQL;
		return $SQL;
	}

			

}

?>
