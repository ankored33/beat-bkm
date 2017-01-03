    var se = $('.btnsound');
    var beat = true;

    
$(function() {
  $('#float-right').on('change', '#check', function(){
  	if ($(this).is(':checked')) {
  	  beat = false;
  	  console.log('beat is false');
  	  $('.bkm-box').css('cursor', 'auto');
  	} else {
      beat = true;
      console.log('beat is true');
  	  $('.bkm-box').css('cursor', 'pointer');
  	}
  });
});

  $(function(){
    $('#bkm-contents').on('click', '.bkm-box', function(){
      if (beat == true) {
        var size = Number($('#bkm-remaining-figure').text());
        var i = $(this).find('.figure').text();
        var voiceRand = Math.floor( Math.random() * 9 );
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
        console.log(i);
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
        } else if (Number(i) > 0) {
          $('.rival'+ rival + '-safe0' + safeRand).get(0).currentTime = 0;
          $('.rival'+ rival + '-safe0' + safeRand).get(0).play();
          $.when(
            $(this).animate({ 'left' : '15px' },50)
          ).done(function() {
            $(this).animate({ 'left':'0px' },50);
          });
          i = i - 1;
          $(this).find('.figure').text(i);
        } else if (Number(i) == 0) {
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
    
