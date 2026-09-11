require_relative "../test_helper"
require_relative "../../app/hatena/bookmarks"

class BookmarksTest < Minitest::Test
  FIXTURE = File.read(File.join(__dir__, "..", "fixtures", "bookmarks.json"))

  def test_fetch_parses_title_and_bookmarks
    stub = ->(_url) { FIXTURE }
    title, bookmarks = Hatena::Bookmarks.fetch("https://anond.hatelabo.jp/", fetcher: stub)

    assert_equal "はてな匿名ダイアリー", title
    assert bookmarks.size >= 4
    first = bookmarks.first
    assert_equal "wsafaaa", first.user
    assert_equal "https://cdn.profile-image.st-hatena.com/users/wsafaaa/profile.gif", first.icon
  end

  def test_fetch_builds_jsonlite_url_with_escaped_target
    seen_url = nil
    stub = ->(url) { seen_url = url; FIXTURE }
    Hatena::Bookmarks.fetch("https://example.com/a b?x=1&y=2", fetcher: stub)
    assert_equal "https://b.hatena.ne.jp/entry/jsonlite/?url=https%3A%2F%2Fexample.com%2Fa+b%3Fx%3D1%26y%3D2", seen_url
  end

  def test_comment_is_kept_unescaped_for_view_layer_to_escape
    _title, bookmarks = Hatena::Bookmarks.fetch("https://anond.hatelabo.jp/", fetcher: ->(_u) { FIXTURE })
    bm = bookmarks.find { |b| b.user == "test_user" }
    refute_nil bm
    assert_equal "A & B <script>alert('x')</script> 'quote'", bm.comment
  end

  def test_null_response_means_zero_bookmarks
    stub = ->(_url) { "null" }
    title, bookmarks = Hatena::Bookmarks.fetch("https://example.com/nobody-bookmarked-this", fetcher: stub)
    assert_nil title
    assert_equal [], bookmarks
  end

  def test_invalid_json_raises_fetch_error
    stub = ->(_url) { "not json" }
    assert_raises(Hatena::FetchError) { Hatena::Bookmarks.fetch("https://example.com/", fetcher: stub) }
  end
end
