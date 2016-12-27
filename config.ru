require "rubygems"
require "bundler"
require File.dirname(__FILE__) + "/main"

use ActiveRecord::ConnectionAdapters::ConnectionManagement

run Sinatra::Application