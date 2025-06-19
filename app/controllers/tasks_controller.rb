class TasksController < ApplicationController
  before_action :set_task, only: [:show, :edit, :update, :destroy, :complete]

  # GET /tasks or /tasks.json
  def index
    @tasks = Task.where(complete: false)
    @tasks = @tasks.where(private: false) unless params[:show_private] == "true"
  end
  

  # GET /tasks/1 or /tasks/1.json
  def show
  end

  # GET /tasks/new
  # app/controllers/tasks_controller.rb
  def new
    @task = Task.new
    if request.xhr?
      render partial: 'form', locals: { task: @task }
    else
      head :forbidden  # or you could render a 404 page, or redirect to the index action
    end
  end

  
  # GET /tasks/1/edit
  def edit
  end


  # PATCH/PUT /tasks/1 or /tasks/1.json
  def update
    respond_to do |format|
      if @task.update(task_params)
        format.html { redirect_to task_url(@task), notice: "Task was successfully updated." }
        format.json { render :show, status: :ok, location: @task }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @task.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /tasks/1 or /tasks/1.json
  def destroy
    @task.destroy!

    respond_to do |format|
      format.html { redirect_to tasks_url, notice: "Task was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  def complete
    if @task.update(complete: true)
      render json: { success: true }
    else
      render json: { success: false }, status: :unprocessable_entity
    end
  end
  
  def create
    @task = Task.new(task_params)
    @task.complete = false  # Set default value for 'complete'
  
    if @task.save
      # If saved successfully, send back a JSON response with a redirect path
      render json: { status: 'success', redirect: tasks_url }
    else
      # If save fails, send back error information
      render json: { status: 'error', errors: @task.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  private
  
  def set_task
    @task = Task.find(params[:id])
  end
  private

  def task_params
    # Only allow the permitted attributes from the form
    params.require(:task).permit(:title, :private) # permits :title and :private
  end
end