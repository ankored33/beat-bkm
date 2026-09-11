require_relative "../test_helper"
require_relative "../../app/hatena/hotentry"

class HotentryTest < Minitest::Test
  FIXTURE = File.read(File.join(__dir__, "..", "fixtures", "hotentry.rss"))

  def test_fetch_parses_title_and_entries
    stub = ->(_url) { FIXTURE }
    title, entries = Hatena::Hotentry.fetch(nil, fetcher: stub)

    assert_equal "はてなブックマーク - 人気エントリー - 総合", title
    assert entries.size >= 4
    first = entries.first
    assert_equal "https://www.toyoeiwa.ac.jp/chu-ko/news/2026/09/025010.html", first.link
    assert_kind_of Integer, first.bookmark_count
    assert first.bookmark_count > 0
  end

  def test_fetch_uses_category_url
    seen_url = nil
    stub = ->(url) { seen_url = url; FIXTURE }
    Hatena::Hotentry.fetch("it", fetcher: stub)
    assert_equal "https://b.hatena.ne.jp/hotentry/it.rss", seen_url
  end

  def test_parse_keeps_entities_unescaped_for_view_layer_to_escape
    _title, entries = Hatena::Hotentry.parse(FIXTURE)
    entry = entries.find { |e| e.link == "https://example.com/test" }
    refute_nil entry
    # XMLエンティティ &amp; は Nokogiri がデコードして生の "&" として返す。
    # HTMLエスケープはビュー側(h)の責務なので、ここでは未エスケープのままでよい。
    assert_equal "A & B <test> 'quote'", entry.title
  end

  def test_fetch_error_propagates
    stub = ->(_url) { raise Hatena::FetchError, "boom" }
    assert_raises(Hatena::FetchError) { Hatena::Hotentry.fetch(nil, fetcher: stub) }
  end

  def test_parse_extracts_image_url_when_present
    _title, entries = Hatena::Hotentry.parse(FIXTURE)
    entry = entries.find { |e| e.link == "https://www.toyoeiwa.ac.jp/chu-ko/news/2026/09/025010.html" }
    assert_equal "https://www.toyoeiwa.ac.jp/chu-ko/common/images/og-image.jpg", entry.image_url
  end

  def test_parse_image_url_is_nil_when_absent
    _title, entries = Hatena::Hotentry.parse(FIXTURE)
    entry = entries.find { |e| e.link == "https://example.com/test" }
    refute_nil entry
    assert_nil entry.image_url
  end
end
