source "https://rubygems.org"
ruby "2.2.4"

gem "sinatra"
gem "activerecord" ,"4.1.0"
gem "sinatra-activerecord", :require => "sinatra/activerecord"
gem "rake"
gem "nokogiri"

group :production do
  gem "pg"
end

group :development, :test do
  gem "sqlite3"
  gem "sinatra-reloader"
end