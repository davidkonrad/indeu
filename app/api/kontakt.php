<?

/*
ini_set('display_errors', '1');
error_reporting(E_ALL);
*/

$host = $_SERVER["SERVER_ADDR"]; 
$localHost = ($host=='127.0.0.1' || $host=='::1');
if ($localHost) {
	header('Access-Control-Allow-Origin	: *');
}

$emne	=	$_GET["emne"];
$email =	$_GET["email"];
$bemaerk = $_GET["bemaerk"];
$telefon = $_GET["telefon"];
$navn = $_GET["navn"];

//send
ini_set('SMTP', 'asmtp.unoeuro.com');
ini_set('SMTP_PORT', '587');

$body='<html><body>'.
      'Ny Kontaktformular - '.date(DATE_RFC822).'<br>'.
      'Fra : '. $navn. '<br>'.
      'Telefon : '. $telefon. '<br>'.
      'Email : '. $email .'<br>'.
			'Emne : '. $emne . '<br>'.
      'Tekst : '. $bemaerk .'<br><br>'.
      '</body></html>';

$headers ='';
$headers .= 'Content-type: text/html; charset=utf-8' . "\r\n";
$headers .= 'From: Kontaktformular<kontaktformular@gulve.online>';

//also send mail to me, test!
$result=mail('davidkonrad@gmail.com','Kontaktformular', $body, $headers);

$result=mail('info@gulve.online','Kontaktformular', $body, $headers);

//send reminder to info@hallandparket.dk
$result=mail('info@hallandparket.dk','Kontaktformular', $body, $headers);

if ($result) {
	echo json_encode(array('message' => true ));
} else {
	echo json_encode(array('message' => false ));
}

?>
