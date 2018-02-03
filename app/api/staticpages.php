<?

trait StaticPages {

	//******************
	//StaticPagesAll
	public function StaticPagesAll() {

$SQL = <<<SQL
		select 
			s.*,
			u.full_name as user_full_name
		from
			static_page s
		left join user u on s.user_id = u.id
SQL;

		return $SQL;
	}	

/*
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
*/
}

?>
