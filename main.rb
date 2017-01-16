require "sinatra"
require "json"
require "open-uri"
require "nokogiri"
require "sinatra/reloader" if development?
require 'cgi'
require 'erb'
include ERB::Util


helpers do
    include Rack::Utils
    alias_method :h, :escape_html
end

    

get "/" do
    @disp = "はてなブックマーク - 人気エントリー - 総合"
    @bkm = Hash.new
    rss = "http://b.hatena.ne.jp/hotentry.rss"
    opt = {}
    opt["User-Agent"] = "Opera/9.80 (Windows NT 5.1; U; ja) Presto/2.7.62 Version/11.01 " #User-Agent偽装
    charset = nil
    xml = open(rss,opt) do |f|
      charset = f.charset #文字種別を取得
      f.read #htmlを読み込んで変数htmlに渡す
    end
    doc = Nokogiri::XML(xml)
    doc.remove_namespaces!
    @entries = Array.new
    doc.xpath('//item').each {|anchor|
      item = Hash.new
      link = anchor.xpath("link").inner_text
      item["link"] = link
      title_esc = anchor.xpath("title").inner_text.gsub("'", "’")
      item["title"] = CGI.escapeHTML(title_esc)
      item["bkmcount"] = anchor.xpath("bookmarkcount").inner_text.to_i
      desc_esc = anchor.xpath("description").inner_text[0,80].gsub("'", "’")
      item["description"] = CGI.escapeHTML(desc_esc)
      @entries << item
    }
    erb :index
end


get "/about" do
  erb :about
end


get "/:category" do
  category = params["category"]
  categories = ["social", "economics", "life", "knowledge", "it", "fun", "entertainment", "game"]
  redirect to "/:entry_path"  if categories.include?(category) == false
    rss = "http://b.hatena.ne.jp/hotentry/#{category}.rss"
    opt = {}
    opt["User-Agent"] = "Opera/9.80 (Windows NT 5.1; U; ja) Presto/2.7.62 Version/11.01 " #User-Agent偽装
    charset = nil
    xml = open(rss,opt) do |f|
      charset = f.charset #文字種別を取得
      f.read #htmlを読み込んで変数htmlに渡す
    end
    doc = Nokogiri::XML(xml)
    doc.remove_namespaces!
    @disp = doc.xpath('RDF/channel/title').inner_text
    @entries = Array.new
    doc.xpath('//item').each {|anchor|
      item = Hash.new
      link = anchor.xpath("link").inner_text
      item["link"] = link
      title_esc = anchor.xpath("title").inner_text.gsub("'", "’")
      item["title"] = CGI.escapeHTML(title_esc)
      item["bkmcount"] = anchor.xpath("bookmarkcount").inner_text.to_i
      desc_esc = anchor.xpath("description").inner_text[0,80].gsub("'", "’")
      item["description"] = CGI.escapeHTML(desc_esc)
      @entries << item
    }
    erb :index  
end


post "/post" do
  post_url = params[:post_url]
  opt = {}
  opt["User-Agent"] = "Opera/9.80 (Windows NT 5.1; U; ja) Presto/2.7.62 Version/11.01 " #User-Agent偽装
  uri = "http://b.hatena.ne.jp/entry/jsonlite/?url=#{post_url}" 
  uri_esc = URI.escape(uri)
  io = open(uri_esc, opt)
  hash = JSON.load(io)
  bkm = hash["bookmarks"]
  bkm.each {|var|
    user = var["user"]
    var["icon"] = "http://www.hatena.com/users/#{user[0,2]}/#{user}/profile.gif"
    comment_esc = var["comment"]
    var["comment"] = CGI.escapeHTML(comment_esc)
    var.delete("timestamp")
    var.delete("tags")
  }  
  content_type :json
  @data = bkm.to_json
end
