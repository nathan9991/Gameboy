class AddPrivateToTasks < ActiveRecord::Migration[7.1]
  def change
    add_column :tasks, :private, :boolean
  end
end
