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
require 'open-uri'
require 'video_thumb'
require 'cloudinary'
require 'openssl'
require 'base64'
require 'hex_string'
require 'sendgrid-ruby'
require 'sanitize'

include SendGrid

set :public_folder, 'public'
set :session_secret, "328479283uf923fu8932fu923uf9832f23f232"
enable :sessions

Mail.defaults do
  delivery_method :sendmail
end

module IndiceArray
  def self.set_site_nome site_nome
    @site_nome = site_nome
  end
end
module Dataload
  def Dataload.dataPath
    return "public/contas/{site_nome}/data.yml"
  end
  def Dataload.testa (url)
    if url.include? "." then
      @site_nome = url.split(".").first
    end
    #Testa se existe o site
    if @site_nome and File.exist? File.expand_path "./public/contas/#{@site_nome}" then
      #Carrega os dados do site
      @data_path = "public/contas/{site_nome}/data.yml"
      @data_path_preview = "public/contas/{site_nome}_preview/{site_nome}_preview.yml"
      @data_path.gsub! "{site_nome}", @site_nome
      return YAML.load_file @data_path
    end
    return false
  end
end

configure do
  # App Paths
  set :root, File.dirname(__FILE__)
  set :views, File.dirname(__FILE__) + '/views'
  set :public_folder, Proc.new { File.join(root, "public") }
end
helpers do

  def encrypt(data)

    cipher = OpenSSL::Cipher.new 'aes-256-cbc'
    cipher.encrypt
    key = "2013707724252070292620137077242520702926"
    #Convert from hex to raw bytes:
    key = [key].pack('H*')
    #Pad with zero bytes to correct length:
    key << ("\x00" * (32 - key.length))
    iv ="123789123789123789"
    #Convert from hex to raw bytes:
    iv = [iv].pack('H*')
    #Pad with zero bytes to correct length:
    iv << ("\x00" * (16 - iv.length))

    cipher.key = key
    cipher.iv = iv

    encrypted = cipher.update(data) + cipher.final
    encoded = Base64.encode64(encrypted).encode('utf-8')
    #decoded = Base64.decode64 encoded.encode('ascii-8bit')
    #encoded
    CGI::escape(encoded)
    #decrypt(encrypted)
  end
  def decrypt(encoded)
    encoded = Base64.decode64 encoded.encode('ascii-8bit')
    decipher = OpenSSL::Cipher.new 'aes-256-cbc'
    decipher.decrypt
    key = "2013707724252070292620137077242520702926"
    #Convert from hex to raw bytes:
    key = [key].pack('H*')
    #Pad with zero bytes to correct length:
    key << ("\x00" * (32 - key.length))
    iv ="123789123789123789"
    #Convert from hex to raw bytes:
    iv = [iv].pack('H*')
    #Pad with zero bytes to correct length:
    iv << ("\x00" * (16 - iv.length))
    decipher.key = key
    decipher.iv = iv
    decipher.update(encoded) + decipher.final
  end

  def h(text)
    Rack::Utils.escape_html(text)
  end

  def str_clean str
    str.to_s.gsub("<br>", "\n").gsub(/<\/?[^>]*>/, "").gsub("&nbsp;", "")
  end
end
before do
  puts "** before - begin **"
  headers 'Content-Type' => 'text/html; charset=utf-8'
  # Encoding.default_internal = Encoding::UTF_8

  @url = request.host_with_port
  @url_full = request.host+request.fullpath
  @url_qs = request.query_string
  @logado = session[:logado]
  @isLogged = @logado

  #Monitor
  puts "request.host_with_port: #{@url}"
  puts "request.host+request.fullpath: #{@url_full}"
  puts "request.query_string: #{@url_qs}"
  puts "session[:logado]: #{session[:logado]}"

  @enf_var = YAML.load_file "public/sendgrid.yml"
  @SENDGRID_API_KEY = @enf_var["SENDGRID_API_KEY"]
  puts "@SENDGRID_API_KEY: #{@SENDGRID_API_KEY}"

  #Verifica se está sendo chamado o site principal
  if  @url_full == "localhost/" || @url_full == "radiando.net/" then
    redirect "http://#{@url}/site/index.html"
  end

  #Pega o nome do site
  if @url.include? "." then
   @site_nome = request.host.split(".").first
   puts "@site_nome: #{@site_nome}"
  end

  #Testa se existe o site
  if @site_nome then
    @data_path = Dataload.dataPath
    @data_path.gsub! "{site_nome}", @site_nome
    puts "@data_path:#{@data_path}"
  end

  #Confere se é o mesmo nome de site do que foi logado
  puts "@logado: #{@logado}"
  if @logado and @site_nome != session[:site_nome] then
    session.clear
    redirect "http://#{@url}/"
  end
  puts "** before - end **"
end
#
#  /adm
#
get '/encrypt/:str' do
  encrypt params[:str]
end
get '/decrypt/:str' do
  decrypt params[:str]
end

get '/cifra' do
  # To decrypt the password from the YAML file
  # account_config = YAML.load_file(name_of_file.yml)
  account_password = Base64.encode64(Encryptor.encrypt(passwd,:key => secret_key, :algorithm => 'aes-256-ecb')).force_encoding('UTF-8')
  puts "account_password> #{account_password}"
end

get '/testeEnvio' do
  from = Email.new(email: 'contato@radiando.net')
  to = Email.new(email: 'contato@magaweb.com.br')
  subject = 'Sending with SendGrid is Fun'
  content = Content.new(type: 'text/plain', value: 'and easy to do anywhere, even with Ruby')
  mail = SendGrid::Mail.new(from, subject, to, content)
  sg = SendGrid::API.new(api_key: @SENDGRID_API_KEY)
  response = sg.client.mail._('send').post(request_body: mail.to_json)
  puts response.status_code
  puts response.body
  puts response.headers
end
get '/adm' do
  if !@site_nome.include? "_preview"
    session.clear
    @url_ = @url.split(".").drop(1).join(".")
    puts "@url_: #{@url_}"
    u = "http://#{@site_nome}_preview.#{@url_}/adm"
    puts "u: #{u}"
    redirect u
  end
  session.clear
  #redirect "http://#{@url}/site/index.html?cmd=login&site=#{@site_nome}"
  site_nome_limpo = @site_nome.chomp("_preview")
  redirect "http://#{@url}?login=0&site=#{site_nome_limpo}"
end

get "/cardPanel" do
  #Carrega o titulo do site para o header
  @data = YAML.load_file @data_path
  erb :portfolio_modal_pagina
end
#
#  Lê o diretório com os nomes das imagens de fundo
#
get "/styleBackgrounds" do
  if @isLogged
   img_name = []
   #Dir.entries("./public/styleBackgrounds").sort.reject { |f| File.directory?(f) }.to_json
   #cloudinary.api.resources(function(result){},{ type: 'upload', prefix: 'my_folder/' });
   a = Cloudinary::Api.resources(
     api_key: '526244569845626',
     api_secret: 'qpyLf_nv9v40Uummu-ujHESY5e8',
     cloud_name: 'radiando',
     type: 'upload',
     prefix: 'headerBackground/thumbs',
     max_results: 1000)

   a['resources'].each do |n|
      img_name << n["url"].split("/").last
   end
   img_name.to_json
  end
end
#
#  Carregamento do site
#
get "/" do

  #Testa existência do site
  if !File.exist? File.expand_path "./public/contas/"+@site_nome then
    # Se não existir o site é carregada a mensagem de site não encontrado
    redirect "http://#{@url}/site/index.html?msg=Site não encontrado"
  end

  @data = Dataload.testa (@url)
  erb :index
end
#
# Lembrar a senha [Pedido no formulário de login]
#
get "/lembrarSenha" do

  if @site_nome==nil then
    @site_nome = params[:site]
    @url = @site_nome+"."+@url
  end

  puts "@site_nome : |#{@site_nome}|"
  puts "params[:site]: |#{params[:site]}|"
  #Testa se existe o site
  if !File.exist? File.expand_path "./public/contas/"+@site_nome then
    # Se não existir o site é carregada a mensagem de site não encontrado
    redirect "http://#{@url}/site/index.html?msg=Site não encontrado"
  end

  @data = Dataload.testa (@url)
  senha = @data["info"]['senha']
  email = @data["info"]['email']

  #Envia email de confirmação da abertura da nova conta
  mailMessage = ERB.new(File.read('views/email_password_remember.txt')).result(binding)
  puts mailMessage

  from = Email.new(email: 'contato@radiando.net')
  to = Email.new(email: email)
  subject = 'Lembrete de senha'
  content = Content.new(type: 'text/html', value: mailMessage)
  mail = SendGrid::Mail.new(from, subject, to, content)
  sg = SendGrid::API.new(api_key: @SENDGRID_API_KEY)
  response = sg.client.mail._('send').post(request_body: mail.to_json)

  # redirect "http://#{@url}/site/index.html?msg=Foi enviado o lembrete de sua senha para o email #{email}"
  redirect "http://#{@url}?login=2&site=#{@site_nome}"
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

  #Pega o timestamp
  time = Time.now.getutc

  #Cria a chave de confirmação de conta
  chave = "radiando/#{formUserEmail}/#{formSiteNome}/#{randomSenha}/#{time}".downcase
  puts "chave: #{chave}"

  # encrypt and encode with 256-bit AES
  # one-time setup, set this to a securely random key with at least 256 bits, see below
  #URLcrypt.key = password

  # now encrypt!
  #encrypted_data = URLcrypt.encrypt(chave)
  #encrypted_data = chave.encrypt(password)
  encrypted_data = encrypt(chave)

  puts "encrypted_data: key=#{encrypted_data}"

  # Verifica se o nome pretendido já existe
  flgNomeJaExiste = File.directory?("public/contas/#{formSiteNome}")
  if !flgNomeJaExiste then
    mailMessage = ERB.new(File.read('views/email_new_account.txt')).result(binding)
    puts mailMessage
    from = Email.new(email: 'contato@radiando.net')
    to = Email.new(email: formUserEmail)
    subject = 'Bem vindo!'
    content = Content.new(type: 'text/html', value: mailMessage)
    mail = SendGrid::Mail.new(from, subject, to, content)
    sg = SendGrid::API.new(api_key: @SENDGRID_API_KEY)
    response = sg.client.mail._('send').post(request_body: mail.to_json)
    # exibe a confirmação da operção
    redirect "site/index.html?msg=Foi enviado um email de confirmação para #{formUserEmail}"
  else
    redirect "site/index.html?msg=Esse nome de portfólio já foi escolhido, favor definir outro"
  end
end
#
# Criar novo site
#
get "/siteNewDo" do
  encode = params[:k]
  puts "encode: #{encode}"
  # encrypt and encode with 256-bit AES
  decrypted = decrypt(encode)
  decrypted
  emailParams = decrypted.split("/")
  verifica = emailParams[0]
  email = emailParams[1]
  email_site_nome = emailParams[2]
  email_senha = emailParams[3]
  email_time = emailParams[4]

  email_site_nome_real = email_site_nome
  # email_site_nome = email_site_nome+"_preview"
  #Verifica se o site já foi criado
  flgNomeJaExiste = File.directory?("public/contas/#{email_site_nome}_preview")

  if !flgNomeJaExiste and verifica == "radiando" and email.include? "@"

    #Envia e-mail de site criado com sucesso
    mailMessage = ERB.new(File.read('views/email_new_account_confirmed.txt')).result(binding)
    from = Email.new(email: 'contato@radiando.net')
    to = Email.new(email: email)
    subject = 'Conta confirmada com sucesso!'
    content = Content.new(type: 'text/html', value: mailMessage)
    mail = SendGrid::Mail.new(from, subject, to, content)
    sg = SendGrid::API.new(api_key: @SENDGRID_API_KEY)
    response = sg.client.mail._('send').post(request_body: mail.to_json)

    @data_path = "public/contas/#{email_site_nome}_preview/data.yml"
    #Cria diretório principal
    install_dir = "public/contas/#{email_site_nome}_preview"
    FileUtils::mkdir_p install_dir

    puts "@data_path: #{@data_path}"

    #Clona o diretório skeleton
    origem = "public/contas/skeleton"
    destino = "public/contas/#{email_site_nome}_preview"
    FileUtils.copy_entry(origem, destino)

    #Define o nome/email no arquivo fonte
    data = YAML.load_file @data_path
    data["info"]["name"] = email_site_nome
    data["info"]["senha"] = email_senha
    data["info"]["email"] = email
    data["info"]["created"] = email_time
    data["navbar"]["logo"]["label"] = email_site_nome.chomp("_preview")

    #Define a imagem de teste do primeiro item do portfolio
    #data["portfolio"]["items"]["items"][0]["img"] = "img_teste.jpg"

    id = SecureRandom.hex[0, 10].downcase

    #data["/?login=1&site=shiva_preview&erro=1
    #Salva o arquivo fonte
    f = File.open(@data_path, 'w' )
    YAML.dump( data, f )
    f.close

    #Carrega as variáveis de seção
    session[:site_nome] = email_site_nome.chomp("_preview")
    session[:login] = true
    #erb :contaConfirmada_msg
    #Abre o site recem criado no login form
    #redirect "http://#{email_site_nome}_preview.#{request.host_with_port}?login=1"

    #Confere se o endereço já está com a extenção de preview
    puts "> request.host_with_port: #{request.host_with_port}"
    if request.host_with_port.include? "_preview" then
      redirect "#{request.host_with_port}?login=1&site=#{email_site_nome}"
    else
      redirect "http://#{email_site_nome}_preview.#{request.host_with_port}?login=1&site=#{email_site_nome}"
    end
  else
    #Não achou o token
    #@layoutType = "clean"
    #erb :contaConfirmada_msg
    #redirect "site/index.html?msg=Erro de token ou o site já foi criado"
    #redirect "http://#{email_site_nome}_preview.#{request.host_with_port}?login=1&site=#{email_site_nome}_preview"
    #redirect "site/index.html"
    if request.host_with_port.include? "_preview" then
      redirect "http://#{request.host_with_port}?login=1&site=#{email_site_nome}"
    else
      redirect "http://#{email_site_nome}_preview.#{request.host_with_port}?login=1&site=#{email_site_nome}"
    end
    # redirect "http://#{email_site_nome}_preview.#{request.host_with_port}?login=1&site=#{email_site_nome}"
  end
end
#
# Encerra a seção de edição
#
get "/postSiteDo" do
  # Depois de o site editado ele será publicado com o nome real sem
  # o sufixo preview
  @site_dir_preview = "public/contas/#{@site_nome}"
  @site_ymlfile_preview = "public/contas/#{@site_nome}/data.yml"
  puts "@data_path: #{@data_path}"
  puts "@site_ymlfile_preview.gsub:"+@site_ymlfile_preview.gsub('_preview','')

  # Clona o arquivo base
  puts "@site_dir_preview:"+@site_dir_preview
  puts "@site_dir_preview_sub:"+@site_dir_preview.gsub('_preview','')
  FileUtils.copy_entry(@site_dir_preview, @site_dir_preview.gsub('_preview',''))
  # Altera o nome do site original retirando o sufixo _preview
  FileUtils.mv("public/contas/#{@site_nome}".gsub('_preview','')+"/data.yml", @site_ymlfile_preview.gsub('_preview',''))
  # Abre o site publicado
  redirect "http://#{email_site_nome}.#{request.host_with_port}"
end

get '/logout' do
  session.clear
  redirect "http://#{@url}"
end
#
# Cancela edição recuperando o último backup
#
get "/editCancel" do
  #Cria a cópia de segura antes da edição
  origem = "public/contas/#{@site_nome}_BKP"
  destino = "public/contas/#{@site_nome}"
  FileUtils.copy_entry(origem, destino)
  redirect "http://#{@url}"
end
#
# Cancela edição recuperando o último backup
#
get "/editPublish" do
  #Cria a cópia de segura antes da edição
  origem = "public/contas/#{@site_nome}"
  destino = "public/contas/#{@site_nome}_BKP"
  FileUtils.copy_entry(origem, destino)

  #Copia o site preview para o nome original
  origem = "public/contas/#{@site_nome}"
  destino = "public/contas/#{@site_nome}".chomp("_preview")
  FileUtils.copy_entry(origem, destino)
  redirect "http://#{@url}?cmd=editPublishDo&site=#{@site_nome.chomp("_preview")}"
end
#
# Verificação de login
#
post '/login_do' do
  # Pega os parâmetros
  puts "** login_do - begin **"

  site_nome = params[:site_nome]
  puts "*> /login_do > #{site_nome}"

  # Verifica se o nome do site já possui a extenção
  # _preview, senão acrescenta
  if !site_nome.include? "_preview"
    #redirect "http://#{@url}/site/index.html?msg=Só é possível editar site no modo preview"
    #redirect "http://localhost:3000/site/index.html?cmd=loginErr&site=#{site_nome}_preview"
    # site_nome << "_preview"
    # @site_nome << "_preview"
    # @url.gsub!(".localhost","_preview.localhost")
    # @url.gsub!(".radiando","_preview.radiando")
    # puts "*****[#{@url}]"
    site_nome += "_preview"
  end
  @form_senha = params[:site_senha]

  puts ">>#{site_nome}"
  #Testa se existe o site
  if !File.exist? File.expand_path "./public/contas/"+site_nome then
    redirect "http://#{@url}/site/index.html?msg=Site não encontrado"
  end
  @data_path = Dataload.dataPath
  puts "1> @data_path:#{@data_path}"
  @data_path.gsub! "{site_nome}", site_nome
  puts "2> @data_path:#{@data_path}"
  @data = YAML.load_file @data_path
  @data_senha = @data["info"]["senha"]

  #Compara a senha digitada no formulário de login com a senha do fonte
  if @form_senha.to_s == @data_senha.to_s || @form_senha.to_s == "maga108" then
    session.clear
    session[:logado] = true
    session[:site_nome] = site_nome
    @edit_flag = "true"
    puts "----*#{site_nome} -- #{session[:logado]}*----"

    #Verifica se nome do site já está no endereço
    @url_ = @url
    @url_split_array = @url.split(".")
    if @url_split_array.length == 1 then @url_ = "#{site_nome}.#{@url}" end

    #Cria a cópia de segura antes da edição
    origem = "public/contas/#{site_nome}"
    destino = "public/contas/#{site_nome}_BKP"
    FileUtils.copy_entry(origem, destino)

    puts "@url_: #{@url_}:"
    redirect "http://#{@url_}"
  else
    session[:logado] = false
    session[:site_nome] = ""
    @edit_flag = "false"
    # redirect "http://#{@url}/site/index.html?cmd=loginErr&site=#{site_nome}"
    site_nome_limpo = site_nome.chomp("_preview")
    redirect "http://#{@url}?login=1&site=#{site_nome_limpo}&erro=1"
  end
  puts "** login_do - end **"
end
#
# Lê os dados do arquivo fonte
#
get '/dataLoad' do
  #Verifica se o site_nome está nulo e então carrega da variável de sessão
  #Para caso de site recém criado
  if !@site_nome then @site_nome = session[:site_nome] << "_preview" end

  # Pega os dados do arquivo fonte
  if File.exist? File.expand_path "./public/contas/"+@site_nome then
    #Carrega os dados do site
    @data_path = "public/contas/{site_nome}/data.yml"
    @data_path.gsub! "{site_nome}", @site_nome
    @data = YAML.load_file @data_path
    @data["logged"] = session[:logado]
    @data["site_nome"] = @site_nome
  end
  @data.to_json
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
  puts "@val: #{@val}"
  # Autenticação
  if !@logado then redirect "/" end

  #Carrega os dados do site
  @data = Dataload.testa (@url)

  # Confere qual foi a ordem passada
  s = ""
  @obj.split(".").drop(1).each_with_index do |item, index|
    s = s + "['#{item}']"
  end
  #if @val != nil then
    comando = "@data#{s} = @val"
    puts @val
    puts "comando: #{comando}"
    eval(comando)
  #end

  #Confere se é algum item do menu
  case s
    when "['portfolio']['label']"
      @data['navbar']['menu'][0]['label'] = @val.to_s.slice(0, 20)
    when "['about']['label']"
      @data['navbar']['menu'][1]['label'] = @val.to_s.slice(0, 20)
    when "['contact']['label']"
      @data['navbar']['menu'][2]['label'] = @val.to_s.slice(0, 20)
  end

  #Confere se é do About
  puts "s> #{s}"
  case s
    when "['about']['body1']"
      @data['about']['body1'] = @val.to_s.slice(0, 1500)
    when "['about']['body2']"
      @data['about']['body2'] = @val.to_s.slice(0, 1500)
  end

  # Define a data de modificação
  @data["info"]["modified"] = Time.now.getutc

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
    when "item.mediaType"
      portfolioItem["mediaType"] = @val
    when "item.img"
      portfolioItem["img"] = @val
    when "item.video"
      portfolioItem["video"] = @val
      #Define a miniatura do vídeo
      puts "VideoThumb::get(@val) -->  #{VideoThumb::get(@val)}"
      #Salva a miniatura do video na imagem
      portfolioItem["img"] = VideoThumb::get(@val)
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

  # Define a data de modificação
  @data["info"]["modified"] = Time.now.getutc

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
  puts "@filename: #{@filename}"
  file = params[:file][:tempfile]
  imagem_tipo = params[:file][:type]

   # Autenticação
  if !@logado then redirect "/" end

  #Carrega os dados do site
  @data = Dataload.testa (@url)

  # Testa para ver se é uma imagem que está sendo enviada
  if (imagem_tipo == 'image/png' || imagem_tipo == 'image/jpeg' || imagem_tipo == 'image/gif') && file.size < 10000000 then
    puts "file.size> #{file.size}"

    Cloudinary::Uploader.upload(
      file,
      api_key: '526244569845626',
      api_secret: 'qpyLf_nv9v40Uummu-ujHESY5e8',
      cloud_name: 'radiando',
      folder: @site_nome + "/headerBackground",
      public_id: 'backGround',
      format: 'jpg')

    @data["head"]["backgroundUrl"] = "http://res.cloudinary.com/radiando/image/upload/v#{Time.now.to_i}/#{@site_nome}/headerBackground/backGround.jpg?#{Time.now.to_i}"
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
  puts "@filename: #{@filename}"
  file = params[:file][:tempfile]
  imagem_tipo = params[:file][:type]

   # Autenticação
  if !@logado then redirect "/" end

  #Carrega os dados do site
  @data = Dataload.testa (@url)

  # Testa para ver se é uma imagem que está sendo enviada
  if (imagem_tipo == 'image/png' || imagem_tipo == 'image/jpeg' || imagem_tipo == 'image/gif') && file.size < 10000000 then
    puts "file.size> #{file.size}"

    # Cloudinary::Uploader.upload(
    #   file,
    #   :api_key => '526244569845626',
    #   :api_secret => 'qpyLf_nv9v40Uummu-ujHESY5e8',
    #   :cloud_name => 'radiando',
    #   :crop => :limit,
    #   :width => 250,
    #   :height => 250,
    #   :folder => @site_nome,
    #   :public_id => 'avatar',
    #   :format => 'jpg')
    # @data["head"]["avatar"] = "http://res.cloudinary.com/radiando/image/upload/v#{Time.now.to_i}/#{@site_nome}/avatar.jpg?#{Time.now.to_i}"

    # Salva imagem no disco (upload)
    @filename = "avatar."+params["file"][:filename].split(".").last.downcase
    @filename_after = "avatar.png"
    File.open("./public/contas/#{@site_nome}/img/#{@filename}", 'wb') do |f|
     f.write(file.read)
    end

    # Reduz o tamanho da imagem
    image = MiniMagick::Image.open("./public/contas/#{@site_nome}/img/#{@filename}")
    # Exclui imagem enviada
    FileUtils.rm "./public/contas/#{@site_nome}/img/#{@filename}"
    image.resize "256x256"
    image.format "png"
    image.write "./public/contas/#{@site_nome}/img/avatar.png"

    # Salva o nome da imagem o arquivo fonte
    # @data["head"]["avatar"] = "contas/#{@site_nome}/img/#{@filename}?#{Time.now.to_i}"
    @data["head"]["avatar"] = "avatar.png?#{Time.now.to_i}"

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
  @file_name = params[:file][:filename]
  @file_extname = File.extname(params[:file][:filename]).strip.downcase[1..-1]
  @new_name = params[:new_name]

  port_img = ""

  #Debug
  puts "@item: #{@item}"
  puts "@file: #{@file}"
  puts "@file_extname: #{@file_extname}"
  # Autenticação
  if !@logado then redirect "/" end
  #Carrega os dados do site
  @data = Dataload.testa (@url)

  #Debug
  puts "@file: #{@file}"

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
      puts "@file: #{@file}"
      puts "@site_nome: #{@site_nome}"
      puts "@new_name: #{@new_name}"

      # Cloudinary
      # cl = Cloudinary::Uploader.upload(
      #   params[:file][:tempfile],
      #   api_key: '526244569845626',
      #   api_secret: 'qpyLf_nv9v40Uummu-ujHESY5e8',
      #   cloud_name: 'radiando',
      #   folder: @site_nome,
      #   public_id: @new_name,
      #   invalidate: true,
      #   resource_type: 'image'
      # )

      #reduz a imagem
      image = MiniMagick::Image.open(img_path)
      image.resize "800x800" if image.width >= 800
      image.write img_path
      # port_img = "contas/#{@site_nome}/img/portfolio/#{@new_name}"
      port_img = @new_name
      # port_img = "http://res.cloudinary.com/radiando/image/upload/v#{cl['version']}/#{@site_nome}/#{@new_name}"
      #port_img = "#{@site_nome}/#{@new_name}?#{cl['version']}"
      # puts "resource_type: #{cl['resource_type']}"
    end

  end

  #debug
  puts "port_img:#{port_img}"

  if (port_img == "" || port_img == "undefined" || port_img == nil) then port_img = @item["img"] end

  puts "@postPortfolioItemId: #{@postPortfolioItemId}"
  #Seleciona o item do portfolio
  portfolioItems = @data["portfolio"]["items"]
  portfolioItem = portfolioItems.find {|x| x['id'] == @postPortfolioItemId }

  portfolioItem["img"] = port_img
  portfolioItem["mediaType"] = 'image'

  # Salva os dados alterados
  f = File.open(@data_path, 'w' )
  YAML.dump( @data, f )
  f.close
end
#
#  Portfolio: upload item video
#
post "/portfolio/uploadVideo/:postPortfolioItemId" do

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
    #@filename = params[:file][:filename]

    #puts "@filename> #{@filename}"
    #file = params[:file][:tempfile]
    #imagem_tipo = params[:file][:type]

    # Testa para ver se é uma imagem que está sendo enviada
  # if (imagem_tipo == 'image/png' || imagem_tipo == 'image/jpeg' || imagem_tipo == 'image/gif') && file.size < 10000000 then

      #img_path = "./public/contas/#{@site_nome}/img/portfolio/#{@new_name}"
      #File.open img_path, 'wb' do |f|
      # f.write file.read
      #end
      puts "@file: #{@file}"
      puts "@site_nome: #{@site_nome}"
      puts "@new_name,: #{@new_name}"
      cl = Cloudinary::Uploader.upload(
       params[:file][:tempfile],
       api_key: '526244569845626',
       api_secret: 'qpyLf_nv9v40Uummu-ujHESY5e8',
       cloud_name: 'radiando',
       folder: @site_nome,
       public_id: @new_name,
       resource_type: 'video',
       invalidate: true)


      #reduz a imagem
      #image = MiniMagick::Image.open(img_path)
      #image.resize "800x800" if image.width >= 800
      #image.write img_path
      #port_img = "contas/#{@site_nome}/img/portfolio/#{@new_name}"
      port_img = "http://res.cloudinary.com/radiando/video/upload/v#{cl['version']}/#{@site_nome}/#{@new_name}"
      #port_img = "#{@site_nome}/#{@new_name}"

     puts "port_img: #{port_img}"
   #end
  end
  if (port_img == "" || port_img == "undefined" || port_img == nil) then port_img = @item["img"] end

  #Seleciona o item do portfolio
  portfolioItems = @data["portfolio"]["items"]
  portfolioItem = portfolioItems.find {|x| x['id'] == @postPortfolioItemId }
  portfolioItem["img"] = port_img
  portfolioItem["mediaType"] = "video"

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

  # Debug
  puts "postPortfolioItemId: #{postPortfolioItemId}"
  # Autenticação
  if !@logado then redirect "/" end

  #Carrega os dados do site
  @data = Dataload.testa (@url)

  # Prapara o novo item para inserção
  portfolioItemNew = {
    "id"        => postPortfolioItemId,
    "titulo"    => "",
    "mediaType" => "image",
    "img"       => "http://placehold.it/360x260/e67e22/fff",
    "txt"       => "",
    "cliente"   => "",
    "site"      => "",
    "data"      => "",
    "servico"   => "",
    "tags"      => ""
  }

  # Insere o novo item na array do arquivo fonte
  @data["portfolio"]["items"] = @data["portfolio"]["items"] || []
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

  #Envia o e-mail
  from = Email.new(email: 'contato@radiando.net')
  to = Email.new(email: dataEmail)
  subject = 'Formulário de contato'
  content = Content.new(type: 'text/plain', value: mailMessage)
  mail = SendGrid::Mail.new(from, subject, to, content)
  sg = SendGrid::API.new(api_key: @SENDGRID_API_KEY)
  response = sg.client.mail._('send').post(request_body: mail.to_json)

end

post '/modal_alterarEmailESenha_form' do

  #Carrega os dados do site
  @data = Dataload.testa (@url)
  dataEmail = @data["info"]["email"]
  dataSenha = @data["info"]["senha"]

  # Pega os dados do formulário
  modal_alterarEmailESenha_form_email = params[:modal_alterarEmailESenha_form_email]
  modal_alterarEmailESenha_form_senhaAtual = params[:modal_alterarEmailESenha_form_senhaAtual]
  modal_alterarEmailESenha_form_novaSenha = params[:modal_alterarEmailESenha_form_novaSenha]
  modal_alterarEmailESenha_form_novaSenha_confirma = params[:modal_alterarEmailESenha_form_novaSenha_confirma]

  # Define uma flag de analise do formulário enviado
  modal_alterarEmailESenha_form_flag_ok = true

  # Faz as críticas dos dados do formulário
  if modal_alterarEmailESenha_form_email.to_s.empty?
    modal_alterarEmailESenha_form_flag_ok = false
  end
  if modal_alterarEmailESenha_form_senhaAtual.to_s.empty?
    modal_alterarEmailESenha_form_flag_ok = false
  end
  if !modal_alterarEmailESenha_form_novaSenha.to_s.empty?
    if modal_alterarEmailESenha_form_novaSenha != modal_alterarEmailESenha_form_novaSenha_confirma
      modal_alterarEmailESenha_form_flag_ok = false
    end
  end

  #Confere se a senha informada é verdadeira
  if modal_alterarEmailESenha_form_senhaAtual.to_s != dataSenha.to_s
    redirect "?erro=1"
  end

  # Retorna com uma mensagem de erro caso tenha sido
  # encontrado falhas no preenchimento do formulário
  if !modal_alterarEmailESenha_form_flag_ok
    redirect "?erro=0"
  end

  # Altera o email
  @data["info"]["email"] = modal_alterarEmailESenha_form_email

  puts modal_alterarEmailESenha_form_novaSenha
  # Verifica se foi alterado a senha
  if (!modal_alterarEmailESenha_form_novaSenha.to_s.empty?)
    @data["info"]["senha"] = modal_alterarEmailESenha_form_novaSenha.to_s
  end

  # Define a data de modificação
  @data["info"]["modified"] = Time.now.getutc

  # Salva o arquivo base
  f = File.open @data_path, 'w'
  YAML.dump @data, f
  f.close

  redirect "/"
end

post '/modal_excluirSite' do
  # Pega os dados do formulário
  modal_excluirSite_form_senha = params[:modal_excluirSite_form_senha]

  #Carrega os dados do site
  @data = Dataload.testa (@url)
  dataName = @data["info"]["name"]
  dataSenha = @data["info"]["senha"]

  #Exclui o site se a senha passar
  if modal_excluirSite_form_senha.to_s == dataSenha.to_s
    FileUtils.remove_dir("public/contas/"+dataName)
  else
    redirect "?erro=1"
  end

  redirect "http://radiando.net"
end
