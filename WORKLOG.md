# 復旧作業ログ

2026-07-10 / Ruby 3.3.11 / 所要17分（修正作業前プッシュ 16:39 → 復旧コミット 16:56。Ruby環境構築込み）

- Gemfile.lock が Bundler 1.13.7 製 → bundle install が 1.13.7 を入れ直して `untaint` 削除（Ruby 3.2〜）でエラー → Gemfile.lock 削除して再生成
- Gemfile が ruby 2.2.4 固定・sinatra-reloader gem 指定 → ruby 3.3以上、Sinatra 4.1 + rackup + puma、reloader は sinatra-contrib に変更。twitter gem 削除
- `vender/`（typo）に gem 一式14MBがコミット済み・.gitignore なし → ディレクトリ削除、.gitignore 新規作成
- `open(url, opt)` が Ruby 3.0 で open-uri の Kernel#open パッチ廃止により TypeError → `URI.open` に置換（4箇所）
- `URI.escape` が Ruby 3.0 で削除済み → URL全体でなく url パラメータだけ `CGI.escape`。/site 側は元からエスケープ無しだったので同じ形に
- はてなの RSS / jsonlite API が http → https に
- ユーザーアイコンURL `www.hatena.com/users/{u先頭2文字}/{u}/profile.gif` が消滅 → `cdn.profile-image.st-hatena.com/users/{u}/profile.gif` に変更（2箇所）
- 不正カテゴリ時 `redirect to "/:entry_path"`（プレースホルダー文字列へのリダイレクト＝無限ループ）→ `/error` へ
- twitterbot.rb の APIキー平文直書き → ENV 参照に差し替え（bot自体は復活不能、ファイルは化石として保存）
- jQuery 読み込みがプロトコル相対 `//` → https 固定
- 楽天広告のサムネ画像が http（https配信だと混在コンテンツでブロックされる）→ https

動作確認: `/` `/it` `/about` `/error` 200、不正カテゴリ 302→/error、POST /post・/site 200。
はてブRSS・jsonlite API・アイコンCDN・soundjs CDN・楽天のまどマギサムネ、外部依存は全部生きていた。
