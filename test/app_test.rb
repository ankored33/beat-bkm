require_relative "test_helper"
require_relative "../app/app"
require "json"

class ModernAppTest < Minitest::Test
  include Rack::Test::Methods
  include StubHelper

  def app
    Modern::App
  end

  # CACHE はクラス定数でプロセス全体・テスト全体に共有されるので、
  # 前のテストが書いた値を次のテストが誤って読まないようにする。
  def setup
    Modern::App::CACHE.clear
  end

  def test_healthz_ok_without_network
    get "/healthz"
    assert last_response.ok?
    assert_equal "ok", last_response.body
  end

  def test_noindex_header_under_next_mount
    # URLMap は SCRIPT_NAME を設定してから委譲するので、その経路を直接検証する。
    # /healthz はネットワークを使わないので他のテストと独立している。
    env = Rack::MockRequest.env_for("/healthz", "SCRIPT_NAME" => "/next")
    _status, headers, = Modern::App.call(env)
    assert_equal "noindex", headers["X-Robots-Tag"]
  end

  def test_no_noindex_header_at_root_mount
    get "/healthz"
    refute last_response.headers.key?("X-Robots-Tag")
  end

  def test_top_page_renders_stubbed_entries
    with_stub(Hatena::Hotentry, :fetch, ->(*) { ["テスト総合", [Hatena::Entry.new(link: "https://example.com/", title: "見出し", bookmark_count: 3, description: "説明")]] }) do
      get "/"
      assert last_response.ok?
      assert_includes last_response.body, "テスト総合"
      assert_includes last_response.body, "見出し"
      assert_includes last_response.body, "3 users"
    end
  end

  def test_top_page_escapes_entry_html
    dangerous = Hatena::Entry.new(link: "https://example.com/", title: "<script>alert(1)</script>", bookmark_count: 1, description: "d")
    with_stub(Hatena::Hotentry, :fetch, ->(*) { ["T", [dangerous]] }) do
      get "/"
      refute_includes last_response.body, "<script>alert(1)</script>"
      assert_includes last_response.body, "&lt;script&gt;"
    end
  end

  def test_top_page_shows_error_message_on_fetch_failure
    with_stub(Hatena::Hotentry, :fetch, ->(*) { raise Hatena::FetchError, "boom" }) do
      get "/"
      assert last_response.ok?
      assert_includes last_response.body, "取得に失敗しました"
    end
  end

  def test_invalid_category_is_404
    get "/not-a-real-category"
    assert_equal 404, last_response.status
  end

  def test_valid_category_renders
    with_stub(Hatena::Hotentry, :fetch, ->(*) { ["IT総合", []] }) do
      get "/it"
      assert last_response.ok?
      assert_includes last_response.body, "IT総合"
    end
  end

  def test_entry_page_renders_stubbed_bookmarks
    bm = Hatena::Bookmark.new(user: "alice", icon: "https://example.com/icon.gif", comment: "comment")
    with_stub(Hatena::Bookmarks, :fetch, ->(*) { ["エントリタイトル", [bm]] }) do
      get "/entry?url=https://example.com/"
      assert last_response.ok?
      assert_includes last_response.body, "エントリタイトル"
      assert_includes last_response.body, "alice"
    end
  end

  def test_entry_page_requires_url
    get "/entry"
    assert_equal 400, last_response.status
  end

  def test_site_redirects_to_entry_with_301
    get "/site?url=https://example.com/page"
    assert_equal 301, last_response.status
    assert_match(%r{/entry\?url=https%3A%2F%2Fexample\.com%2Fpage\z}, last_response.location)
  end

  def test_about_ok
    get "/about"
    assert last_response.ok?
  end

  def test_unknown_path_is_404
    get "/entry/nonexistent/deeply/nested"
    assert_equal 404, last_response.status
  end

  def test_api_bookmarks_returns_json
    bm = Hatena::Bookmark.new(user: "bob", icon: "https://example.com/icon.gif", comment: "hi")
    with_stub(Hatena::Bookmarks, :fetch, ->(*) { ["T", [bm]] }) do
      get "/api/bookmarks?url=https://example.com/"
      assert last_response.ok?
      assert_equal "application/json", last_response.content_type.split(";").first
      body = JSON.parse(last_response.body)
      assert_equal "bob", body.first["user"]
    end
  end

  def test_api_bookmarks_requires_url
    get "/api/bookmarks"
    assert_equal 400, last_response.status
  end
end
