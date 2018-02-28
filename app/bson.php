<?

$pass = '123456';
$method = 'aes128';
$iv = '4f01bede9221586c';
$enc_data = openssl_encrypt('dette er en test', $method, $pass, null, $iv);
echo $enc_data;


?>
