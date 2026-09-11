# frozen_string_literal: true

require "net/http"
require "uri"
require "timeout"
require "openssl"

module Hatena
  # はてな側の取得失敗（タイムアウト・非200・ネットワークエラー）をまとめて表す。
  # 呼び出し側はこれだけ rescue すればよい。
  class FetchError < StandardError; end

  # はてなブックマークへの HTTP アクセス。タイムアウトを必ず設定する
  # （クラシック版は無制限で、巨大エントリで はてな側が20〜30秒かかり
  # 504を返すことがあった。WORKLOG.md 参照）。
  class Client
    OPEN_TIMEOUT = 5
    READ_TIMEOUT = 20
    USER_AGENT = "beat-bkm/2.0 (+https://beat-bkm.onrender.com/about)"

    def self.get(url)
      new.get(url)
    end

    def get(url)
      uri = URI.parse(url)
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = uri.scheme == "https"
      http.open_timeout = OPEN_TIMEOUT
      http.read_timeout = READ_TIMEOUT

      request = Net::HTTP::Get.new(uri)
      request["User-Agent"] = USER_AGENT

      response = http.request(request)
      unless response.is_a?(Net::HTTPSuccess)
        raise FetchError, "#{response.code} #{response.message} (#{url})"
      end

      response.body
    rescue Timeout::Error, SocketError, IOError, OpenSSL::SSL::SSLError, SystemCallError => e
      raise FetchError, "#{e.class}: #{e.message} (#{url})"
    end
  end
end
