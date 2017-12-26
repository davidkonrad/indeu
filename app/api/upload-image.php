<?
	//header('Access-Control-Allow-Origin: *');	

	function getExt($src) {
		$path_info = pathinfo($src);
		return strtolower($path_info['extension']);
	}

	function make_thumb($src, $dest, $desired_width) {

		$ext = getExt($src);

		/* read the source image */
		switch ($ext) {
			case 'jpg' :
			case 'jpeg' :
				$source_image = imagecreatefromjpeg($src);
				break;
			case 'png' :
				$source_image = imagecreatefrompng($src);
				break;
			case 'gif' :
				$source_image = imagecreatefromgif($src);
				break;
			default :
				//do not create thumb
				return;
		}

		$width = imagesx($source_image);
		$height = imagesy($source_image);

		/* find the "desired height" of this thumbnail, relative to the desired width  */
		$desired_height = floor($height * ($desired_width / $width));
		
		/* create a new, "virtual" image */
		$virtual_image = imagecreatetruecolor($desired_width, $desired_height);

		/* copy source image at a resized size */
		imagecopyresampled($virtual_image, $source_image, 0, 0, 0, 0, $desired_width, $desired_height, $width, $height);

		/* create the physical thumbnail image to its destination */
		switch ($ext) {
			case 'jpg' :
			case 'jpeg' :
				imagejpeg($virtual_image, $dest);
				break;
			case 'png' :
				imagepng($virtual_image, $dest);
				break;
			case 'gif' :
				imagegif($virtual_image, $dest);
				break;
			default :
				//we should really never land here but exited above
				return;
		}

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
