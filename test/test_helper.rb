ENV["RACK_ENV"] ||= "test"
require "minitest/autorun"
require "rack/test"

module StubHelper
  # mod.method_name を replacement に差し替えた状態で block を実行し、
  # 終わったら必ず元に戻す。(Hatena::Hotentry.fetch / Hatena::Bookmarks.fetch
  # は module_function なので特異メソッドとして再定義すればよい。
  # ネットワークなしでルートの挙動だけを検証したいときに使う)
  def with_stub(mod, method_name, replacement)
    original = mod.method(method_name)
    mod.define_singleton_method(method_name, &replacement)
    yield
  ensure
    mod.define_singleton_method(method_name, original)
  end
end
