<?
/**
 * espba.php		Database driver for the ESPBA angular 1.x service
 * @copyright   Copyright (C) 2017-2018 david konrad, davidkonrad at gmail com
 * @license     Licensed under the MIT License; see LICENSE.md
 */

error_reporting(E_ALL & ~E_NOTICE); 
ini_set('display_errors', '1');

session_start();

include('Db.php');
include('prepared.php');
include('UserReactions.php');
include('events.php');  //prepared statements for events
include('associations.php');  //prepared statements for associations
include('articles.php');  //prepared statements for articles
include('groups.php');  //prepared statements for groups
include('staticpages.php');  //prepared statements for static_page
include('admin.php');  //prepared statements for admin pages
include('users.php');  //prepared statements for users

class ESPBA extends DbPDO {
	use Prepared, UserReactions, Events, Associations, Articles, Groups, StaticPages, Admin, Users;

	private $table;
	private $action;
	private $token;
	private $fields;
	private $crypt = false;

/**
	* constructor
	* @param $table	string, the table name
	* @param $array array, $_GET or $_POST
  * @desc Allow the script being executed from foreign locations. 
	* @desc Note: This is optional. See https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
	*/
	public function __construct($array) {
		parent::__construct();
		
		//file_put_contents('test.txt', json_encode($_SERVER, JSON_PRETTY_PRINT));
		//header('Access-Control-Allow-Origin	: "*"');
		if ($this->isLocalhost()) {
			//header('Access-Control-Allow-Origin	: "*"');
		}

		if ($_SERVER['HTTP_ACCEPT'] != 'application/json, text/plain, */*') {
			$response = array('message' => 'restricted');
			echo json_encode($response);
			return;
		}

		$this->table = isset($array['__table']) ? "`".$array['__table']."`" : false;
		$this->action = isset($array['__action']) ? $array['__action'] : false;
		$this->token = isset($array['__token']) ? $array['__token'] : false;
		$this->crypt = isset($array['__crypt']) ? $array['__crypt'] : false;

		unset($array['__table']);
		unset($array['__action']);
		unset($array['__token']);
		unset($array['__crypt']);

		$this->process($array);
	}


/**
  * @desc process a CRUD request, i.e insert, get, update and delete
  * @param array $array, essentially the $_GET 
	*/
	public function process($array) {
		switch ($this->action) {
			case 'insert' :
				$this->insert($array);
				break;

			case 'get' :
				$this->get($array);
				break;

			case 'delete' :
				$this->delete($array);
				break;

			case 'update' :
				$this->update($array);
				break;

			case 'init' :
				$this->init();
				break;

			case 'prepared' :
				$this->prepared($array);
				break;

			default:
				echo $this->err('Not recognizeable "'.$this->action.'"', 'bad request');
				break;
		}
	}

	private function backTick($s) {
		return "`".$s."`";
	}
	private function unBackTick($s) {
		$s = ltrim($s, "`");
		$s = rtrim($s, "`");
		return $s;
	}
	private function unQuote($s) {
		$s = ltrim($s, "'");
		$s = rtrim($s, "'");
		return $s;
	}
	private function rowExists($table, $field, $value) {
		$SQL = 'select count(*) as c from '.$this->backTick($table).' where '.$this->backTick($field).'="'.$value.'"';
		$result = $this->query($SQL);
		$row = $result->fetch();
		return $ow['c']>0;
	}
	private function isJson($string) {
		json_decode($string);
		return (json_last_error() == JSON_ERROR_NONE);
	}


/**
  * @desc return error message or latest database error
  * @param string $action
  * @param string $message
  * @return JSON string
	*/
	public static function err($action, $message = '') {
		$err = array(
			'failed' => $action,
			'message' => $message != '' ? $message : 'error' //Espb::error()
		);
		return json_encode($err);
	}


/**
  * @desc return params (i.e part of $_GET) as content of a WHERE clause
  * @param array $array
  * @return string
	*/
	private function getParams($array) {
		$r = '';
		foreach ($array as $key => $value) {
			//http://ca.php.net/variables.external
			//$_GET converts . to _ so every . is converted to &dot; in the js service
			if (strpos($key, '&dot;') != false) {
				$key = str_replace('&dot;', '.', $key);
			}
			if ($r !='') $r.=' and ';
			$r.=$key.'='.$this->s($value);
		}
		return $r;
	}


/**
  * @desc executes a SELECT based on params in $array
  * If no params is set, the entire dataset is retrieved
  * @param array $array
  * @return JSON string
	*/
	public function get($array) {
		$limit = '';
		$orderBy = '';

		if (isset($array['__limit'])) {
			$limit = ' limit '.$array['__limit'];
			unset($array['__limit']);
		}

		if (isset($array['__orderBy'])) {
			$orderBy = ' order by '.$array['__orderBy'];
			unset($array['__orderBy']);
		}

		if (isset($array['__fields'])) {
			$fields = $array['__fields'];
			unset($array['__fields']);		
			$fields = explode(',', $fields);
			foreach ($fields as &$field) {
				$field = "`".$field."`";
			}
			$fields = implode(',', $fields);
		} else {
			$fields = '*';
		}
			
		$params = $this->getParams($array);
		if ($params != '') $params = ' where '.$params;

		$SQL = 'select '.$fields.' from '.$this->table.$params;
		$SQL.= $orderBy.$limit;
		
		$result = $this->queryJSON($SQL);
		echo $result;
	}


/**
  * @desc executes an UPDATE based on params in $array
  * @param array $array
  * @return JSON string. The inserted record, if any. 
	*/
	public function update($array) {
		$id = isset($array['id']) ? $array['id'] : false;
		if (!$id) {
			$this->err('update', 'id is missing');
			return;
		}
		unset($array['id']);
		$SQL = 'update '.$this->table.' set ';
		$update = '';
		foreach($array as $key => $value) {
			if ($update != '') $update.=', ';
			
			$insertValue = in_array(strtoupper($value), array('NOW()', 'CURRENT_TIMESTAMP'))
				? $value
				: $this->s($value);

			$update.= "`". $key ."`".'='. $insertValue;
		}
		$SQL.=$update.' where id='.$id;
		$this->exec($SQL);

		//return updated object, if any
		echo $this->get(array('id' => $id));		
	}


/**
  * @desc executes a INSERT based on params in $array
  * @param array $array
  * @return JSON string
	*/
	public function insert($array) {
		$keys = array_keys($array);

		foreach($keys as &$key) {
			$key = "`".$key."`";
		}

		$keys = ' (' . implode(',', $keys).')';

		$v = array_values($array);
		$insertValues = '';
		foreach($v as $value) {
			if ($insertValues != '') $insertValues.=', ';
			$insertValues .= $this->s($value);
		}
		$insertValues = ' values ('. $insertValues. ')';

		$SQL = 'insert into '.$this->table.$keys.$insertValues;

		$error = $this->exec($SQL);
		if ($error) echo json_encode($error);
	
		//return the inserted object or error
		$id = $this->lastInsertId();
		if (!$id) {
			echo $this->err('insert');
		} else {
			echo $this->get(array('id' => $id));
		}
	}


/**
  * @desc executes a DELETE based on params in $array
  * @param array $array
  * @return JSON string, OK or error message
	*/
	public function delete($array) {
		$params = $this->getParams($array);
		if ($params != '') $params = ' where '.$params;

		$SQL = 'delete from '.$this->table.$params;
		
		print_r($this->error());

		$this->exec($SQL);
		if ($this->error()) {
			echo $this->err('delete', $SQL);
		} else {
			echo json_encode(array('recordsDeleted' => 'true'));
		}
	}


/**
  * @desc set encryption token
  * @return JSON string
	*
  * Note that the encryption feature not will work in a localhost:port env
	* since $_SESSION is stored in a different domain than the app
  * 
	*/
	private function init() {
		if (!isset($_SESSION['token'])) {
			$_SESSION['token'] = substr(str_shuffle(md5(microtime())), 0, 15);
		}
		$response = array('token' => $_SESSION['token']);
		echo json_encode($response);
	}


/**
  * @desc encrypt a response using 
  * 
  * Note that the encryption feature not will work in a localhost:port env
	* since $_SESSION is stored in a different domain than the app
	*
  */
	private function encrypt($passphrase, $s){
    $salt = openssl_random_pseudo_bytes(256);
    $iv = openssl_random_pseudo_bytes(16);
    //on PHP7 random_bytes() can be used instead of openssl_random_pseudo_bytes()
    //or PHP5x see https://github.com/paragonie/random_compat

    $iterations = 999;  
    $key = hash_pbkdf2("sha512", $passphrase, $salt, $iterations, 64);
    $encrypted_data = openssl_encrypt($s, 'aes-256-cbc', hex2bin($key), OPENSSL_RAW_DATA, $iv);
    $data = array("data" => base64_encode($encrypted_data), "iv" => bin2hex($iv), "salt" => bin2hex($salt));
    return json_encode($data);
	}


/**
  * @desc executes a prepared SQL statement
  * @return JSON string, OK or error message
	*/
	public function prepared($array) {
		$func = $this->unBackTick($this->table);

		if (!method_exists($this, $func)) {
			echo $this->err('prepared', $func.' does not exists');
			return;
		}

		$this->array = $array;
		$this->params = $this->getParams($array);
	
		$return = call_user_func(array($this, $func));

		//returned value can be false, a SQL statement or a resultset
		if ($return == false) {
			$res = json_encode(array('Ok' => 'Executed' ));
		} elseif (is_string($return)) {
			if (!$this->isJson($return)) {
				$res = $this->queryJSON($return);
			} else {
				$res = $return;
			}
		} else {
			$res = json_encode(array('Ok' => 'Unknown result' ));
		}
	
		if ($this->crypt) {
			$res = $this->encrypt($_SESSION['token'], $res);
		}

		echo $res;
	}

}


$params = isset($_GET) ? $_GET : array();
$run = new ESPBA($params);


?>
