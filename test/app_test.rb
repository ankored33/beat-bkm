require_relative "test_helper"
require_relative "../app/app"

class ModernAppTest < Minitest::Test
  include Rack::Test::Methods

  def app
    Modern::App
  end

  def test_healthz_ok_without_network
    get "/healthz"
    assert last_response.ok?
    assert_equal "ok", last_response.body
  end

  def test_noindex_header_under_next_mount
    # URLMap は SCRIPT_NAME を設定してから委譲するので、その経路を直接検証する
    env = Rack::MockRequest.env_for("/", "SCRIPT_NAME" => "/next")
    _status, headers, = Modern::App.call(env)
    assert_equal "noindex", headers["X-Robots-Tag"]
  end
end
