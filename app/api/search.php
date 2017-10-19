<?

include('Db.php');

class Search extends DbPDO {

	public function __construct() {
		parent::__construct();
		
		if ($this->isLocalhost()) {
			header('Access-Control-Allow-Origin	: *');
		}

		if ( !$_GET || !isset($_GET['term']) || empty($_GET['term']) ) {
			echo json_encode(array('error' => 'Søgeord mangler' ));
			return;
		}
		$term = $_GET['term'];

		$SQL = 'select distinct p.* from ';
		$SQL.= 'produkter p, profil r, kategori k, sort s, overflade o, kvalitet v ';

		$where = '';
		$array = explode(' ', $term);

		foreach($array as $t) {
			if ($where != '') $where.=' and ';

			if (strtolower($t) == 'tilbud') {
				$w = ' ( p.produkt_type_id = 2 ) ';
			} else {
				$w = ' (';
				$w.= '(p.aktiv = 1) and ';
				$w.= '(p.navn like "%'.$t.'%") or ';
				$w.= '(p.vare_nr like "%'.$t.'%") or ';
				$w.= '(p.profil_id = r.id and r.navn like "%'.$t.'%") or ';
				$w.= '(p.kategori_id = k.id and k.navn like "%'.$t.'%") or ';
				$w.= '(p.sort_id = s.id and s.navn like "%'.$t.'%") or ';
				$w.= '(p.overflade_id = o.id and o.navn like "%'.$t.'%") or ';
				$w.= '(p.kvalitet_id = v.id and v.navn like "%'.$t.'%") or ';
				$w.= '(p.dimension like "%'.$t.'%") ';

				$w.= ')';
			}

			$where.=$w;
		}

		$SQL.=' where '.$where;

		$result = $this->queryJSON($SQL);
		echo $result;
	}
}


/**
	*
	*/
$search = new Search();

?>
