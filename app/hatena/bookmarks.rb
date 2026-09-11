# frozen_string_literal: true

require "json"
require "cgi"
require_relative "client"

module Hatena
  Bookmark = Struct.new(:user, :icon, :comment, keyword_init: true)

  module Bookmarks
    JSONLITE = "https://b.hatena.ne.jp/entry/jsonlite/"

    module_function

    # 返り値は [エントリのタイトル, Bookmark の配列]。
    # ブックマークが1件も無い URL だと jsonlite は本文 "null"・HTTP 200
    # を返す（クラシック版はこれを HTTPError と誤認して /error 行きに
    # なっていた）。ここでは正しく「0件」として扱う。
    def fetch(url, fetcher: Client.method(:get))
      body = fetcher.call("#{JSONLITE}?url=#{CGI.escape(url)}")
      data = JSON.parse(body)
      return [nil, []] if data.nil?

      bookmarks = (data["bookmarks"] || []).map do |b|
        user = b["user"]
        Bookmark.new(
          user: user,
          icon: "https://cdn.profile-image.st-hatena.com/users/#{user}/profile.gif",
          comment: b["comment"].to_s
        )
      end

      [data["title"], bookmarks]
    rescue JSON::ParserError => e
      raise FetchError, "invalid jsonlite response: #{e.message}"
    end
  end
end
