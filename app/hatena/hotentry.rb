# frozen_string_literal: true

require "nokogiri"
require_relative "client"

module Hatena
  # ホットエントリー1件。値は未エスケープの生テキストで持つ（エスケープは
  # 描画側の責務。クラシックの main.rb は取得時に CGI.escapeHTML してから
  # ビューでさらに h をかけていて、URL 直指定のページだけ二重エスケープに
  # なっていた。MODERNIZATION_PLAN.md 参照）。
  Entry = Struct.new(:link, :title, :bookmark_count, :description, keyword_init: true)

  module Hotentry
    TOP_RSS = "https://b.hatena.ne.jp/hotentry.rss"
    CATEGORY_RSS = "https://b.hatena.ne.jp/hotentry/%s.rss"

    # スラッグ => ナビゲーション表示名。クラシック版のメニュー文言を踏襲。
    CATEGORY_LABELS = {
      "social" => "世の中",
      "economics" => "政治と経済",
      "life" => "暮らし",
      "knowledge" => "学び",
      "it" => "テクノロジー",
      "fun" => "おもしろ",
      "entertainment" => "エンタメ",
      "game" => "アニメとゲーム"
    }.freeze
    CATEGORIES = CATEGORY_LABELS.keys.freeze

    module_function

    # category が nil なら総合。返り値は [フィード表示名, Entry の配列]
    def fetch(category = nil, fetcher: Client.method(:get))
      url = category ? format(CATEGORY_RSS, category) : TOP_RSS
      parse(fetcher.call(url))
    end

    def parse(xml)
      doc = Nokogiri::XML(xml)
      doc.remove_namespaces!

      title = doc.at_xpath("//channel/title")&.text.to_s

      entries = doc.xpath("//item").map do |item|
        Entry.new(
          link: item.at_xpath("link")&.text.to_s,
          title: item.at_xpath("title")&.text.to_s,
          bookmark_count: item.at_xpath("bookmarkcount")&.text.to_i || 0,
          description: item.at_xpath("description")&.text.to_s
        )
      end

      [title, entries]
    end
  end
end
