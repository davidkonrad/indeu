<?

trait Associations {

	//******************
	//List of associations
	//either all public or filtered by user
	public function Associations() {
		$user_id = isset($this->array['user_id']) ? $this->array['user_id'] : false;

		if (!$user_id) {
$SQL = <<<SQL
			select * from association where 
			visibility_level = 1
			and active = 1
SQL;
		} else {
$SQL = <<<SQL
			select a.* from association a where 
			a.active = 1
			and 
			a.visibility_level = 1 
			or 
			a.visibility_level = 2
			or 
			(a.visibility_level = 3 and 
				(select count(*) from association_user au where au.association_id = a.id and au.user_id=$user_id)>0
			)
SQL;
		}

		return $SQL;		
	}

}


?>
