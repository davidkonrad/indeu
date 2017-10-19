<?
	header('Access-Control-Allow-Origin: *');	


	//https://stackoverflow.com/a/44323040/1407478
	function make_thumb($src, $dest, $desired_width) {

		/* read the source image */
		$source_image = imagecreatefromjpeg($src);
		$width = imagesx($source_image);
		$height = imagesy($source_image);

		/* find the "desired height" of this thumbnail, relative to the desired width  */
		$desired_height = floor($height * ($desired_width / $width));
		
		/* create a new, "virtual" image */
		$virtual_image = imagecreatetruecolor($desired_width, $desired_height);

		/* copy source image at a resized size */
		imagecopyresampled($virtual_image, $source_image, 0, 0, 0, 0, $desired_width, $desired_height, $width, $height);

		/* create the physical thumbnail image to its destination */
		imagejpeg($virtual_image, $dest);
	}

	$filename = $_FILES['file']['name'];
	$path_info = pathinfo($filename);
	$ext = $path_info['extension'];
	$new = time().'.'.$ext;
  $meta = $_POST;
  $destination = $meta['targetPath'] . $new; 
  move_uploaded_file( $_FILES['file']['tmp_name'] , $destination );
	
	//
	$thumb = explode('/', $destination);
	array_splice($thumb, count($thumb)-1, 0, 'thumbs');
	$thumb = implode('/', $thumb);
	make_thumb($destination, $thumb, 200);
	//

	$a = array(
		'thumb' => $thumb,
		'destination' => $destination,
		'filename' => $new
	);
	echo json_encode($a);
?>
