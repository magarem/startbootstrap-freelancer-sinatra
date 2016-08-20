require 'sinatra'
require 'pry'
require 'yaml'
require 'pony'
require 'json'
require 'mini_magick'
require 'fileutils'


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
  @data_path = "public/contas/{site_nome}/{site_nome}.yml"
end

get '/:site_nome/logout' do
  session[:logado] = false
  redirect '/'+params[:site_nome]
end

#
# Verificação de login
#
post '/login_do' do   

  # Pega os parâmetros 
  @post = params[:post]    
  site_nome = @post["site"]
  @form_senha = @post["senha"]
  @data_path.gsub! "{site_nome}", site_nome
  @data = YAML.load_file @data_path
  @data_senha = @data["senha"]
  
  #Compara a senha digitada no formulário de login com a senha do fonte
  if @form_senha.to_s == @data_senha.to_s then 
    session[:logado] = true       
    @edit_flag = "true"
  else 
    session[:logado] = false
    @edit_flag = "false"      
  end
  redirect '/'+site_nome
end

get '/:site_nome' do
  @site_nome = params[:site_nome]
  @edit_flag = session[:logado]
  erb :index 
end

get '/:site_nome/dataLoad' do 
  # Pega os dados do arquivo fonte
  site_nome = params[:site_nome]   
  @data_path.gsub! "{site_nome}", site_nome
  @data = YAML.load_file @data_path
  @data.to_json    
end


get '/:site_nome/getdata' do      
  data = YAML.load_file(@data_path) || {}
  data["pages"]["portfolio"]["items"].to_json
end


post '/:site_nome/objSave' do

  site_nome = params[:site_nome] 
  @post_data = JSON.parse(request.body.read)  
  @obj = @post_data["obj"]  
  @val = @post_data["val"]

  @data_path.gsub! "{site_nome}", site_nome
  data = YAML.load_file @data_path


  case @obj

    when "site.moldura.logo.label"
       data["moldura"]["logo"]["label"] = @val

    when "site.pages.home.label"
       data["pages"]["home"]["label"] = @val

    when "site.pages.home.body"
       data["pages"]["home"]["body"] = @val

    when "about.body1" 
       data["pages"]["about"]["body1"] = @val

    when "about.body2"
       data["pages"]["about"]["body2"] = @val

    when "site.moldura.footer.endereco"
       data["moldura"]["footer"]["endereco"] = @val

    when "site.moldura.footer.about_resumo"
       data["moldura"]["footer"]["about_resumo"] = @val

    when "site.pages.portfolio.label"
       data["pages"]["portfolio"]["label"] = @val
       data["moldura"]["menu"][0]["label"] = @val

    when "item.titulo"
       @item_n = @post_data["item_n"]
       data["pages"]["portfolio"]["items"][@item_n]["titulo"] = @val

    when "item.txt"
       @item_n = @post_data["item_n"]
       data["pages"]["portfolio"]["items"][@item_n]["txt"] = @val

    when "item.cliente"
       @item_n = @post_data["item_n"]
       data["pages"]["portfolio"]["items"][@item_n]["cliente"] = @val

    when "item.site"
       @item_n = @post_data["item_n"]
       data["pages"]["portfolio"]["items"][@item_n]["site"] = @val

    when "item.data"
       @item_n = @post_data["item_n"]
       data["pages"]["portfolio"]["items"][@item_n]["data"] = @val

    when "item.servico"
       @item_n = @post_data["item_n"]
       data["pages"]["portfolio"]["items"][@item_n]["servico"] = @val

    when "item.cat"
       @item_n = @post_data["item_n"]
       data["pages"]["portfolio"]["items"][@item_n]["cat"] = @val

    when "about.label"
       data["pages"]["about"]["label"] = @val
       data["moldura"]["menu"][1]["label"] = @val

    when "contact.label" then
       data["pages"]["contact"]["label"] = @val
       data["moldura"]["menu"][2]["label"] = @val
  end

  f = File.open(@data_path, 'w' )
  YAML.dump( data, f )
  f.close

end

#
# upload da imagem de capa (oval)
#
post "/:site_nome/upload" do 

  if session[:logado] then

    # Pega os parametros 
    site_nome = params[:site_nome]
    @filename = params[:file][:filename]
    file = params[:file][:tempfile]
    imagem_tipo = params[:file][:type]
    @data_path.gsub! "{site_nome}", site_nome

    # Testa para ver se é uma imagem que está sendo enviada
    if (imagem_tipo == 'image/png' || imagem_tipo == 'image/jpeg' || imagem_tipo == 'image/gif') && file.size < 300000 then
      
      # Salva imagem no disco (upload)
      @filename = site_nome+"."+params["file"][:filename].split(".").last.downcase
      File.open("./public/contas/#{site_nome}/img/#{@filename}", 'wb') do |f|
        f.write(file.read)
      end
      
      # Reduz o tamanho da imagem
      image = MiniMagick::Image.open("./public/contas/#{site_nome}/img/#{@filename}")
      image.resize "600x600"   
      image.write "./public/contas/#{site_nome}/img/#{@filename}"

      # Salva o nome da imagem o arquivo fonte
      data = YAML.load_file @data_path
      data["pages"]["home"]["img"] = "contas/#{site_nome}/img/#{@filename}"
      f = File.open(@data_path, 'w' )
      YAML.dump( data, f )
      f.close  
    end          
  end
end

# 
#  portfolio: Excluindo um item
#
post "/:site_nome/portfolio/delete/:id" do 

  # Pega os parametros
  site_nome = params[:site_nome]
  @id = params[:id]
  @data_path.gsub! "{site_nome}", site_nome

  # Abre o arquivo fonte e exclui o item
  data = YAML.load_file @data_path
  data["pages"]["portfolio"]["items"].delete_at(@id.to_i)

  # Salva o arquivo com a alteração (exclusão)
  f = File.open(@data_path, 'w' )
  YAML.dump( data, f )
  f.close

  "Delete"
end

#
#  Portfolio: Mudança na ordenação
#
post "/:site_nome/portfolio/ordena" do

  # Pega os parâmetros
  site_nome = params[:site_nome]
  @post_data = JSON.parse(request.body.read)  
  @data_path.gsub! "{site_nome}", site_nome

  # Lê o arquivo fonte
  data = YAML.load_file @data_path
  data["pages"]["portfolio"]["items"] = @post_data  
  f = File.open(@data_path, 'w' )
  YAML.dump( data, f )
  f.close
end

#
#  Portfolio: upload da imagem do item
#
post "/:site_nome/portfolio/uploadPic/:index" do 

  # Pega os parâmetros
  @site_nome = params[:site_nome]
  @item = params[:item]
  @index = params[:index].to_i
  @file = params[:file]

  port_img = ""
  @data_path.gsub! "{site_nome}", @site_nome

  # Carrega os dados do arquivo fonte
  data = YAML.load_file @data_path

  unless @file == nil
    @filename = params[:file][:filename]
    file = params[:file][:tempfile]
    imagem_tipo = params[:file][:type]
    # Testa para ver se é uma imagem que está sendo enviada
    if (imagem_tipo == 'image/png' || imagem_tipo == 'image/jpeg' || imagem_tipo == 'image/gif') && file.size < 600000 then
      img_path = "./public/contas/#{@site_nome}/img/portfolio/#{@filename}"
      File.open(img_path, 'wb') do |f|
        f.write(file.read)
      end
      #reduz a imagem
      image = MiniMagick::Image.open(img_path)
      image.resize "600x600"   
      image.write img_path
      port_img = "contas/#{@site_nome}/img/portfolio/#{@filename}"
    end
  end
  if (port_img == "" || port_img == "undefined" || port_img == nil) then port_img = @item["img"] end
  data["pages"]["portfolio"]["items"][@index]["img"] = port_img
  
  # Salva os dados alterados
  f = File.open(@data_path, 'w' )
  YAML.dump( data, f )
  f.close              
end

#
#  Portfolio: adicionando um novo item
#
post "/:site_nome/portfolio/add" do 
  @site_nome = params[:site_nome]
  @data_path.gsub! "{site_nome}", @site_nome
  data = YAML.load_file @data_path
  novo = { "id"      => "0",
           "titulo"  => "Novo",
           "img"     => "/img/noimage.png",
           "txt"     => "",
           "cliente" => "",
           "site"    => "",
           "data"    => "",
           "servico" => "",
           "cat"     => ""
         }
  data["pages"]["portfolio"]["items"] << novo
  f = File.open(@data_path, 'w' )
  YAML.dump( data, f )
  f.close
end

post '/email_envia' do

  name = params[:name]
  email = params[:email]
  phone = params[:phone]
  message = params[:message]
  
  Pony.mail :to => "contato@magaweb.com.br",
            :from => email,
            :subject => "Contato",
            :body => message
end

get "/novo_site/:site_nome" do 

  site_nome = params[:site_nome]
  
  @data_path.gsub! "{site_nome}", site_nome
  #Clona o site base
  FileUtils.cp("site.yml", @data_path)
  
  #Cria diretorio de imagens
  install_dir = "public/contas/#{site_nome}/img/portfolio"
  FileUtils::mkdir_p install_dir

  #Altera o nome do site no arquivo fonte
  data = YAML.load_file @data_path
  data["name"] = site_nome    
  
  #copia imagem da capa
  FileUtils.cp("public/img/noimage.png","public/contas/#{site_nome}/img/noimage.png")
  #Altera a capa do site
  data["pages"]["home"]["img"] = "contas/#{site_nome}/img/noimage.png"
  
  #Salva o arquivo fonte
  f = File.open(@data_path, 'w' )
  YAML.dump( data, f )
  f.close  

  # Abre o site recem criado no modo de edição
  redirect "/#{site_nome}"
end