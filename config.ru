require 'sinatra'
require File.expand_path '../myapp.rb', __FILE__

run Sinatra::Application
Encoding.default_external = Encoding::UTF_8
