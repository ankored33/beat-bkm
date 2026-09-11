# frozen_string_literal: true

require "sinatra/base"

module Modern
  class App < Sinatra::Base
    set :root, File.expand_path(__dir__)
    set :views, File.join(root, "views")
    set :public_folder, File.join(root, "..", "public")

    # /next で作り込んでいる間は検索避け
    before do
      headers "X-Robots-Tag" => "noindex" if request.script_name == "/next"
    end

    get "/healthz" do
      content_type :text
      "ok"
    end

    get "/" do
      content_type :text
      "modern: coming soon"
    end
  end
end
