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


	//******************
	//GroupWithOwner
	//@group_id
	public function GroupWithOwner() {
		$group_id = isset($this->array['group_id']) ? $this->array['group_id'] : false;
$SQL = <<<SQL
			select 
				g.*,
				u.alias owner_lasias,
				u.first_name as owner_first_name,
				u.last_name as owner_last_name,
				u.full_name as owner_full_name
			from `group` g
			left join user u on g.owner_id = u.id
			where g.id = $group_id
SQL;
		return $SQL;
	}


	//******************
	//GroupMembers
	//@group_id
	public function GroupMembers() {
		$group_id = isset($this->array['group_id']) ? $this->array['group_id'] : false;
$SQL = <<<SQL
		select 
			u.id,
			u.full_name,
			u.first_name,
			u.last_name, 
			u.alias
		from user u, group_user gu, `group` g
		where 
			g.id = $group_id
		and
			gu.group_id = g.id
		and
			gu.user_id = u.id
SQL;
		return $SQL;
	}


}

?>
