# frozen_string_literal: true

module Modern
  # 無料枠のプロセスは1個だけなのでメモリ内 TTL キャッシュで足りる。
  # はてな側への負荷と応答速度の両方に効く。
  class Cache
    def initialize
      @store = {}
      @mutex = Mutex.new
    end

    def fetch(key, ttl)
      now = Time.now
      cached = @mutex.synchronize do
        entry = @store[key]
        entry if entry && entry[:expires_at] > now
      end
      return cached[:value] if cached

      value = yield
      @mutex.synchronize { @store[key] = { value: value, expires_at: now + ttl } }
      value
    end

    # テスト用。本番では使わない。
    def clear
      @mutex.synchronize { @store.clear }
    end
  end
end
