<?

trait Groups {

	//******************
	//GroupsByUser
	//@user_id
	public function GroupsByUser() {
		$user_id = isset($this->array['user_id']) ? $this->array['user_id'] : false;

$SQL = <<<SQL
			select 
				g.id,
				g.visibility_level,
				g.access_level,
				g.name,
				g.active,
				g.owner_id,
				g.image,
				g.about,
				(select count(*) from group_user where group_id = g.id) as followers

				from group_user gu
				left join `group` g on g.id = gu.group_id
				where gu.user_id = $user_id
SQL;
		return $SQL;
	}


}

?>
