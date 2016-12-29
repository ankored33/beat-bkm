    var se = $('#btnsound');
/*    
    $(function(){
      $('#container').on('click', '.bkmbox', function(){
        $(this).css('z-index','100');
        $(function(){
          se[0].currentTime = 0;
          se[0].play();
        });
        $.when(
          $(this).animate({ 'top':'600px','left':'200px' },150)
        ).done(function() {$(this).hide();
        });
      });
    });
*/


    $(function(){
      $('#container').on('click', '.bkmbox', function(){
        i = $(this).find('.figure').text();
        if (i == "") {
          console.log(i);
          $(this).css('z-index','100');
          $.when(
            $(this).animate({ 'top':'600px','left':'100px' },150)
          ).done(function() {$(this).hide();
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