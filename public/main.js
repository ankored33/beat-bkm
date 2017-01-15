/*ブックマーク呼び出し------------------------------------------------------------*/
$(function(){
  $('.entries').on('click', '.bkmcount', function(){
    var postUrl = $(this).parent().find('a').prop('href');
    var title = $(this).parent().find('a').text();
    registerSound();
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
            + '     <a href="http://b.hatena.ne.jp/entry/' + postUrl + '" target="_blank">はてなブックマーク――' + title +'</a>'
            + '  </div>'
            + '  <div id="float-right">'
            + '    <div>'
            + '      <label for="check">'
            + '      ｜殴る<input type="checkbox" id="check" />'
            + '      </label>'
            + '      ＊注意＊音が鳴ります｜'
            + '    </div>'
            + '    <div id="bkm-remaining">'
            + '      <span id="bkm-remaining-figure">' + bkmSource.length + '</span>users'
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
          + ' <a href="https://px.a8.net/svt/ejp?a8mat=2TA3JG+448Z6I+3OIK+601S1" target="_blank"><img border="0" width="234" height="60" alt="" src="https://www20.a8.net/svt/bgt?aid=170112364249&wid=002&eno=01&mid=s00000017174001008000&mc=1"></a><img border="0" width="1" height="1" src="https://www16.a8.net/0.gif?a8mat=2TA3JG+448Z6I+3OIK+601S1" alt="">'
          + '</div>'
          + '<div class="bkm-box-cm"  style="background-color:#D3D3D3">'
          + ' <div style="font-weight:bold;">《広告》</div>'
          + ' <a href="https://px.a8.net/svt/ejp?a8mat=2TA5W3+FA4KII+3L4M+6F9M9" target="_blank"><img border="0" width="468" height="60" alt="" src="https://www29.a8.net/svt/bgt?aid=170115411924&wid=002&eno=01&mid=s00000016735001079000&mc=1"></a><img border="0" width="1" height="1" src="https://www14.a8.net/0.gif?a8mat=2TA5W3+FA4KII+3L4M+6F9M9" alt="">'
          + '</div>'
          );
        });
      },
      error: function() {
      $('#contents').text('error');
      }
      });
  });
});

/*checkbox------------------------------------------------------------*/
var canBeat = false;
$(function() {
  $('#main').on('change', '#check', function(){
  	if ($(this).is(':checked')) {
  	  canBeat = true;
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
    $(bkm).hide();
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
        if (Number(i) <= 30) {
          playSound('beat0'+ beatRand);
          $('#bkm-remaining-figure').text(size - 1);
          beatBkm(this);
        } else if (Number(i) > 30 && Number(i) <= 100) {
          playSound('scream0'+ screamRand);
          $('#bkm-remaining-figure').text(size - 1);
          beatBkm(this);
        } else if (Number(i) > 100 ) {
          playSound('rival'+ rival + '-safe');
          $.when(
            $(this).animate({ 'left' : '15px' },50)
          ).done(function() {
            $(this).animate({ 'left':'0px' },50);
          });
          i = i - 1;
          $(this).attr('class', 'bkm-box-rival');
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



/*殴る(rival)------------------------------------------------------------*/
$(function(){
    $('#main').on('click', '.bkm-box-rival', function(){
      if (canBeat == true) {
        size = Number($('#bkm-remaining-figure').text());
        txt = $(this).find('.bkm-comment').text();
        i = txt.length;
        damageRand = Math.floor( Math.random() * 4 );
          if ($(this).find('.bkm-user').text().slice(0,1).match(/[a-g]/) != null ) {
            rival = '00';
          } else if ($(this).find('.bkm-user').text().slice(0,1).match(/[h-n]/) != null ) {
            rival = '01';
          } else if ($(this).find('.bkm-user').text().slice(0,1).match(/[o-u]/) != null ) {
            rival = '02';
          } else {
            rival = '03';
          }
        if (Number(i) >= 20 ) {
          playSound('rival'+ rival + '-damage0' + damageRand);
          $.when(
            $(this).animate({ 'left' : '15px' },50)
          ).done(function() {
            $(this).animate({ 'left':'0px' },50);
          });
          i = i - 1;
          $(this).find('.bkm-comment').text(txt.replace(/....................$/,""));
        }
        else if (Number(i) < 20) {
          playSound('rival' + rival + '-die');
          $(this).find('.bkm-comment').css('color', 'red');
          $(this).find('.bkm-user').css('color', 'red');
          $(this).fadeOut(1500);
          $(this).attr('class', 'bkm-box-dead');
          $('#bkm-remaining-figure').text(size - 1);
        }
      } else {
        console.log('checkbox false');
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
      {src:'/sound/rival/cool/damage00.mp3', id:'rival00-damage00'},
      {src:'/sound/rival/cool/damage01.mp3', id:'rival00-damage01'},
      {src:'/sound/rival/cool/damage02.mp3', id:'rival00-damage02'},
      {src:'/sound/rival/cool/damage03.mp3', id:'rival00-damage03'},
      {src:'/sound/rival/cool/safe.mp3', id:'rival00-safe'},
      {src:'/sound/rival/cool/die.mp3', id:'rival00-die'},
      {src:'/sound/rival/hero/damage00.mp3', id:'rival01-damage00'},
      {src:'/sound/rival/hero/damage01.mp3', id:'rival01-damage01'},
      {src:'/sound/rival/hero/damage02.mp3', id:'rival01-damage02'},
      {src:'/sound/rival/hero/damage03.mp3', id:'rival01-damage03'},
      {src:'/sound/rival/hero/safe.mp3', id:'rival01-safe'},
      {src:'/sound/rival/hero/die.mp3', id:'rival01-die'},
      {src:'/sound/rival/priest/damage00.mp3', id:'rival02-damage00'},
      {src:'/sound/rival/priest/damage01.mp3', id:'rival02-damage01'},
      {src:'/sound/rival/priest/damage02.mp3', id:'rival02-damage02'},
      {src:'/sound/rival/priest/damage03.mp3', id:'rival02-damage03'},
      {src:'/sound/rival/priest/safe.mp3', id:'rival02-safe'},
      {src:'/sound/rival/priest/die.mp3', id:'rival02-die'},
      {src:'/sound/rival/witch/damage00.mp3', id:'rival03-damage00'},
      {src:'/sound/rival/witch/damage01.mp3', id:'rival03-damage01'},
      {src:'/sound/rival/witch/damage02.mp3', id:'rival03-damage02'},
      {src:'/sound/rival/witch/damage03.mp3', id:'rival03-damage03'},
      {src:'/sound/rival/witch/safe.mp3', id:'rival03-safe'},
      {src:'/sound/rival/witch/die.mp3', id:'rival03-die'}];
    createjs.Sound.registerSounds(manifest);
}

var sound;
function playSound(soundId){
    sound = createjs.Sound.play(soundId);
    sound.volume = 0.2;
}
