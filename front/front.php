<!DOCTYPE html>
<html>
  <head>
    <title>Kettcards Web2Print</title>
    <meta charset="utf-8">
    <link rel="icon" href="/favicon.ico" type="image/x-icon">
    <link rel="stylesheet" href="./style.css">
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" 
            integrity="sha256-4+XzXVhsDmqanXGHaHvgh1gMQKX40OUvDEBTu8JcmNs=" 
            crossorigin="anonymous"></script>
    <script>
    <?php 
    if(empty($_GET['card'])){
      echo "window.location.href = '/tileview/tileview.html'";
    }
    ?>
    </script>
  </head>
  <body>
    <div id="editor-container">
      <div id="toolbar">
        <div class="toolbar-row" data-name="Add Elements">
          <button class="addElBtn" data-enum="TEXT">Text</button>
          <button class="addElBtn" data-enum="IMAGE">Image</button>
          <button class="addElBtn" data-enum="GEOM">Geometry</button>
        </div>
        <div class="toolbar-row" data-name="dbg">
          <button onclick="debugger;"> test </button>
        </div>
      </div>
      <div id="holder">
        <div class="center"></div>
      </div>
    </div>
    <div id="toolBox" style="visibility: hidden;">
      <div>
        <button class="fontTypeButton" value="b">B</button><!--
     --><button class="fontTypeButton" value="i">I</button><!--
     --><button class="fontTypeButton" value="u">U</button>
      </div>
      <div>
        <button id="moveBtn">M</button><!--
     --><button class="alignmentBtn" value="left">L</button><!--
     --><button class="alignmentBtn" value="center">C</button><!--
     --><button class="alignmentBtn" value="right">R</button>
      </div>      
    </div>
    <script>
    <?php 

    ini_set('display_errors', 1);
    error_reporting(E_ALL);
    
    require '../db.php';
    
    $conn = new DBConnection();

    if(!empty($_GET['card'])){
      $res = $conn->queryAssert('SELECT breite, hoehe, materialien.texturSlug, motive.texturSlug FROM karten JOIN (seiten, materialien, seitenverhaeltnisse, seiten_motiv_zuweisungen, motive) ON (karten.k_id = seiten.k_id AND seiten.mat_id = materialien.mat_id AND seiten.sv_id = seitenverhaeltnisse.sv_id AND seiten_motiv_zuweisungen.s_id = seiten.s_id AND motive.m_id = seiten_motiv_zuweisungen.m_id) WHERE karten.bestellnummer="'.$_GET['card'].'" order by seiten.nummer asc;');
      if($res){
        echo 'var pages = [';
        while($row = $res->fetch_row()){
          //{w:800, h:400, i:'https://www.kreativ-offensive.de/gfx/artibalta/WD109.jpg', g:''},
          echo '{w:', $row[0],', h:',$row[1],', i: "',$row[3],'", g:"" },';
        }
        echo '];';
      } else {
        echo "alert('Die übergebene Karten-ID existiert in unserer Datenbank leider nicht!');",
             "window.location.href = '/tileview/tileview.html'";
      }
    }
    ?>
    </script>
    <script src="./front.js"></script>
  </body>
</html>
