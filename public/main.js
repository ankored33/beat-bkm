
$(function(){
  $('.entries').on('click', '.bkmcount', function(){
    var postUrl = $(this).parent().find('a').prop('href');
    var title = $(this).parent().find('a').text();
    $(this).text('...');
    console.log(postUrl);
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
          var bkmSource = JSON.parse(json);
          $('#main').html(''
            + '<div id="bkm-head">'
            + '  <div id="entry-preview">'
            + '     <a href="http://b.hatena.ne.jp/entry/' + postUrl + '" target="_blank">「' + title +'」のブックマーク</a>'
            + '  </div>'
            + '  <div id="float-right">'
            + '    <div>'
            + '      <label for="check">'
            + '      ｜殴る<input type="checkbox" id="check" />'
            + '      </label>'
            + '      ＊注意＊音が鳴ります｜'
            + '    </div>'
            + '    <div id="bkm-remaining">'
            + '      公開ブクマ <span id="bkm-remaining-figure">' + bkmSource.length + '</span>users'
            + '    </div>'
            + '  </div>'
            + '</div>'
            + '<div id="bkm-contents"></div>'
          );
          bkmSource.forEach(function(source){
            var rand = Math.floor( Math.random() * 7 );
            var cl
            if (rand == 0) { cl = "#ffebee"
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
        });
      },
      error: function() {
      $('#contents').text('error');
      }
      });
  });
});


var beat = true;
$(function() {
  $('#float-right').on('change', '#check', function(){
  	if ($(this).is(':checked')) {
  	  beat = true;
  	  console.log('beat is false');
  	  $('.bkm-box').css('cursor', 'url("img/fist.png"), pointer');
  	} else {
      beat = false;
      console.log('beat is true');
  	  $('.bkm-box').css('cursor', 'auto');
  	}
  });
});

$(function(){
    $('#bkm-contents').on('click', '.bkm-box', function(){
      if (beat == true) {
        var size = Number($('#bkm-remaining-figure').text());
        var txt = $(this).find('.bkm-comment').text();
        var i = txt.length;
        console.log(txt);
        console.log(i);
        var voiceRand = Math.floor( Math.random() * 10 );
        var leftRand = Math.floor( Math.random() * 1200 );
        var rival
          if ($(this).find('.bkm-user').text().slice(0,1).match(/[a-g]/) != null ) {
            rival = '00';
          } else if ($(this).find('.bkm-user').text().slice(0,1).match(/[h-n]/) != null ) {
            rival = '01';
          } else if ($(this).find('.bkm-user').text().slice(0,1).match(/[o-u]/) != null ) {
            rival = '02';
          } else {
            rival = '03';
          }
        console.log(rival);
        var safeRand = Math.floor( Math.random() * 4 );
        var pinchRand = Math.floor( Math.random() * 3 );

        if (i == "") {
          $(this).css('z-index','100');
          $('.sound0'+voiceRand).get(0).currentTime = 0;
          $('.sound0'+voiceRand).get(0).play();
          $.when(
            $(this).animate({ 'bottom':'300px','right': leftRand },150)
          ).done(function() {
            $(this).hide();
            $('#bkm-remaining-figure').text(size - 1);
            $(this).attr('class', "bkm-box-dead");
          });
        } else if (Number(i) > 10) {
          $('.rival'+ rival + '-safe0' + safeRand).get(0).currentTime = 0;
          $('.rival'+ rival + '-safe0' + safeRand).get(0).play();
          $.when(
            $(this).animate({ 'left' : '15px' },50)
          ).done(function() {
            $(this).animate({ 'left':'0px' },50);
          });
          $(this).find('.bkm-comment').text(txt.replace(/......$/,""));
        } else if (Number(i) > 1 && Number(i) <= 10 ) {
          $('.rival'+ rival + '-pinch0' + pinchRand).get(0).currentTime = 0;
          $('.rival'+ rival + '-pinch0' + pinchRand).get(0).play();
          $.when(
            $(this).animate({ 'left' : '15px' },50)
          ).done(function() {
            $(this).animate({ 'left':'0px' },50);
          });
          i = i - 1;
          $(this).find('.bkm-comment').text(txt.replace(/.$/,""));
          $(this).find('.bkm-comment').css('color', 'red');
          $(this).find('.bkm-user').css('color', 'red');
        } else if (Number(i) === 1) {
          $('.rival' + rival + '-die').get(0).currentTime = 0;
          $('.rival' + rival + '-die').get(0).play();
          $(this).fadeOut(1500);
          $(this).attr('class', 'bkm-box-dead');
          $('#bkm-remaining-figure').text(size - 1);
        }
      } else {
        console.log('noevent');
      }
    });
});


/*　クリアした時に音を鳴らしたいが要素書き換えはchangeイベントで拾えないっぽい？？
  $(function(){
     $('#bkm-remaining').on('change', '#bkm-remaining-figure', function(){
       console.log('change')
          if ($('#bkm-remaining-figure').text() == 0) {
            $(function(){
              setTimeout(function(){
                $('.clear').get(0).currentTime = 0;
                $('.clear').get(0).play();                
              },3000);
            });
          } else {
          }
    });
  });
*/