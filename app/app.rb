# frozen_string_literal: true

require "sinatra/base"
require "cgi"
require_relative "hatena/hotentry"
require_relative "hatena/bookmarks"
require_relative "cache"

module Modern
  class App < Sinatra::Base
    set :root, File.expand_path(__dir__)
    set :views, File.join(root, "views")
    set :public_folder, File.join(root, "..", "public")
    # クラシック版へのリンク先。開発中は "/"、Phase 4 の差し替え後は
    # "/classic" にする（config.ru のマウント変更と同時に1箇所だけ直す）。
    set :classic_base_path, ENV.fetch("CLASSIC_BASE_PATH", "/")

    HOTENTRY_TTL = 300   # 5分
    BOOKMARKS_TTL = 600  # 10分
    CACHE = Cache.new

    helpers do
      include Rack::Utils
      alias_method :h, :escape_html
    end

    # /next で作り込んでいる間は検索避け。差し替え後にこのブロックごと消す。
    before do
      headers "X-Robots-Tag" => "noindex" if request.script_name == "/next"
    end

    get "/healthz" do
      content_type :text
      "ok"
    end

    get "/" do
      show_hotentry(nil)
    end

    # /:category は単一セグメントに何でもマッチする catch-all なので、
    # /entry や /site など固定パスのルートより「後」に定義しないと
    # そちらを奪ってしまう（category="entry" 等として誤って処理される）。
    get "/entry" do
      show_entry(params["url"])
    end

    # 旧URL互換。クラシック版の /site?url=... はそのままここに来る
    get "/site" do
      redirect to("/entry?url=#{CGI.escape(params["url"].to_s)}"), 301
    end

    get "/api/bookmarks" do
      url = params["url"]
      halt 400, json_error("url is required") if url.nil? || url.empty?

      begin
        _title, bookmarks = CACHE.fetch(url, BOOKMARKS_TTL) { Hatena::Bookmarks.fetch(url) }
      rescue Hatena::FetchError
        halt 502, json_error("はてなブックマークの取得に失敗しました")
      end

      content_type :json
      bookmarks.map { |b| { user: b.user, icon: b.icon, comment: b.comment } }.to_json
    end

    get "/about" do
      erb :about
    end

    get "/:category" do
      category = params["category"]
      halt 404, erb(:not_found) unless Hatena::Hotentry::CATEGORIES.include?(category)
      show_hotentry(category)
    end

    not_found do
      erb :not_found
    end

    error do
      @message = "予期しないエラーが発生しました。しばらくしてからお試しください。"
      erb :error
    end

    private

    def show_hotentry(category)
      cache_key = category || :top
      @disp, @entries = CACHE.fetch(cache_key, HOTENTRY_TTL) { Hatena::Hotentry.fetch(category) }
      erb :index
    rescue Hatena::FetchError
      @message = "はてなブックマークからの取得に失敗しました。しばらくしてからお試しください。"
      erb :error
    end

    def show_entry(url)
      if url.nil? || url.empty?
        @message = "URLを指定してください"
        halt 400, erb(:error)
      end

      @post_url = url
      @title, @bkm = CACHE.fetch(url, BOOKMARKS_TTL) { Hatena::Bookmarks.fetch(url) }
      erb :entry
    rescue Hatena::FetchError
      @message = "ブックマーク情報の取得に失敗しました（はてな側が混雑しているか、巨大なエントリの可能性があります）。しばらくしてからお試しください。"
      erb :error
    end

    def json_error(message)
      content_type :json
      { error: message }.to_json
    end
  end
end
