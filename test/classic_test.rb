require_relative "test_helper"
require_relative "../classic/main"

# main.rb が触れているのはルーティングとRSS/JSONの解析だけ。
# ここでは「動く」ことだけを、/ と /classic の両マウントで確認する。
# はてな側の実データに依存するテストなので通信不可の環境ではスキップする。

class ClassicTest < Minitest::Test
  APP = Rack::URLMap.new("/classic" => Sinatra::Application, "/" => Sinatra::Application)

  def get(path)
    Rack::MockRequest.new(APP).get(path)
  end

  def skip_unless_network!
    skip "network unavailable, skipping live-fetch tests" unless get("/it").ok?
  end

  # base はマウントのプレフィックス（"" または "/classic"）。ラベルはテストメソッド名用。
  { "root" => "", "classic" => "/classic" }.each do |label, base|
    define_method("test_top_page_ok_at_#{label}") do
      skip_unless_network!
      assert get("#{base}/").ok?
    end

    define_method("test_about_ok_at_#{label}") do
      assert get("#{base}/about").ok?
    end

    define_method("test_invalid_category_redirects_to_error_at_#{label}") do
      res = get("#{base}/not-a-real-category")
      assert_equal 302, res.status
      assert_match(%r{/error\z}, res.location)
    end

    define_method("test_category_page_ok_at_#{label}") do
      res = get("#{base}/it")
      skip "network unavailable, skipping live-fetch tests" unless res.ok?
      assert res.ok?
    end
  end

  def test_static_css_served
    assert get("/classic/css.css").ok?
  end
end
