    var se = $('.btnsound');

    $(function(){
      $('#left').on('click', '.bkmbox', function(){
        var i = $(this).find('.figure').text();
        var rand = Math.floor( Math.random() * 8 );
        console.log(i);
        console.log(rand);
        if (i == "") {
          $(this).css('z-index','100');
          $('.btnsound0'+rand).get(0).currentTime = 0;
          $('.btnsound0'+rand).get(0).play();
          $.when(
            $(this).animate({ 'top':'600px','left':'100px' },150)
          ).done(function() {
            $(this).hide();
          });
        } else if (Number(i) > 0) {
          $.when(
            $(this).animate({ 'left' : '15px' },50)
          ).done(function() {$(this).animate({ 'left':'0px' },50);
          });
          i = i - 1;
          $(this).find('.figure').text(i);
        } else if (Number(i) == 0) {
          $(this).fadeOut(1500);
        }  
      });
    });