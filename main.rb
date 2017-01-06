require "sinatra"
require "json"
require "open-uri"
require "nokogiri"
require "active_record"
require "sinatra/activerecord"

class Index
  
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
    entries = Array.new
    doc.xpath('//item').each {|anchor|
      item = Hash.new
      item["link"] = anchor.xpath("link").inner_text
      item["title"] = anchor.xpath("title").inner_text
      item["bkmcount"] = anchor.xpath("bookmarkcount").inner_text
      entries << item
    }
end



#コメントの文字が減ってく形にする


=begin    
    doc.xpath('//item').each {|anchor|
      p anchor.xpath('title').inner_text
      #item["link"] = anchor.xpath("link").inner_text
      #item["bkmcount"] = anchor.xpath(/hatena:bookmarkcount/).inner_text
      }
#url, title, bkmcount,




    opt = {}
    opt["User-Agent"] = "Opera/9.80 (Windows NT 5.1; U; ja) Presto/2.7.62 Version/11.01 " #User-Agent偽装
    charset = nil
    xml = open(hatena,opt) do |f|
      charset = f.charset #文字種別を取得
      f.read #htmlを読み込んで変数htmlに渡す
    end

    entries = String.new
    doc.xpath('//*[@id="main"]/div[1]/div[1]//a[@class="entry-link"]').each {|anchor|
      entries << "&url=" + anchor[:href]
    }
    doc.xpath('//*[@id="main"]/div[1]/div[3]//a[@class="entry-link"]').each {|anchor|
      entries << "&url=" + anchor[:href]
    }

    #ホッテントリURLを切り分け

    hoturi = "http://api.b.st-hatena.com/entry.counts?url=#{entries}" #ブクマ件数API（複数URL対応、JSON戻し）
    hoturi_esc = URI.escape(hoturi)
    hotio = open(hoturi_esc, opt)
    hothash = JSON.load(hotio)
    hothash.delete_if {|key, val| val > 50 }
    hothash.delete_if {|key, val| val == 0 }
    hothash.each_pair {|key, val| #以下ホッテントリ各URLをARI処理してブクマデータ取得　変数keyにurlが入ってる
      uri = "http://b.hatena.ne.jp/entry/json/?url=#{key}" 
      uri_esc = URI.escape(uri)
      io = open(uri_esc, opt)
      hash = JSON.load(io)
      title = hash["title"]
      p hash
      eid = hash["eid"].to_s
      bkm = hash["bookmarks"]
      next if bkm == nil #ブコメ０のときAPIが:bookmarksキーを返さないので対策
      bkm.each {|aaa|
        aaa["bkmcount"] = val
        aaa["eid"] = eid
      }
      # bkmの構造は右記ハッシュが入った配列 {"comment"=>"ああああ", "user"=>"aaaa", "URL"=>"http://twitter.com/memel_ko1/status/648781614068006912"},{...}
      #nokogiriで上位10コメだけ詳細データ（ユーザー名とパーマリンク）とる
      hotkey = "http://b.hatena.ne.jp/entry/#{key}"
      charset = nil
      html = open(hotkey,opt) do |f|
        charset = f.charset 
        f.read
      end
      doc = Nokogiri::HTML.parse(html, nil, charset)
      doc.xpath('//*[@id="scored-bookmarks"]/ul/li/a[@class="username"]').each {|node|
        name = node.text
        parma = node[:href]
        starurl = "http://s.hatena.com/entry.json?uri=http://b.hatena.ne.jp#{parma}"
        starurl_esc = URI.escape(starurl) 
        io_s = open(starurl_esc, opt)
        hash_s =JSON.load(io_s)
        #["colored_stars"]を探索して色ごとに配列に突っ込む
        colorstars = Array.new
        if hash_s["entries"].empty? == false #["entries"]が空の人用のif文
          x = hash_s["entries"][0]["colored_stars"]
          if x != nil
            x.each {|var_s|
              cs = var_s["color"]
              colorstars << cs
            }
          else
          end
            y_star = hash_s["entries"][0]["stars"].length #黄色スターの数
            g_star = colorstars.count("green").to_i
            r_star = colorstars.count("red").to_i
            b_star = colorstars.count("blue").to_i
            p_star = colorstars.count("purple").to_i
            s_power = 0
            s_power = y_star + g_star * 5 + r_star * 20 + b_star * 50 + p_star * 100 #色ごとにスター評価値を描けてスターパワーを算出
        else
            y_star = 0 #["entries"]が空の人はとりあえず全部0
            g_star = 0
            r_star = 0
            b_star = 0
            p_star = 0
            s_power = 0
        end
        bkm.each {|bar|
          if bar.has_value?(name) == true
            bar["spower"] = s_power.to_i
            p "#{name} => #{s_power}"
          else
          end
        }
        sleep(1)
      }  #doc.xpath('//*[@id="scored-bookmarks"]/ul/li/a[@class="username"]').each のカッコ閉じ
      p "計算終了。データベースに保存します。"
      sleep(1)
      bkm.each {|var|
        var.delete("tags")
        var.delete("timestamp")
        var["URL"]= URI.escape(key)
        var["title"]= title
        user = var["user"]
        var["spower"] = 0 if var["spower"] == nil
        var["icon"] = "http://www.hatena.com/users/#{user[0,2]}/#{user}/profile.gif"
        Post.create(
          :user => var["user"],
          :comment => var["comment"],
          :spower => var["spower"],
          :URL => var["URL"],
          :title => var["title"],
          :bkmcount => var["bkmcount"],
          :eid => var["eid"],
          :icon => var["icon"],
          :run => 0
        )
      p "#{var["title"]}の#{var["user"]}のブコメデータをDBに保存完了。"
      }
    } #hothash.each_keyの括弧閉じ
    p "ホットエントリ一巡完了。データベースを更新します。"
    Post.where("run" => 1).update_all(:run => 3)
    Post.where("run" => 0).update_all(:run => 1)
    Post.destroy_all(:run => 3)
    #スリープ
    countdown = 600
    10.times {
      puts "#{countdown}秒後に再開します。"
      countdown -= 60
    sleep(60)
    }
=end

