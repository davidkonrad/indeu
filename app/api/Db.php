<?
/**
 * Db.php				PDO wrapper for ESPBA
 * @copyright   Copyright (C) 2017 david konrad, davidkonrad at gmail com
 * @license     Licensed under the MIT License; see LICENSE.md
 */


/*
ini_set('display_errors', '1');
error_reporting(E_ALL);
*/

/**
 * Fill out your credentuils
 **/	 
include('pw.php');

/**
 * If you want to use an alternative "driver" for ESPBA, extend this abstract class and fill out the blanks
 **/	 
abstract class DbProvider {
	protected $database;
	protected $hostname;
	protected $username;
	protected $password;
	protected $charset = 'utf8';
	abstract protected function isLocalhost();		//localhost or production
	abstract protected function query($SQL);			//perform a query on a fully qualified SQL statement and return the result
	abstract protected function exec($SQL);				//perform a query on a fully qualified SQL statement and do not return the result
	abstract protected function s($s);						//escape a string
	abstract protected function error();					//return errorinfo
	abstract protected function affected();				//return affected rows
	abstract protected function lastInsertId();		//return last insert Id
	abstract protected function queryJSON($SQL);	//return the result of a query() as JSON
}

/**
 * default Db provider using PDO
 **/ 
class DbPDO extends DbProvider {
	private $pdo;
  
	public function __construct() { 
		global $pw_local, $pw_server;

		if ($this->isLocalhost()) {
			$this->database = $pw_local['database']; 
			$this->hostname = $pw_local['hostname'];
			$this->username = $pw_local['username'];
			$this->password = $pw_local['password'];
		} else {
			$this->database = $pw_server['database']; 
			$this->hostname = $pw_server['hostname'];
			$this->username = $pw_server['username'];
			$this->password = $pw_server['password'];
		}

		$dsn = "mysql:host=".$this->hostname.";dbname=".$this->database.";charset=".$this->charset;
		$opt = [
	    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
	    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
	    PDO::ATTR_EMULATE_PREPARES   => false
		];

		try {
			$this->pdo = new PDO($dsn, $this->username, $this->password, $opt);
		} catch(PDOException $e) {
			echo "Error connecting to database: ". $e->getMessage();
		}
	}

	protected function isLocalhost() {
		$host = $_SERVER["SERVER_ADDR"]; 
		if (($host=='127.0.0.1') || ($host=='::1')) {
			return true;
		} else {
			return false;
		}
	}
			
	protected function query($SQL) {
		try {
			$result = $this->pdo->query($SQL);
			return $result;
		} catch(Exception $e) {
			return array('error' => $e->getMessage());
		}
	}

	protected function exec($SQL) {
		try {
			$this->pdo->query($SQL);
		} catch(Exception $e) {
			return array('error' => $e->getMessage());
		}
	}

/**
	* Any string value is quoted, and inside quotes is escaped. 
	* Along with ATTR_EMULATE_PREPARES == false will this prevent SQL injection
	* ;drop table user;-- as an evil attempt will insert ';drop table user;--' as field value
	* Please report any mistakes with this approach
	*/
	protected function s($s) {
		return $this->pdo->quote($s);
	}

	protected function error() {
		$err = $this->pdo->errorInfo();
		$err = ($err && is_array($err) && $err[0] != '00000') ? implode(';', $err) : false;
		return $err;
	}


/**
	* Does not work with MySQL
	*/
	protected function affected() {
		//return $this->pdo->rowCount();
		return 1;
	}

	protected function lastInsertId() {
		return $this->pdo->lastInsertId();
	}

	protected function queryJSON($SQL) {
		$result = $this->query($SQL);

		if (!$result instanceof PDOStatement) {
			return json_encode($result);
		}

		$return = array();
		while ($row = $result->fetch()) {
			$return[] = $row;
		}

		return json_encode($return);
	}

}

?>
