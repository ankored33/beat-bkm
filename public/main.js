/*ホットエントリーのブックマーク呼び出し------------------------------------------------------------*/
$(function(){
  $('.entries').on('click', '.bkmcount', function(){
    var postUrl = $(this).parent().find('a').prop('href');
    var title = $(this).parent().find('a').text();
    $.ajax({
      type: "POST",
      url: "/post",
      dataType: "text",
      data: {
        post_url: postUrl,
      },
      success: function(json) {
      dataType: "json",
        $(function(){
          window.scrollTo( 0, 0 ) ;
          var bkmSource = JSON.parse(json);
          $('#main').html(''
            + '<div id="bkm-head">'
            + '  <div id="entry-preview">'
            + '     <a href="' + postUrl + '" target="_blank">' + title +'</a> のはてブ一覧'
            + '  </div>'
            + '  <div id="float-right">'
            + '    <div>'
            + '      <label for="check">'
            + '      ｜殴る<input type="checkbox" id="check" />'
            + '      </label>'
            + '      ＊注意＊音が鳴ります｜'
            + '    </div>'
            + '    <div id="bkm-remaining">'
            + '      <a id="bkm-remaining-figure" href="http://b.hatena.ne.jp/entry/' + postUrl + '" target="_blank">' + bkmSource.length + '</a>users'
            + '    </div>'
            + '  </div>'
            + '</div>'
            + '<div id="bkm-contents"></div>'
          );
          bkmSource.forEach(function(source){
            var rand = Math.floor( Math.random() * 7 );
            var cl;
            if (rand == 0) { cl = "#ffebee";
            } else if (rand == 1) { cl = "#ede7f6";
            } else if (rand == 2) { cl = "#fbe9e7";
            } else if (rand == 3) { cl = "#e1f5fe";
            } else if (rand == 4) { cl = "#e8f5e9";
            } else if (rand == 5) { cl = "#fffde7";
            } else if (rand == 6) { cl = "#eceff1";
            }
            $('#bkm-contents').append(''
              + '<div class="bkm-box"  style="background-color:' + cl + '">'
              + '  <div class="bkm-user">' + source['user'] + '</div>'
              + '  <div class="bkm-icon"><img src="' + source['icon'] + '" width="48px" height="48px"></div>'
              + '  <div class="bkm-comment">'+ source['comment'] +'</div>'
              + '</div>'
            );
          });
          $('#bkm-contents').append(''
          + '<div class="bkm-box-cm"  style="background-color:#D3D3D3">'
          + ' <div style="font-weight:bold;">《広告》</div>'
          + ' <a href="https://px.a8.net/svt/ejp?a8mat=2NHZ7S+7QMWNU+50+2HCB1D" target="_blank"><img border="0" width="100" height="60" alt="" src="https://www28.a8.net/svt/bgt?aid=160402312468&wid=002&eno=01&mid=s00000000018015006000&mc=1"></a><img border="0" width="1" height="1" src="https://www14.a8.net/0.gif?a8mat=2NHZ7S+7QMWNU+50+2HCB1D" alt="">'
          + '</div>'
          + '<div class="bkm-box-cm"  style="background-color:#D3D3D3">'
          + ' <div style="font-weight:bold;">《広告》</div>'
          + ' <a href="https://px.a8.net/svt/ejp?a8mat=2TA5W8+123S9M+3NMW+61JSH" target="_blank"><img border="0" width="234" height="60" alt="" src="https://www28.a8.net/svt/bgt?aid=170115416064&wid=002&eno=01&mid=s00000017060001015000&mc=1"></a><img border="0" width="1" height="1" src="https://www18.a8.net/0.gif?a8mat=2TA5W8+123S9M+3NMW+61JSH" alt="">'
          + '</div>'
          + '<div class="bkm-box-cm"  style="background-color:#D3D3D3">'
          + ' <div style="font-weight:bold;">《広告》</div>'
          + ' <a href="https://px.a8.net/svt/ejp?a8mat=2TA5W8+UD5EI+3N2C+5ZMCH" target="_blank"><img border="0" width="234" height="60" alt="" src="https://www29.a8.net/svt/bgt?aid=170115416051&wid=002&eno=01&mid=s00000016986001006000&mc=1"></a><img border="0" width="1" height="1" src="https://www19.a8.net/0.gif?a8mat=2TA5W8+UD5EI+3N2C+5ZMCH" alt="">'
          + '</div>'
          );
        });
      },
      error: function() {
      location.href='/error' + escapedVal;
      }
      });
  });
});


/*URL直接指定でのブックマーク呼び出し------------------------------------------------------------*/
$(function(){
  $('#menu').on('click', '#submit', function(){
    var val = $('#input').val();
    var escapedVal = encodeURIComponent(val);
    location.href='/site?url=' + escapedVal;
  });
});


/*checkbox------------------------------------------------------------*/
var canBeat = false;
$(function() {
  $('#main').on('change', '#check', function(){
  	if ($(this).is(':checked')) {
  	  canBeat = true;
      registerSound();
  	  $('.bkm-box').css('cursor', 'pointer');
  	  $('.bkm-box-cm').css('cursor', 'pointer');
  	  $('.cm-box').css('cursor', 'pointer');
  	} else {
      canBeat = false;
  	  $('.bkm-box').css('cursor', 'auto');
  	  $('.bkm-box-cm').css('cursor', 'auto');
  	  $('.cm-box').css('cursor', 'auto');
  	}
  });
});


/*殴る------------------------------------------------------------*/
var leftRand;
var screamRand;
var beatRand;
var rival;
var i;
var txt;
var size;
var damageRand;

function beatBkm (bkm) {
  leftRand = Math.floor( Math.random() * 1200 );
  $(bkm).css('z-index','100');
  $.when(
    $(bkm).animate({ 'bottom':'300px','right': leftRand },150)
    ).done(function() {
    $(bkm).attr('class', "bkm-box-dead");
  });  
}

$(function(){
    $('#main').on('click', '.bkm-box', function(){
      if (canBeat == true) {
        size = Number($('#bkm-remaining-figure').text());
        txt = $(this).find('.bkm-comment').text();
        i = txt.length;
        beatRand = Math.floor( Math.random() * 4 );
        screamRand = Math.floor( Math.random() * 6 );        
          if ($(this).find('.bkm-user').text().slice(0,1).match(/[a-g]/) != null ) {
            rival = '00';
          } else if ($(this).find('.bkm-user').text().slice(0,1).match(/[h-n]/) != null ) {
            rival = '01';
          } else if ($(this).find('.bkm-user').text().slice(0,1).match(/[o-u]/) != null ) {
            rival = '02';
          } else {
            rival = '03';
          }
        if (Number(i) <= 40) {
          playSound('beat0'+ beatRand);
          $('#bkm-remaining-figure').text(size - 1);
          beatBkm(this);
        } else if (Number(i) > 40 && Number(i) <= 100) {
          playSound('scream0'+ screamRand);
          $('#bkm-remaining-figure').text(size - 1);
          beatBkm(this);
        } else if (Number(i) > 100 ) {
          playSound('rival' + rival + '-die');
          $(this).find('.bkm-comment').css('color', 'red');
          $(this).find('.bkm-user').css('color', 'red');
          $.when(
          $(this).fadeOut(1500)
          ).done(function(){
            $(this).attr('class', 'bkm-box-dead')
          });
          $('#bkm-remaining-figure').text(size - 1);
        }
      } else {
      }
    });
});

$(function(){
  $('#main').on('click', '.bkm-box-cm', function(){
    if (canBeat == true) {
      beatBkm(this);
      playSound('beat01');
    }
  });
});

$(function(){
  $('#cm-container').on('click', '.cm-box', function(){
    if (canBeat == true) {
      beatBkm(this);
      playSound('beat00');
    }
  });
});


/*SoundJS ------------------------------------------------------------*/
function registerSound () {
  var manifest = 
      [{src:'/sound/beat00.mp3', id:'beat00'},
      {src:'/sound/beat01.mp3', id:'beat01'},
      {src:'/sound/beat02.mp3', id:'beat02'},
      {src:'/sound/beat03.mp3', id:'beat03'},
      {src:'/sound/scream00.mp3', id:'scream00'},
      {src:'/sound/scream01.mp3', id:'scream01'},
      {src:'/sound/scream02.mp3', id:'scream02'},
      {src:'/sound/scream03.mp3', id:'scream03'},
      {src:'/sound/scream04.mp3', id:'scream04'},
      {src:'/sound/scream05.mp3', id:'scream05'},
      {src:'/sound/rival/cool/die.mp3', id:'rival00-die'},
      {src:'/sound/rival/hero/die.mp3', id:'rival01-die'},
      {src:'/sound/rival/priest/die.mp3', id:'rival02-die'},
      {src:'/sound/rival/witch/die.mp3', id:'rival03-die'}];
    createjs.Sound.registerSounds(manifest);
}

var sound;
function playSound(soundId){
    sound = createjs.Sound.play(soundId);
    sound.volume = 0.2;
}
