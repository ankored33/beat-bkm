# beat-bkm

はてなブックマークのホットエントリーとブコメを閲覧できる「殴れるはてブ」。

現在は近代化作業の途中。本番の `/` は今のところ 2017年当時のクラシック実装
（`classic/`）のままで、新実装は `app/` に裏で作り込んでいる（本番では
`/next/` にマウント、`X-Robots-Tag: noindex` で検索避け）。作り込みが終わり
次第、`config.ru` の 1 コミットで `/` を新実装に、クラシックを `/classic/`
に差し替える。詳しい方針は [MODERNIZATION_PLAN.md](MODERNIZATION_PLAN.md) を参照。

## 構成

```
config.ru        # / → クラシック（当面）、/next → 新実装
classic/          # 凍結された2017年当時の実装（main.rb / views/ / public/）
app/              # 近代化中の新実装
test/             # minitest。classic は / と /classic の両マウントで検証
```

## ローカルで動かす

```sh
bundle install
bundle exec rackup -p 4567
```

- クラシック版: http://localhost:4567/
- 新実装（作業中）: http://localhost:4567/next/

## テスト

```sh
bundle exec rake test
```

`classic_test.rb` は実際にはてなの RSS / jsonlite API を叩く。ネットワーク
不通の環境では該当テストは自動でスキップされる。
