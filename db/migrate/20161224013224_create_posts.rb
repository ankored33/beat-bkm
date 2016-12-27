class CreatePosts < ActiveRecord::Migration[5.0]
  def change
      create_table :posts do |t| #=> この引数名がテーブル名になる
      t.text :user
      t.text :comment
      t.integer :spower, :default => 0
      t.text :URL
      t.text :title
      t.integer :bookmark, :default => 0
      t.integer :run, :default => 0
      t.timestamps  #=> この一行でcreated_atとupdated_atのカラムが定義される
    end
  end
end
