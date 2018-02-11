<?

function convert($s) {
	$s = str_replace('æ', '&aelig;', $s);
	return $s;
}

$email = $_POST['email'];
$subject = $_POST['subject'];
$body = $_POST['body'];

//encode subject
mb_internal_encoding('UTF-8');
$encoded_subject = mb_encode_mimeheader("Subject: $subject", 'UTF-8');
$encoded_subject = substr($encoded_subject, strlen('Subject: '));

//headers
$headers ='';
$headers .= 'Content-type: text/html; charset="UTF-8"' ."\r\n";
$headers .= 'From: noreply@indeu.org<noreply@indeu.org>' ."\r\n";
$headers .= 'Reply-To: info@indeu.org' ."\r\n";
$headers .= 'Content-Transfer-Encoding: 8bit' ."\r\n";
$headers .= 'X-Priority: 3' ."\r\n";
$headers .= 'Organization: indeu.org'. "\r\n";
$headers .= 'MIME-Version: 1.0' ."\r\n" ;

$result = mail($email, $encoded_subject, $body, $headers);

print_r($result);
?>
