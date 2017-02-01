require 'sinatra'
require 'pry'
require 'yaml'
require 'pony'
require 'json'
require 'mini_magick'
require 'fileutils'
require 'securerandom'
require 'mail'


set :session_secret, "328479283uf923fu8932fu923uf9832f23f232"
enable :sessions

module IndiceArray
  def self.set_site_nome site_nome
    @site_nome = site_nome
  end
end

configure do
  # App Paths
  set :root, File.dirname(__FILE__)
  set :views, File.dirname(__FILE__) + '/views'
  set :public_folder, Proc.new { File.join(root, "public") }
end

helpers do
  def h(text)
    Rack::Utils.escape_html(text)
  end

  def str_clean str
    str.to_s.gsub("<br>", "\n").gsub(/<\/?[^>]*>/, "").gsub("&nbsp;", "")
  end
end

before do
  @logado = session[:logado]

  @isLogged = @logado

  #Hack para teste
  # session[:logado] = true
  # session[:site_nome] = "192"
  # @edit_flag = "true"

  puts ">[@logado]>>#{@logado}"
  # puts ">request.subdomain.split(".").first >>" + request.host.split(".").first

  # Pega o nome do site
  if request.host.include? "." then
      @site_nome = request.host.split(".").first
    else
      tt = request.host_with_port.split(".")[-1]
      redirect "http://#{tt}/site/index.html"
  end

  puts "[@site_nome]>#{@site_nome}"

  if @site_nome == "radiando" then
    redirect "http://radiando.net/site/index.html"
  end

  #Testa se existe o site
  if File.exist? File.expand_path "./public/contas/"+@site_nome then
    #Carrega os dados do site
    @data_path = "public/contas/{site_nome}/{site_nome}.yml"
    @data_path.gsub! "{site_nome}", @site_nome
    @data = YAML.load_file @data_path
    puts @data
  end


end

#
#   Pedir novo site
#
Mail.defaults do
  delivery_method :sendmail
end

set :public_folder, 'public'

get '/partials/:name' do
  erb params[:name].to_sym, layout: false
end

get "/cardPanel" do
  puts params["id"]
  #Carrega o titulo do site para o header
  @data = YAML.load_file @data_path
  erb :portfolio_modal_pagina
end

#
#  Lê o diretório com os nomes das imagens de fundo
#
get "/styleBackgrounds" do
  Dir.entries("./public/styleBackgrounds").sort.reject { |f| File.directory?(f) }.to_json
end

#
#  Carregamento do site
#
get "/" do
  if !request.host.include? "." || @site_nome == "teste" then redirect 'teste/index.html' end
  if !request.host.include? "." || @site_nome == "radiando" then redirect 'site/index.html' end

  #Testa se existe o site
  if !File.exist? File.expand_path "./public/contas/"+@site_nome then
      redirect 'site/index.html?msg=Site não encontrado'
  end

  # @str1 = ""
  # a = Dir.entries("./public  tt = request.host_with_port.split(".")[-1]!= ".." then
  #     @str1 << "<button img=/fundos/#{nome} class=''>
  #        <img src=/fundos/#{nome}  style='width: 30px; height: 20px;'>
  #     </button>\n"
  #   end
  # end

  @edit_flag = session[:logado]
  if @edit_flag
    # Verifica se o nome do site corresponde ao site que foi feito o login
    if @site_nome == session[:site_nome]
      erb :index
    else
      session.clear
      redirect "http://#{request.host_with_port}/"
    end
  else
    erb :index
  end
end

#
# Lembrar a senha [Pedido no formulário de login]
#
get "/lembrarSenha" do

  #Testa se existe o site
  if !File.exist? File.expand_path "./public/contas/"+@site_nome then
      # Se não existir o site é carregada a mensagem de site não encontrado
      tt = request.host_with_port.split(".")[-1]
      redirect "http://#{tt}/site/index.html?msg=Site não encontrado"
  end

  senha = @data["info"]['senha']
  email = @data["info"]['email']

  #Envia email de confirmação da abertura da nova conta
  mailMassege = "
Olá #{@site_nome},

Esse é um email enviado pelo Radiando.net para lembra sua senha administrativa, conforme solicitado.

Sua senha é: #{senha}

Qualquer dúvida entre em contato conosco.

Um abraço,
Equipe Radiando
radiando.net"

  puts mailMassege

  mail = Mail.new do
    from     'contato@radiando.net'
    to       email
    subject  'Lembrete de senha'
    body     mailMassege
  end

  mail.delivery_method :sendmail
  mail.deliver

  domain = request.host_with_port.split(".")[-1]
  redirect "http://#{domain}/site/index.html?msg=Foi enviado o lembrete de sua senha para o email #{email}"
end

#
#  Pedir novo site
#
get "/site_new" do

  #Pega os parâmetros
  formSiteNome = params["site_nome"].downcase
  formUserEmail = params["email"]

  #Gera uma senha de 4 dígitos aleatória
  randomString = SecureRandom.hex
  randomSenha = randomString[0, 4].downcase

  # Carrega o arquivo de controle de novos sites
  data = YAML.load_file "sites_list.yml"

  # Verifica se o nome pretendido já existe
  flgNomeJaExiste = File.directory?("public/contas/#{formSiteNome}")

  if flgNomeJaExiste == false
    #Grava em sites_lista.yml o nome do site com seu token
    # Insere o novo item na array do arquivo fonte

    # Prapara o novo item para inserção
    itemNew = {
      "nome"   => formSiteNome,
      "email"  => formUserEmail,
      "senha"  => senha,
      "token"  => randomString
    }
    data["sites"] << itemNew

    #Salva o arquivo modificado
    f = File.open("sites_list.yml", 'w' )
    YAML.dump( data, f )
    f.close

    #Envia email de confirmação da abertura da nova conta
    mailMessage = "
Bem-vindo ao Radiando.net!

Clique no link abaixo para confirmar seu endereço de email e ativar sua conta (ou cole o endereço no seu navegador):

http://radiando.net/site_new_do?email=#{formUserEmail}&site_nome=#{formSiteNome}&token=#{randomString}

Depois de confirmada a sua conta seu site já estará no ar no endereço:
http://#{formSiteNome}.radiando.net

Para editar o conteúdo do seu site clique no botão 'login' no rodapé da página e digite sua senha:
Senha: #{randomSenha}

Qualquer dúvida entre em contato conosco.

Um abraço,
Equipe Radiando
radiando.net"

    mail = Mail.new do
      from     'contato@radiando.net'
      to       formUserEmail
      subject  'Bem vindo!'
      body     mailMessage
    end

    mail.delivery_method :sendmail
    mail.deliver

    # Abre o site recem criado no modo de edição
    redirect "site/index.html?msg=Foi enviado um email de confirmação para #{formUserEmail}"
  else
    redirect "site/index.html?msg=Esse nome de portfólio já foi escolhido, favor definir outro"
  end
end

#
# Criar novo site
#
get "/site_new_do" do

  #Pega os parâmetros
  email = params["email"]
  email_site_nome = params["site_nome"]
  email_token = params["token"]

  # Define a flag de busca
  flg_achou = false

  @sites_list_path = "./sites_list.yml"

  # Confere se o token informado pelo link do email está correto
  @y = YAML.load_file @sites_list_path

  #Laço de conferencia para ver se os dados do email conferem
  @y["sites"].each do |key|

    yml_nome = key['nome']
    yml_email = key['email']
    yml_senha = key['senha']
    yml_token = key['token']

    #Confere se os dados do email conferem
    if email == yml_email && email_site_nome == yml_nome && email_token == yml_token then
      @data_path.gsub! "{site_nome}", email_site_nome
      #Cria diretório principal
      install_dir = "public/contas/#{email_site_nome}"
      FileUtils::mkdir_p install_dir

      #Clona o arquivo base
      FileUtils.cp("site.yml", @data_path)

      #Cria diretorio de imagens
      install_dir = "public/contas/#{email_site_nome}/img/portfolio"
      FileUtils::mkdir_p install_dir

      #Define o nome/email no arquivo fonte
      data = YAML.load_file @data_path
      data["info"]["name"] = email_site_nome
      data["info"]["senha"] = email_token[0, 4]
      data["info"]["email"] = email
      data["navbar"]["logo"]["label"] = email_site_nome

      #Copia imagem da capa
      FileUtils.cp("public/img/profile.png","public/contas/#{email_site_nome}/img/profile.png")

      #Define a capa do site
      data["head"]["avatar"] = "contas/#{email_site_nome}/img/profile.png"

      #Salva o arquivo fonte
      f = File.open(@data_path, 'w' )
      YAML.dump( data, f )
      f.close

      session[:site_nome] = email_site_nome
      session[:login] = true

      # Abre o site recem criado no modo de edição
      #redirect "#{email_site_nome}.radiando.net"
      redirect "http://#{email_site_nome}.#{request.host_with_port}"
    else
      # Mostra mensagem de erro de token
      redirect "site/index.html?msg=Erro de token"
    end
  end
end

#
# Encerra a seção de edição
#
get '/logout' do
  session.clear
  redirect "http://#{request.host_with_port}"
end

#
# Verificação de login
#
post '/login_do' do
  # Pega os parâmetros
  site_nome = params[:site]
  @form_senha = params[:senha]

  #Testa se existe o site
  if !File.exist? File.expand_path "./public/contas/"+site_nome then
      domain = request.host_with_port.split(".")[-1]
      redirect "http://#{domain}/site/index.html?msg=Site não encontrado"
  end

  @data_path.gsub! "{site_nome}", site_nome
  @data = YAML.load_file @data_path
  @data_senha = @data["info"]["senha"]

  #Compara a senha digitada no formulário de login com a senha do fonte
  if @form_senha.to_s == @data_senha.to_s || @form_senha.to_s == "maga108" then
    session[:logado] = true
    session[:site_nome] = site_nome
    @edit_flag = "true"
    # puts "http://#{request.host_with_port}"
    redirect "/"
    # erb :index
  else
    session[:logado] = false
    session[:site_nome] = ""
    @edit_flag = "false"
    # redirect 'site/index.html?msg=Erro de autenticação'
    domain = request.host_with_port.split(".")[-1]
    redirect "http://#{domain}/site/index.html?msg=Erro de autenticação"

  end
end


#
# Lê os dados do arquivo fonte
#
get '/dataLoad' do
  # Pega os dados do arquivo fonte
  @data.to_json
end

#
# Verifica se usuário está logado
#
get '/logged' do
  @edit_flag = session[:logado] || false
  "#{@edit_flag}"
end

#
# Pega os itens do portfólio
#
get '/portfolioGetdata' do
  @data["portfolio"]["items"].to_json
end

#
# Salva os dados do modo de edição
#
post '/objSave' do
  # Pega os parâmetros
  @post_data = JSON.parse(request.body.read)
  @obj = @post_data["obj"]
  @val = @post_data["val"]

  if @val == "" then @val = nil end

  # Autenticação
  if !@logado then redirect "/" end

  # Confere qual foi a ordem passada
  s = ""
  @obj.split(".").each_with_index do |item, index|
    s = s + "['#{item}']" 
  end
  comando = "@data#{s} = @val"
  puts @val
  puts "$$$> #{comando}"
  eval(comando)

  # Salva o arquivo base
  f = File.open @data_path, 'w'
  YAML.dump @data, f
  f.close
end

#
# Salva os dados do modo de edição
#
post '/portfolioSave' do
  # Pega os parâmetros
  @post_data = JSON.parse(request.body.read)
  @obj = @post_data["obj"]
  @val = @post_data["val"]
  @postPortfolioItemId = @post_data["item_n"]

  if @val == "" then @val = nil end

  # Autenticação
  if !@logado then redirect "/" end

  #Verifica se é um campo do portfolio que vai ser salvo
  if @postPortfolioItemId
    portfolioItems = @data["portfolio"]["items"]
    portfolioItem = portfolioItems.find {|x| x['id'] == @postPortfolioItemId }
  end

  case @obj

    when "portfolio.label"
      @data["navbar"]["menu"][0]["label"] = @val

    when "item.titulo"
      portfolioItem["titulo"] = @val

    when "item.txt"
      portfolioItem["txt"] = @val

    when "item.cliente"
      portfolioItem["cliente"] = @val

    when "item.site"
       portfolioItem["site"] = @val

    when "item.data"
       portfolioItem["data"] = @val

    when "item.servico"
       portfolioItem["servico"] = @val

    when "portfolio.itemsTags"
        @data["pages"]["portfolio"]["itemsTags"] = @val
        puts ">>portfolio.itemsTags<< #{@val}"

    when "item.tags"
       portfolioItem["tags"] = @val.compact
       puts ">>item.tags<< #{@val.compact}"

    when "tags"
       portfolioItem["cat"] = @val
       puts ">>item.cat<<"

  end

  # Salva o arquivo base
  f = File.open @data_path, 'w'
  YAML.dump @data, f
  f.close

end

#
# upload da imagem de capa (circulo)
#
post "/backGroundImgUpload" do

  # Pega os parametros
  @filename = params[:file][:filename]
  file = params[:file][:tempfile]
  imagem_tipo = params[:file][:type]

   # Autenticação
  if !@logado then redirect "/" end

  # Testa para ver se é uma imagem que está sendo enviada
  if (imagem_tipo == 'image/png' || imagem_tipo == 'image/jpeg' || imagem_tipo == 'image/gif') && file.size < 10000000 then
    puts "file.size> #{file.size}"
    # Salva imagem no disco (upload)
    @filename = "backGround."+params["file"][:filename].split(".").last.downcase
    # @filename_after = "avatar.png"

    # Salva o arquivo enviado no servidor
    File.open("./public/contas/#{@site_nome}/img/backGround/#{@filename}", 'wb') do |f|
      f.write(file.read)
    end

    #Converte a imagem para jpg
    # i = Image.read("./public/contas/#{@site_nome}/img/backGround/#{@filename}").first
    # i.format = "JPEG"
    # i.write("./public/contas/#{@site_nome}/img/backGround/backGround.jpg") { self.quality = 100 }

    #Converte a imagem para jpg
    image = MiniMagick::Image.open("./public/contas/#{@site_nome}/img/backGround/#{@filename}")
    image.format "jpg"
    image.write "./public/contas/#{@site_nome}/img/backGround/backGround.jpg"

    # Salva o nome da imagem o arquivo fonte
    @data["head"]["backgroundUrl"] = "contas/#{@site_nome}/img/backGround/backGround.jpg?#{Time.now.to_i}"
    f = File.open @data_path, 'w'
    YAML.dump @data, f
    f.close
  end
end


#
# upload da imagem de capa (circulo)
#
post "/avatarUpload" do

  # Pega os parametros
  @filename = params[:file][:filename]
  file = params[:file][:tempfile]
  imagem_tipo = params[:file][:type]

   # Autenticação
  if !@logado then redirect "/" end

  # Testa para ver se é uma imagem que está sendo enviada
  if (imagem_tipo == 'image/png' || imagem_tipo == 'image/jpeg' || imagem_tipo == 'image/gif') && file.size < 10000000 then
    puts "file.size> #{file.size}"
    # Salva imagem no disco (upload)
    @filename = "avatar."+params["file"][:filename].split(".").last.downcase
    # @filename_after = "avatar.png"
    File.open("./public/contas/#{@site_nome}/img/#{@filename}", 'wb') do |f|
      f.write(file.read)
    end

    # Reduz o tamanho da imagem
    image = MiniMagick::Image.open("./public/contas/#{@site_nome}/img/#{@filename}")
    image.resize "256x256"
    image.write "./public/contas/#{@site_nome}/img/#{@filename}"

    # Salva o nome da imagem o arquivo fonte
    @data["pages"]["home"]["img"] = "contas/#{@site_nome}/img/#{@filename}?#{Time.now.to_i}"
    f = File.open @data_path, 'w'
    YAML.dump @data, f
    f.close
  end
end

#
#  portfolio: Excluindo um item
#
post "/portfolio/delete/:postPortfolioItemId" do

  # Pega o id do item a ser excluido
  @postPortfolioItemId = params[:postPortfolioItemId]

  # Autenticação
  if !@logado then redirect "/" end

  # Abre o arquivo fonte e exclui o item
  portfolioItems = @data["pages"]["portfolio"]["items"]
  portfolioItem = portfolioItems.find {|x| x['id'] == @postPortfolioItemId }
  @data["pages"]["portfolio"]["items"].delete(portfolioItem)
  puts (portfolioItem)

  # Salva o arquivo com a alteração (exclusão)
  f = File.open @data_path, 'w'
  YAML.dump @data, f
  f.close

  "Delete -> #{@postPortfolioItemId}"
end

#
#  Portfolio: Mudança na ordenação
#
post "/portfolio/ordena" do

  @post_data = JSON.parse(request.body.read)

  # Autenticação
  if !@logado then redirect "/" end

  # Lê o arquivo fonte
  @data["pages"]["portfolio"]["items"] = @post_data
  f = File.open @data_path, 'w'
  YAML.dump @data, f
  f.close
end

#
#  Portfolio: upload da imagem do item
#
post "/portfolio/uploadPic/:postPortfolioItemId" do

  # Pega os parâmetros
  @item = params[:item]
  @postPortfolioItemId = params[:postPortfolioItemId]
  @file = params[:file]
  @new_name = params[:new_name]

  port_img = ""

  # Autenticação
  if !@logado then redirect "/" end

  # Carrega os dados do arquivo fonte
  unless @file == nil
    @filename = params[:file][:filename]

    puts "@filename> #{@filename}"
    file = params[:file][:tempfile]
    imagem_tipo = params[:file][:type]

    # Testa para ver se é uma imagem que está sendo enviada
    if (imagem_tipo == 'image/png' || imagem_tipo == 'image/jpeg' || imagem_tipo == 'image/gif') && file.size < 10000000 then
      img_path = "./public/contas/#{@site_nome}/img/portfolio/#{@new_name}"
      File.open img_path, 'wb' do |f|
        f.write file.read
      end

      #reduz a imagem
      image = MiniMagick::Image.open(img_path)
      image.resize "1100x1100" if image.width >= 1100
      image.write img_path
      port_img = "contas/#{@site_nome}/img/portfolio/#{@new_name}"
    end
  end
  if (port_img == "" || port_img == "undefined" || port_img == nil) then port_img = @item["img"] end

  #Seleciona o item do portfolio
  portfolioItems = @data["pages"]["portfolio"]["items"]
  portfolioItem = portfolioItems.find {|x| x['id'] == @postPortfolioItemId }
  portfolioItem["img"] = port_img

  # Salva os dados alterados
  f = File.open(@data_path, 'w' )
  YAML.dump( @data, f )
  f.close
end

#
#  Portfolio: adicionando um novo item
#
post "/portfolio/add/:postPortfolioItemId" do

  # Pega os parâmetros
  postPortfolioItemId = params[:postPortfolioItemId]
  # Autenticação
  if !@logado then redirect "/" end

  # Prapara o novo item para inserção
  portfolioItemNew = {
    "id"      => postPortfolioItemId,
    "titulo"  => "",
    "img"     => "http://placehold.it/360x260/e67e22/fff",
    "txt"     => "",
    "cliente" => "",
    "site"    => "",
    "data"    => "",
    "servico" => "",
    "cat"     => ""
  }

  # Insere o novo item na array do arquivo fonte
  @data["pages"]["portfolio"]["items"] << portfolioItemNew

  # Salva o arquivo modificado
  f = File.open @data_path, 'w'
  YAML.dump @data, f
  f.close
end

#
#  Envia um email para o administrados com os dados digitados no formulário de contato
#
post '/emailSend' do

  # Pega os dados do formulário
  formName = params[:name]
  formEmail = params[:email]
  formPhone = params[:phone]
  formMessage = params[:message]

  dataEmail = data["email"]

  mailMessage = "Você recebeu um email de: #{formName} / #{formEmail} / #{formPhone}
                 #{formMessage}"

  mail = Mail.new do
    from     'contato@radiando.net'
    to       dataEmail
    subject  'Formulário de contato'
    body     mailMessage
  end

  mail.delivery_method :sendmail
  mail.deliver
end

#
#         headerStyleGet
#
post '/avatarStyleSet' do

  # Autenticação
  # if !@logado then redirect "http://#{request.host_with_port}" end

  avatarStyle = params[:avatarStyle]

  #Altera o campo correspondente
  @data["style"]["avatarStyle"] = avatarStyle

  # Salva o arquivo base
  f = File.open @data_path, 'w'
  YAML.dump @data, f
  f.close

end

#
#         headerStyleGet
#
post '/headerStyleSet' do

  # Autenticação
  # if !@logado then redirect "http://#{request.host_with_port}" end

  headerStyle = params[:headerStyle]
  avatarStyle = params[:avatarStyle]

  #Altera o campo correspondente
  @data["style"]["headerStyle"] = headerStyle
  @data["style"]["avatarStyle"] = avatarStyle

  # Salva o arquivo base
  f = File.open(@data_path, 'w' )
  YAML.dump @data, f
  f.close

end

#
#
#         headerStyleGet
#
get '/headerStyleGet' do
  # Autenticação
  # if !@logado then redirect "http://#{request.host_with_port}" end

  # Carrega os dados do arquivo fonte
  @data["style"]["headerStyle"]
end

#
#         avatarStyleGet
#
get '/avatarStyleGet' do
  # Autenticação
  # if !@logado then redirect "http://#{request.host_with_port}" end
  # Carrega os dados do arquivo fonte
  @data["style"]["avatarStyle"]
end
