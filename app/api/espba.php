<?
/**
 * espba.php		Database driver for the ESPBA angular 1.x service
 * @copyright   Copyright (C) 2017 david konrad, davidkonrad at gmail com
 * @license     Licensed under the MIT License; see LICENSE.md
 */

error_reporting(E_ALL & ~E_NOTICE); 
ini_set('display_errors', '1');

session_start();

include('Db.php');
include('prepared.php');
include('UserReactions.php');
include('events.php'); //prepared statements for events
include('associations.php'); //prepared statements for associations

class ESPBA extends DbPDO {
	use Prepared, UserReactions, Events, Associations;

	private $table;
	private $action;
	private $token;
	private $fields;

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

		unset($array['__table']);
		unset($array['__action']);
		unset($array['__token']);

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
  * @desc set token
  * @return JSON string
	*/
	private function init() {
		$_SESSION['token'] = bin2hex(openssl_random_pseudo_bytes(20));
		$response = array('token' => $_SESSION['token']);
		echo json_encode($response);
	}

/**
  * @desc check token, dies if not valid
	*/
	private function checkToken() {
		return; //check why session comparison sometimes fail

		//pass if localhost
		if ($this->isLocalhost()) {
			return;
		}
		if (!isset($_SESSION['token']) || $this->token != $_SESSION['token']) {
			$response = array('error' => 'Not authenticated');
			echo json_encode($response);
			die();
		}
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
			//$_GET converts . to _, so every . is converted to dot in the js service
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
		$this->checkToken();

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
		$this->checkToken();

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

		//return used SQL
		//echo json_encode(array('sql' => $SQL ));
	}


/**
  * @desc executes a INSERT based on params in $array
  * @param array $array
  * @return JSON string
	*/
	public function insert($array) {
		$this->checkToken();

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
		$this->checkToken();

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
			echo json_encode(array('Ok' => 'Executed' ));
		} elseif (is_string($return)) {
			if (!$this->isJson($return)) {
				$result = $this->queryJSON($return);
				echo $result;
			} else {
				echo $return;
			}
		} else {
			echo json_encode(array('Ok' => 'Unknown result' ));
		}
	}

}


$params = isset($_GET) ? $_GET : array();
$run = new ESPBA($params);



?>
