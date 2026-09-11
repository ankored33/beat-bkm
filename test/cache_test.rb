require_relative "test_helper"
require_relative "../app/cache"

class CacheTest < Minitest::Test
  def test_caches_within_ttl
    cache = Modern::Cache.new
    calls = 0
    2.times { cache.fetch(:k, 60) { calls += 1; "v" } }
    assert_equal 1, calls
  end

  def test_refetches_after_ttl_expires
    cache = Modern::Cache.new
    calls = 0
    cache.fetch(:k, -1) { calls += 1; "v" } # 即expire
    cache.fetch(:k, -1) { calls += 1; "v" }
    assert_equal 2, calls
  end

  def test_different_keys_are_independent
    cache = Modern::Cache.new
    assert_equal "a", cache.fetch(:a, 60) { "a" }
    assert_equal "b", cache.fetch(:b, 60) { "b" }
  end

  def test_clear_forces_refetch
    cache = Modern::Cache.new
    calls = 0
    cache.fetch(:k, 60) { calls += 1; "v" }
    cache.clear
    cache.fetch(:k, 60) { calls += 1; "v" }
    assert_equal 2, calls
  end
end
