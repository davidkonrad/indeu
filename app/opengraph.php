<?
include('api/Db.php');

class OG extends DbPDO {
	private $title;
	private $desc;
	private $image;
	private $height;
	private $width;
	private $url;
	
	public function __construct($request) {
		parent::__construct();

		$this->url = 'https://indeu.org'.$request;

		$params = explode('/', $request);
		$type = $params[1];
		$id = $params[2];

		switch ($type) {
			case 'a':
			case 'artikel': 
				$SQL='select header, sub_header, content, image from article where id='.$id;
				$res = $this->query($SQL);
				$row = $res->fetch();

				$this->title = $row['header'];

				if ($row['sub_header'] != '') {
					$this->desc = strip_tags($row['sub_header']);
				} else {
					$this->desc = substr(strip_tags($row['content']), 0, 199);
				}

				if ($row['image'] != '') {
					$path = 'media/artikel/'.$row['image'];
					$this->image = 'https://indeu.org/'.$path;
					$size = getimagesize($path);
					$this->width = $size[0];
					$this->height = $size[1];
				}

				break;

			default:
				break;
		}

		/*
		echo $this->title.'<br>';
		echo $this->desc.'<br>';
		echo $this->image.'<br>';
		echo $this->width.'<br>';
		echo $this->height.'<br>';
		echo $this->url.'<br>';
		*/
	}
	
	public function render() {
		echo '<meta property="og:locale" content="da_DK">'."\n";
		echo '<meta property="og:site_name" content="indeu.org">'."\n";
		echo '<meta property="og:title" content="'.$this->title.'">'."\n";
		echo '<meta property="og:type" content="article">'."\n";
		echo '<meta property="og:url" content="'.$this->url.'">'."\n";
		echo '<meta property="og:image" content="'.$this->image.'">'."\n";
		echo '<meta property="og:image:secure_url" content="'.$this->image.'">'."\n";
		echo '<meta property="og:image:width" content="'.$this->width.'">'."\n";
		echo '<meta property="og:image:height" content="'.$this->height.'">'."\n";
		echo '<meta property="og:description" content="'.$this->desc.'">'."\n";
	}

}
//$_SERVER['REQUEST_URI']
//$test = '/artikel/2/0-0-1-alpha-alpha';
//$og = new OG($test);
$og = new OG($_SERVER['REQUEST_URI']);

?>

<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
		<title>indeu.org</title>
		<meta name="description" content="">		
		<meta name="robots" content="all,index,follow">
		<link rel="shortcut icon" href="images/fav/favicon.ico" type="image/x-icon" />
		<link rel="canonical" href="https://indeu.org" />

<?
	$og->render();
?>

	</head>
	<body>
   
	</body>
</html>

