require "twitter"
require "open-uri"
require "nokogiri"

    source = "http://b.hatena.ne.jp/xevra/rss"
    opt = {}
    opt["User-Agent"] = "Opera/9.80 (Windows NT 5.1; U; ja) Presto/2.7.62 Version/11.01 " #User-Agent偽装
    charset = nil
    xml = open(source,opt) do |f|
      charset = f.charset #文字種別を取得
      f.read #htmlを読み込んで変数htmlに渡す
    end
    doc = Nokogiri::XML(xml)
    doc.remove_namespaces!
    tweet_src = Array.new
    doc.xpath('//item').each {|anchor|
      count = anchor.xpath("bookmarkcount").inner_text
      next if count.to_i < 10
      item = Hash.new
      item["count"] = count
      link = anchor.xpath("link").inner_text
      item["link"] = link
      title_esc = anchor.xpath("title").inner_text.gsub("'", "’")
      item["title"] = CGI.escapeHTML(title_esc)
      count = anchor.xpath("bookmarkcount").inner_text
      item["count"] = count
      tweet_src << item
    }
    
    i = rand(tweet_src.size) + 1
    select = tweet_src[i]
    tweet_url = "http://beat-htb.anko.red/site?url=" + select["link"]
    tweet_title = select["title"]
    tweet_count = select["count"]
    tweet_title = tweet_title[0, 128] if tweet_title.length > 129
    tweet = "#{tweet_count}users　#{tweet_title}　 #{tweet_url}"
    p tweet.length
    p tweet

client = Twitter::REST::Client.new do |config|
  config.consumer_key = "4nntKhspRiur4NXa56VN2kAH8"
  config.consumer_secret = "DiTo9qGqjq9yHyFb7KEHnXGS1hdncCL7Evh4cZYpaAuQLQjE6l"
  config.access_token        = "821251878893690882-uk7HwKCtUXU7IAcBMgEULyOUeZP9bA0"
  config.access_token_secret = "1eDki1K3wWzTbcJNbEuVTjJ8Q9IgjpuIZg11G7IFzNdOy"
end

client.update(tweet)


=begin
    source = "http://nikkei225jp.com/chart/"
    opt = {}
    opt["User-Agent"] = "Opera/9.80 (Windows NT 5.1; U; ja) Presto/2.7.62 Version/11.01 " #User-Agent偽装
    charset = nil
    html = open(source,opt) do |f|
      charset = f.charset #文字種別を取得
      f.read #htmlを読み込んで変数htmlに渡す
    end
    doc = Nokogiri::HTML.parse(html)  
    p doc.xpath('//*[@id="V111"]').inner_text
=end