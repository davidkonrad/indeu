<?

trait Admin {

	//******************
	//AdminContentOverview
	public function AdminContentOverview() {

$SQL = <<<SQL
		select
			(select count(*) from article) as article_count,
			(select count(*) from event) as event_count,
			(select count(*) from association) as association_count,
			(select count(*) from static_page) as static_page_count,
			(select count(*) from `group`) as group_count,
			(select count(*) from user_request) as user_request_count,
			(select count(*) from user where quarantine = 1) as user_quarantine_count,
			(select count(*) from user where logged_in = 1) as user_logged_in_count,
			(select count(*) from comment) as comment_count,
			(select count(*) from issue) as issue_count,

			count(*) as user_count		
		from
			user

SQL;
		return $SQL;

	}


	//******************
	//AdminMostCommented
	public function AdminMostCommented() {

$SQL = <<<SQL
		select
			c.hash,
			count(c.hash) as comment_count,

			a.id as article_id,
			a.header as article_header,

			e.id as event_id,
			e.name as event_name,

			g.id as group_id,
			g.name as group_name,

			u.id as user_id,
			u.full_name as user_name,

			ass.id as association_id,
			ass.name as association_name,

			s.id as static_page_id,
			s.header as static_page_header
		
		from
			comment c

		left join article a on a.hash = c.hash
		left join event e on e.hash = c.hash
		left join `group` g on g.hash = c.hash
		left join user u on u.hash = c.hash
		left join association ass on ass.hash = c.hash
		left join static_page s on s.hash = c.hash

		group by
			c.hash

		order by
			comment_count desc

		limit 10

SQL;
		return $SQL;
	}


	//******************
	//AdminMostVisited
	public function AdminMostVisited() {

$SQL = <<<SQL
		select
			v.counter,
			
			a.id as article_id,
			a.header as article_header,

			e.id as event_id,
			e.name as event_name,

			g.id as group_id,
			g.name as group_name,

			u.id as user_id,
			u.full_name as user_name,

			ass.id as association_id,
			ass.name as association_name,

			s.id as static_page_id,
			s.header as static_page_header
		
		from
			visit_counter v

		left join article a on a.hash = v.hash
		left join event e on e.hash = v.hash
		left join `group` g on g.hash = v.hash
		left join user u on u.hash = v.hash
		left join association ass on ass.hash = v.hash
		left join static_page s on s.hash = v.hash

		order by
			v.counter desc

		limit 10

SQL;
		return $SQL;
	}

}

?>
