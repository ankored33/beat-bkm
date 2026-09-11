# 近代化プラン（2026-09-11 時点）

前提：**現行サイトは無改変でクラシック版として残し（最終的に `/classic/`）、新版を裏で作り込んでから、ある時点でルートを差し替える。**
差し替えまで本番の `/` は今のまま。クラシック版は「10年前の俺の作品」として展示物扱い。

決定済み：
- 新版に広告は載せない（楽天 Kobo まどマギ、A8 ローテとも廃止。クラシックには残す）
- フェーズは「新版を先に作る → 最後に差し替え」
- ドメインは後で考える（プランに影響しない。OGP / About の URL だけ差し替え時に確定）

---

## 0. ゴールと非ゴール

**ゴール**
- 差し替え後、`/classic/` 以下で現行サイトが今と同じ見た目・同じ挙動で動く（コンソール芸・殴る・広告込み）
- `/` 以下が近代的な実装になる：jQuery/SoundJS 廃止、スマホ対応、ダークモード、テスト、CI、キャッシュ、広告なし
- 1 つの Render サービスで両方を配信（無料枠 1 枠のまま）
- 旧 URL（`/it`、`/site?url=...`）は新版でもそのまま動く
- 差し替えは config.ru の 1 コミットで完了し、戻すのも 1 コミット

**非ゴール**
- クラシック版のバグ修正・リファクタ（バグも展示物）
- Twitter bot の復活
- フレームワーク乗り換え（Ruby/Sinatra 続投。理由は 1-1）

---

## 1. 方針

### 1-1. バックエンドは Ruby / Sinatra 続投
- 全体 130 行のアプリに Next/Astro 等を持ち込むのは過剰。Sinatra 4 + Puma は現役で問題ない
- 1 プロセスで新旧を同居させるには同じ Rack スタックが一番楽
- 近代化の実体は「構造化・テスト・フロントエンド刷新・運用整備」であり、言語の問題ではない

### 1-2. 同居と差し替えの仕組み：Rack::URLMap + マウント位置非依存のクラシック

```ruby
# config.ru（開発中）
map "/next"    { run Modern::App }    # 裏で作り込む新版。noindex
map "/"        { run Classic::App }   # 本番は今のまま

# config.ru（差し替え後）
map "/classic" { run Classic::App }
map "/next"    { run Rack::Redirect → "/" }   # 一時的に残し、後で消す
map "/"        { run Modern::App }
```

差し替えを 1 コミットにするため、**クラシックはどのマウント位置でも動くようにしておく**。
必要な変更はハードコードされた絶対パスを `script_name` 由来に置き換えるだけで、ロジックには触れない：

- `layout.erb`：メニューの `href="/"`, `/social`… → `<%= url("/social") %>`（Sinatra の `url` は script_name を前置する）。`css.css` / `main.js` / `javascript.js` は相対パスなので `/classic`（末尾スラッシュ無し）で壊れる → 同じく `url("/css.css")` に
- `layout.erb` の `<head>` に `<script>window.BASE = "<%= request.script_name %>";</script>` を 1 行追加
- `main.js`：`/post`, `/site?url=`, `/error`, `/sound/...`×14 の先頭に `BASE +`
- `bkm.erb` / `error.erb`：`/about`, `/error` → `url(...)`
- `redirect to "/error"` は `to` が script_name を見るので無改変で OK
- 変更は 30 箇所前後、全部 URL 文字列のみ。**`/` にマウントされている限り出力 HTML は 1 バイトも変わらない**（`script_name` が空文字なので）。diff を記事素材として残す

現行ファイル一式は `git mv` で `classic/` に移す（履歴は追える）。移した時点で git tag `classic-2017` を打つ。

Render 無料枠にはプレビュー環境がないので、新版は本番の `/next/` で作り込む。スマホ実機で音を確認するにも都合がよい。`/next` は `X-Robots-Tag: noindex` を返す。

### 1-3. 新版の機能スコープ

| 機能 | クラシック | 新版 |
|---|---|---|
| ホットエントリ一覧（総合 + 8カテゴリ） | ○ | ○ |
| ブコメ一覧（一覧から遷移 / URL直接指定） | ○（Ajax で DOM 差し替え + /site） | ○（通常のページ遷移 `/entry?url=` に統一。`/site` は互換リダイレクト） |
| 殴る（効果音 + 吹っ飛びアニメ） | ○ | ○（Web Audio API / CSS アニメ。`prefers-reduced-motion` 対応） |
| コメント長で打撃音・悲鳴・ライバル死亡が変わる | ○ | ○（ロジックは移植。純関数にしてテスト） |
| コンソール芸（さやか / マミさんチャレンジ） | ○ | ×（クラシックに残す。新版のコンソールには「クラシックはこちら」の 1 行だけ） |
| 7色ランダム罫線 | ○ | ○（`.sample` 1 行） |
| 広告（楽天 Kobo まどマギ / A8） | ○ | **× 廃止** |
| ツイートボタン | ○（旧ドメイン指定） | Web Share API + X 共有リンク |
| はてブボタン | ○ | ○ |
| スマホ対応 | ×（本人談） | ○ |
| ダークモード | × | ○ |
| About / 履歴 | ○ | ○（「2026 復旧」「2026 近代化」「クラシック版はこちら」を追記） |

---

## 2. 新版の設計

### 2-1. ディレクトリ（最終形）

```
.
├── config.ru                 # URLMap で classic と modern を束ねる
├── Gemfile
├── app/
│   ├── app.rb                # Modern::App（ルーティングのみ）
│   ├── hatena/
│   │   ├── client.rb         # HTTP（タイムアウト・UA・エラー型）
│   │   ├── hotentry.rb       # RSS → Entry 配列（現在 3 箇所コピペの解析を 1 つに）
│   │   └── bookmarks.rb      # jsonlite → Bookmark 配列
│   ├── cache.rb              # TTL 付きメモリキャッシュ
│   └── views/                # layout / index / entry / about / error / not_found
├── public/
│   ├── app.css               # カスタムプロパティ、グリッド、ダーク対応
│   ├── app.js                # ES modules、jQuery 無し
│   ├── beat.js               # 殴る（音・アニメ・判定）
│   └── sound/                # クラシックとは別に複製（独立性優先）
├── classic/                  # 凍結（現行ファイルをそのまま移動）
│   ├── main.rb  views/  public/  twitterbot.rb
├── test/
│   ├── hatena/*_test.rb      # 固定 RSS / JSON フィクスチャで解析をテスト
│   ├── app_test.rb           # rack-test：全ルート 200 / 不正カテゴリ 404 / 取得失敗時の表示
│   └── classic_test.rb       # クラシックを "/" と "/classic" 両方にマウントして主要ルートが 200
├── .github/workflows/ci.yml  # test + rubocop
└── render.yaml
```

### 2-2. ルーティング（新版）

| Method | Path | 内容 |
|---|---|---|
| GET | `/` | 総合ホットエントリ |
| GET | `/:category` | 8 カテゴリ。不正なら 404 ページ（クラシックの 302→/error はやめる） |
| GET | `/entry?url=` | ブコメ一覧（サーバ描画） |
| GET | `/site?url=` | `/entry` へ 301（旧 URL 互換） |
| GET | `/api/bookmarks?url=` | JSON（フロントの再読込・将来用）。旧 `POST /post` は廃止 |
| GET | `/about` | About（クラシックへのリンク付き） |
| GET | `/healthz` | UptimeRobot 用。はてなを叩かず 200 |

### 2-3. バックエンドの改善点
- はてなへのアクセスに **タイムアウト**（open 5s / read 20s）。jsonlite が 504 のときは `/error` に飛ばさず、エントリページ内に「取得できませんでした（はてな側で時間切れ）」を表示
- **キャッシュ**：無料枠 1 インスタンスなのでメモリ内 TTL で十分。RSS 5 分、jsonlite 10 分
- User-Agent は素直に `beat-bkm/2.0 (+<about の URL>)`。Opera 11 偽装はクラシックに残す
- HTML エスケープは ERB 側で `h` に統一（クラシックの `/site` は `CGI.escapeHTML` → `h` の二重エスケープ）
- 例外はまとめて 500 ページ + ログ。`error do` ブロック 1 つ

### 2-4. フロントエンドの改善点
- jQuery 1.11 / SoundJS 0.6 / Google CDN を廃止。依存ゼロの ES modules
- 音：`AudioContext` + `decodeAudioData` で 14 ファイルを事前ロード。「殴る」チェック ON のタイミングで unlock（iOS 対策。クラシックがスマホで鳴らなかった原因はおそらくここ）
- アニメ：`transform` + `transition`、`@media (prefers-reduced-motion)` で無効化
- レイアウト：CSS Grid、カードは `minmax(280px, 1fr)`、12px 固定をやめ 15〜16px 基準
- ダークモード：`prefers-color-scheme` + 手動トグル（localStorage）
- OGP / `theme-color` / favicon の SVG 化（URL はドメイン確定後に差し込む）
- コンソールには「クラシック版（コンソール芸つき）→ /classic/」の 1 行だけ

### 2-5. 運用
- `render.yaml`：`healthCheckPath: /healthz`
- GitHub Actions：push ごとに test + rubocop。Dependabot で bundler 更新
- UptimeRobot の ping 先を `/healthz` に（現状トップを叩いているなら、はてな RSS も 5 分ごとに叩いている）
- `WORKLOG.md` に近代化の作業ログを追記し続ける（記事素材）

---

## 3. 作業フェーズ

### Phase 1：土台（半日）— 本番の見た目は変わらない
1. `git tag classic-2017 HEAD`
2. `git mv` で `main.rb` `views/` `public/` `twitterbot.rb` を `classic/` へ。`config.ru` を URLMap 化（`/` → Classic のまま）
3. クラシックのパスを script_name 由来に（1-2）。`/` マウントでは出力が変わらないことを curl で diff 確認
4. `test/classic_test.rb`：`/` と `/classic` 両マウントで主要ルート 200
5. `app/` の空の Modern::App を `/next` にマウント（`/next/healthz` だけ 200）
6. デプロイ。本番 `/` は無変化、`/next/healthz` が 200

### Phase 2：新版バックエンド（1 日）— `/next/` で動く
1. `app/hatena/*` を実装、フィクスチャ付きテスト
2. ルート実装（2-2）。`/site` 互換リダイレクト、404、エラー表示
3. キャッシュとタイムアウト
4. ビューは素の HTML で機能パリティを確認（見た目は次フェーズ）
5. デプロイ。`/next/`, `/next/it`, `/next/entry?url=` を確認

### Phase 3：新版フロントエンド（1〜2 日）— `/next/` で完成形に
1. `app.css`（トークン・グリッド・ダーク）
2. `beat.js`（Web Audio・アニメ・判定移植）。判定は純関数で単体テスト
3. 一覧・エントリページの調整、スマホ実機確認（iOS Safari で音が鳴るか）
4. About、OGP（URL は仮）、favicon
5. デプロイ。しばらく `/next/` を自分で使って様子を見る

### Phase 4：差し替え（1 コミット + 半日）
1. `config.ru`：`/` → Modern、`/classic` → Classic、`/next` → `/` へリダイレクト
2. デプロイ。`/`, `/it`, `/site?url=`（301）、`/classic/`, `/classic/it`, `/classic/site?url=`、コンソール芸、広告、を確認
3. 問題があれば config.ru を戻すだけ
4. 数日後に `/next` のリダイレクトを削除

### Phase 5：仕上げ（半日）
1. GitHub Actions、Dependabot
2. UptimeRobot の向き先を `/healthz` に
3. ドメインを決めたら OGP / About / UA の URL を差し替え
4. `WORKLOG.md` / `REVIVAL_PLAN.md` の素材更新、`ARTICLE_DRAFT.md` に近代化パートの見出し
5. README 新設（クラシック版と新版の説明、ローカル起動手順）

---

## 4. 残る確認事項（着手を止めるものではない）
- 効果音の権利：効果音ラボ / Wingless Seraph の素材を新版でも使う。無料・商用可のはずだが About のクレジットは維持
- 旧 `POST /post` を廃止する（外部から叩いている人はいない前提）
- 差し替えのタイミングは Phase 3 完了後にユーザー判断

---

## 5. 記事素材になりそうな点（先回りメモ）
- 「凍結 diff の中身が URL 文字列 30 箇所だけ。しかも `/` にある間は出力が 1 バイトも変わらない」
- クラシックがスマホで音が鳴らなかった理由が、10 年後に AudioContext の unlock 問題だと判明する（予想。Phase 3 で検証）
- クラシックの `/site` は二重エスケープで `&` が `&amp;` のまま表示されている。Ajax 経由では一重なので、URL 直接指定したときだけ壊れる（要確認）
- 新版のコンソールに書く 1 行をどうするか
