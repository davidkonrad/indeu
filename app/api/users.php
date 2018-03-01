<?

trait Users {

	//******************
	//UsersLookup
	public function UsersLookup() {
		$SQL = <<<SQL
			select 
				id, 
				first_name, 
				last_name, 
				full_name, 
				alias, 
				created_timestamp, 
				image, 
				email, 
				last_seen,
				signature,

				CASE
			    WHEN signature = 1 THEN alias
			    WHEN signature = 2 THEN full_name
			    WHEN signature = 3 THEN first_name
			    WHEN signature = 4 THEN last_name
			    ELSE full_name
			  END as signature_str

			from user
SQL;
		return $SQL;
	}



}

?>
