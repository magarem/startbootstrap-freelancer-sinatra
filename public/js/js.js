  //Script para pegar a query string
  function getParameterByName(name, url) {
      if (!url) url = window.location.href;
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
          results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  var cmd = getParameterByName('cmd');
  var login = getParameterByName('login');
  var site = getParameterByName('site');
  var erro = getParameterByName('erro');
  var op = getParameterByName('op');

  // Verifica se foi passado alguma ordem de comando
  // para exibir a mensagem na modal correspondente
  if (cmd){
    if (cmd=="editPublishDo"){
      //Exibe mensagem de site publicado com sucesso
      site = "<a target=_blank href='http://"+site+".localhost:3000'>http://"+site+".localhost:3000</a>"
      document.getElementById("modal_editPublishDo_siteName").innerHTML = site;
      $('#modal_editPublishDo').modal('show');
    }
  }
  if (login) {
    $('#login-modal').modal('show');
    if (site){
      console.log("site:", site)
      document.getElementById("site_nome").value = site;
      var msg = ""
      if (login == 1){
        var msg = "<h4>Bem vindo!</h4><h5>Seu site foi criado com sucesso</h5>"
      }
      if (erro){
        var msg = "<h5>Nome do site ou senha não conferem</h5>"
      }
      if (login == 2){
        var msg = "<h5>Foi enviado para seu email o lembrete da senha</h5>"
        console.log("msg:", msg)
      }
      document.getElementById("login_msg").innerHTML = msg
    }
  }
