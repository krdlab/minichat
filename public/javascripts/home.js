;(function($) {
  $.escapeHTML = function(v) {
    return $('<div />').text(v).html();
  };

  $(function() {
    var to_li = function(obj) {
      return '<li>' + obj.username + '<br />' + obj.message + '</li>';
    };

    socket.on('connect', function() {
    });

    socket.on('message', function(obj) {
      // 配列は要素が 1 つずつ取れる
      var $hists = $('#histories');
      $hists.prepend(to_li(obj));
    });

    socket.on('disconnect', function() {
      alert('disconnect');
    });

    $('#send_button').click(function() {
      var $input = $('#input_message');
      if (!$input.val()) {
        $input.val('入力してよ');
        return false;
      }
      var data = $.escapeHTML($input.val());
      $input.val('');
      socket.send({ cookie: document.cookie, message: data });
      return false;
    });

    $.getJSON('/history', { num: 10 }, function(json, status) {
      var $hists = $('#histories');
      $hists.empty();
      if (json) {
        for (var i=0, size=json.length; i<size; ++i) {
          $hists.append(to_li(json[i]));
        }
      }
      console.log(json);
    });

    // 開始
    socket.connect();
  });
})(jQuery);


