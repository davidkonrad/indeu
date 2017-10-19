<?
	header('Access-Control-Allow-Origin: *');	

/**
	* TODO
	* hopefully the .htaccess will protect from attackers (must re-check)
	*/


if ($_GET['filename']) {
	$file = '../media-uploads/'.$_GET['filename'];
	unlink($file);
	echo json_encode(array('success' => !file_exists($file)));
}

?>
