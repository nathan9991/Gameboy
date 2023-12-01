class Task < ApplicationRecord
    # Validations
    validates :title, presence: true
    
    # Instance method to mark the task as complete
    def mark_complete!
      update(complete: true)
    end
  
    # Class method to return all completed tasks
    def self.completed
      where(complete: true)
    end
    def self.uncompleted
        where(complete: false)
    end
    attribute :private, :boolean, default: false
end
  