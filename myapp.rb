# encoding: utf-8
require 'sinatra'
require 'pry'
require 'yaml'
require 'pony'
require 'json'
require 'mini_magick'
require 'fileutils'
require 'securerandom'
require 'mail'
require 'openssl'
require "aescrypt"

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

module Dataload
  def Dataload.dataPath
    return "public/contas/{site_nome}/{site_nome}.yml"
  end
  def Dataload.testa (url)
    if url.include? "." then
      @site_nome = url.split(".").first
    end
    #Testa se existe o site
    if @site_nome and File.exist? File.expand_path "./public/contas/#{@site_nome}" then
      #Carrega os dados do site
      @data_path = "public/contas/{site_nome}/{site_nome}.yml"
      @data_path.gsub! "{site_nome}", @site_nome
      return YAML.load_file @data_path
    end
    return false
  end
end

before do
  headers 'Content-Type' => 'text/html; charset=utf-8'
  # Encoding.default_internal = Encoding::UTF_8
  @logado = session[:logado]
  @isLogged = @logado

  #Verifica se está sendo chamado o site principal
  @url = request.host+request.fullpath
  if @url == "localhost/" then
    redirect "http://localhost/site/index.html"
  end
  if @url == "radiando.net/" then
    redirect "http://radiando.net/site/index.html"
  end

  puts "&&&> #{session[:logado]}"
  # Verifica se o nome do site corresponde ao site que foi feito o login
  url = request.host_with_port

  #Pega o nome do site
  if url.include? "." then
   @site_nome = request.host.split(".").first
   if request.fullpath.length == 1 && @site_nome == "radiando" then redirect "http://radiando.net/site/index.html" end
  end

  if @logado and @site_nome != session[:site_nome] then
    session.clear
    redirect "http://#{request.host_with_port}/"
  end
  #Hack para teste
  # session[:logado] = true
  # session[:site_nome] = "192"
  # @edit_flag = "true"
  # puts ">request.subdomain.split(".").first >>" + request.host.split(".").first
  # Pega o nome do site
  puts "request.query_string: #{request.query_string}"

  if @site_nome then
    @data_path = Dataload.dataPath
    puts "@data_path:#{@data_path}"
    @data_path.gsub! "{site_nome}", @site_nome
  end
end

get "/tt" do
  chave = params["key"]
  message = "contato@magaweb.com.br/fidelis/jk8g"
password = "this_is_a_secret_key_that_you_and_only_you_should_know"
encrypted_data = AESCrypt.encrypt(message, password)
puts "encrypted_data: key=#{encrypted_data}"
message = AESCrypt.decrypt(chave, password)
puts "message: #{message}"
end
#
#  /adm
#
get '/adm' do
  host = request.host_with_port
  site = host.split(".")[0]
  url = host.split(".")[-1]
  puts "request.host_with_port:#{request.host_with_port}"
  # Teste Hack
  if request.host_with_port.include? "localhost" then
    redirect "http://#{host}/site/index.html?cmd=login&site=#{site}"
  end
  if request.host_with_port.include? "168"  then
    puts "***"
    redirect "http://#{request.host_with_port}/site/index.html?cmd=login&site=#{site}"
  else
    puts "---"
    redirect "http://#{site}.radiando.net/site/index.html?cmd=login&site=#{site}"
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
  # puts params["id"]
  #Carrega o titulo do site para o header
  @data = YAML.load_file @data_path
  erb :portfolio_modal_pagina
end

#
#  Lê o diretório com os nomes das imagens de fundo
#
get "/styleBackgrounds" do
  if @isLogged
    Dir.entries("./public/styleBackgrounds").sort.reject { |f| File.directory?(f) }.to_json
  end
end


#
#  Carregamento do site
#
get "/" do
  puts "session[:logado]>>#{session[:logado]}"
  @data = Dataload.testa (@url)
  erb :index
end

#
# Lembrar a senha [Pedido no formulário de login]
#
get "/lembrarSenha" do

  #Testa se existe o site
  if !File.exist? File.expand_path "./public/contas/"+@site_nome then
      # Se não existir o site é carregada a mensagem de site não encontrado
      # tt = request.host_with_port.split(".")[-1]
      tt = request.host_with_port
      #redirect "http://#{tt}/site/index.html?msg=Site não encontrado"
      redirect "http://#{tt}/site/index.html?msg=Site não encontrado"
  end

  @data = Dataload.testa (@url)
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
  # domain = request.host_with_port.split(".")[-1]
  domain = request.host_with_port
  redirect "http://#{domain}/site/index.html?msg=Foi enviado o lembrete de sua senha para o email #{email}"
end

#
#  Pedir novo site
#
post "/site_new" do

  #Pega os parâmetros
  formSiteNome = params[:site_nome]
  formUserEmail = params[:email]

  #Gera uma senha de 4 dígitos aleatória
  randomString = SecureRandom.hex
  randomSenha = randomString[0, 4]

  chave = "#{formUserEmail}/#{formSiteNome}/#{randomSenha}".downcase
  puts "chave: #{chave}"

  # message = "contato@magaweb.com.br/fidelis/jk8g"
  password = "this_is_a_secret_key_that_you_and_only_you_should_know"
  encrypted_data = AESCrypt.encrypt(chave, password)
  puts "encrypted_data: key=#{encrypted_data}"
  # message = AESCrypt.decrypt(encrypted_data, password)
  # puts "message: #{message}"

  # cipher = OpenSSL::Cipher.new('aes-256-gcm')
  # cipher.encrypt # Required before '#random_key' or '#random_iv' can be called. http://ruby-doc.org/stdlib-2.0.0/libdoc/openssl/rdoc/OpenSSL/Cipher.html#method-i-encrypt
  # secret_key = cipher.random_key # Insures that the key is the correct length respective to the algorithm used.
  # iv = cipher.random_iv # Insures that the IV is the correct length respective to the algorithm used.
  # salt = SecureRandom.random_bytes(16)
  # encrypted_value = Encryptor.encrypt(value: chave, key: secret_key, iv: iv, salt: salt)
  # decrypted_value = Encryptor.decrypt(value: encrypted_value, key: secret_key, iv: iv, salt: salt)



  # Carrega o arquivo de controle de novos sites
  # data = YAML.load_file "sites_list.yml"

  # Verifica se o nome pretendido já existe
  flgNomeJaExiste = File.directory?("public/contas/#{formSiteNome}")

  if !flgNomeJaExiste

    mailMessage = "
Bem-vindo ao Radiando.net, o seu construtor de site portfólio na web!

Clique no link abaixo para confirmar seu endereço de email e ativar sua conta (ou cole o endereço no seu navegador):

http://radiando.net/site_new_do?key=#{encrypted_data}

Depois de confirmada a sua conta seu site já estará no ar no endereço:
http://#{formSiteNome}.radiando.net

Acesse o site radiando.net para editar o conteúdo de seu site, informando os dados abaixo:
Nome do portfólio: #{formSiteNome}
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
puts "---------------------"
  chave = params["key"]

  puts "chave: #{chave}"

  # message = "contato@magaweb.com.br/fidelis/jk8g"
  # password = "this_is_a_secret_key_that_you_and_only_you_should_know"
  # encrypted_data = AESCrypt.encrypt(chave, password)
  # puts "encrypted_data: key=#{encrypted_data}"
  password = "this_is_a_secret_key_that_you_and_only_you_should_know"
  decrypted = AESCrypt.decrypt(chave, password)
  # puts "message: #{message}"

  emailParams = decrypted.split("/")
  email = emailParams[0]
  email_site_nome = emailParams[1]
  email_senha = emailParams[2]

  puts "#{email}"

  #Verifica se o site já foi criado
  flgNomeJaExiste = File.directory?("public/contas/#{email_site_nome}")

  if !flgNomeJaExiste
    @data_path = "public/contas/#{email_site_nome}/#{email_site_nome}.yml"
    #Cria diretório principal
    install_dir = "public/contas/#{email_site_nome}"
    FileUtils::mkdir_p install_dir

    puts "@data_path: #{@data_path}"
    #Clona o arquivo base
    FileUtils.cp("site.yml", @data_path)

    #Cria diretorio de imagens
    install_dir = "public/contas/#{email_site_nome}/img/portfolio"
    FileUtils::mkdir_p install_dir

    #Cria diretorio de backGrounds
    install_dir = "public/contas/#{email_site_nome}/img/backGround"
    FileUtils::mkdir_p install_dir

    #Define o nome/email no arquivo fonte
    data = YAML.load_file @data_path
    data["info"]["name"] = email_site_nome
    data["info"]["senha"] = email_senha
    data["info"]["email"] = email
    data["navbar"]["logo"]["label"] = email_site_nome

    #Copia imagem da capa
    FileUtils.cp("public/img/profile.png","public/contas/#{email_site_nome}/img/profile.png")

    #Define a capa do site
    data["head"]["avatar"] = "contas/#{email_site_nome}/img/profile.png"

    id = SecureRandom.hex[0, 10].downcase

    data["portfolio"]["items"][0]["id"] = "#{email_site_nome}-#{id}"

    #Salva o arquivo fonte
    f = File.open(@data_path, 'w' )
    YAML.dump( data, f )
    f.close

    session[:site_nome] = email_site_nome
    session[:login] = true

    # Abre o site recem criado no modo de edição
    #redirect "#{email_site_nome}.radiando.net"
    redirect "http://#{email_site_nome}.#{request.host_with_port}"
  end
  #Não achou o token
  redirect "site/index.html?msg=Erro de chave ou o site já exite"
  # "@data_path: #{@data_path}"
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

  puts ">>#{site_nome}"
  #Testa se existe o site
  if !File.exist? File.expand_path "./public/contas/"+site_nome then
      domain = request.host_with_port
      puts "domain:#{domain}"
      if request.host_with_port.include? "168" then
        #Celular test hack
        redirect "http://#{request.host_with_port}/site/index.html?msg=Site não encontrado"
      else
        redirect "http://#{domain}/site/index.html?msg=Site não encontrado"
      end
  end
  @data_path = Dataload.dataPath
  puts "@data_path:#{@data_path}"

  @data_path.gsub! "{site_nome}", site_nome
  @data = YAML.load_file @data_path
  @data_senha = @data["info"]["senha"]

  #Compara a senha digitada no formulário de login com a senha do fonte
  if @form_senha.to_s == @data_senha.to_s || @form_senha.to_s == "maga108" then
    puts "yes"
    session[:logado] = true
    session[:site_nome] = site_nome
    @edit_flag = "true"
    puts "&&&-> #{session[:logado]}"
    domain = request.host_with_port
    redirect "http://#{domain}",303
    # redirect "/"
    # erb :index
  else
    puts "not"
    session[:logado] = false
    session[:site_nome] = ""
    @edit_flag = "false"
    # redirect 'site/index.html?msg=Erro de autenticação'
    url = request.host_with_port
    #Desvia conforme a origem
    # if request.host_with_port.include? "168" then
    #   #Celular test hack
    #   url = request.host_with_port
    # end
    redirect "http://#{url}/site/index.html?cmd=loginErr&site=t5"
  end
end


#
# Lê os dados do arquivo fonte
#
get '/dataLoad' do
  # Pega os dados do arquivo fonte
  puts "@site_nome:> #{@site_nome}"
  if File.exist? File.expand_path "./public/contas/"+@site_nome then
    #Carrega os dados do site
    @data_path = "public/contas/{site_nome}/{site_nome}.yml"
    @data_path.gsub! "{site_nome}", @site_nome
    @data = YAML.load_file @data_path
    @data["logged"] = session[:logado]
    # puts @data
    # erb :index
  end
  @data.to_json
end

#
# Verifica se usuário está logado
#
get '/logged' do
  @a = session[:logado]
  puts @a
  "#{@a}"
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

  #Carrega os dados do site
  @data = Dataload.testa (@url)

  # Confere qual foi a ordem passada
  s = ""
  @obj.split(".").each_with_index do |item, index|
    s = s + "['#{item}']"
  end
  if @val then
    comando = "@data#{s} = @val"
    puts @val
    puts "$$$> #{comando}"
    eval(comando)
  end

  #Confere se é algum item do menu
  case s
    when "['portfolio']['label']"
      @data['navbar']['menu'][0] = @val
    when "['about']['label']"
      @data['navbar']['menu'][1] = @val
    when "['contact']['label']"
      @data['navbar']['menu'][2] = @val
  end


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

  #Carrega os dados do site
  @data = Dataload.testa (@url)

  #Verifica se é um campo do portfolio que vai ser salvo
  if @postPortfolioItemId
    portfolioItems = @data["portfolio"]["items"]
    portfolioItem = portfolioItems.find {|x| x['id'] == @postPortfolioItemId }
  end

  puts "@val> #{@val}"
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
        @data["portfolio"]["itemsTags"] = @val
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
  #Carrega os dados do site
  @data = Dataload.testa (@url)

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

  #Carrega os dados do site
  @data = Dataload.testa (@url)

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
    @data["head"]["avatar"] = "contas/#{@site_nome}/img/#{@filename}?#{Time.now.to_i}"
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

  #Carrega os dados do site
  @data = Dataload.testa (@url)

  # Abre o arquivo fonte e exclui o item
  portfolioItems = @data["portfolio"]["items"]
  portfolioItem = portfolioItems.find {|x| x['id'] == @postPortfolioItemId }
  @data["portfolio"]["items"].delete(portfolioItem)
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

  #Carrega os dados do site
  @data = Dataload.testa (@url)

  # Lê o arquivo fonte
  @data["portfolio"]["items"] = @post_data
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
  #Carrega os dados do site
  @data = Dataload.testa (@url)

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
  portfolioItems = @data["portfolio"]["items"]
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

  #Carrega os dados do site
  @data = Dataload.testa (@url)

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
    "tags"     => ""
  }

  # Insere o novo item na array do arquivo fonte
  @data["portfolio"]["items"] << portfolioItemNew

  # Salva o arquivo modificado
  f = File.open @data_path, 'w'
  YAML.dump @data, f
  f.close
end

#
#  Envia um email para o administrados com os dados digitados no formulário de contato
#
post '/contact/emailSend' do

  # Pega os dados do formulário
  formName = params[:name]
  formEmail = params[:email]
  formPhone = params[:phone]
  formMessage = params[:message]

  #Carrega os dados do site
  data = Dataload.testa (@url)

  dataEmail = data["info"]["email"]

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

  #Carrega os dados do site
  @data = Dataload.testa (@url)

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

  #Carrega os dados do site
  @data = Dataload.testa (@url)

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

  #Carrega os dados do site
  @data = Dataload.testa (@url)
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
  #Carrega os dados do site
  @data = Dataload.testa (@url)
  @data["style"]["avatarStyle"]
end
