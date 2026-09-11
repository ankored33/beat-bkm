# 新旧同居の構成。差し替え時はマウント先を入れ替えるだけ（MODERNIZATION_PLAN.md 1-2）。
#   開発中   : "/" → クラシック、"/next" → 新版
#   差し替え後: "/" → 新版、    "/classic" → クラシック
require "./classic/main"
require "./app/app"

map "/next" do
  run Modern::App
end

map "/" do
  run Sinatra::Application
end
