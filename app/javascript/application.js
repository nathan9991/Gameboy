import "@hotwired/turbo-rails"
import "controllers"
let taskListHTML = '';

function animateTitle(title, scrollDistance, scrollTime) {
    return new Promise((resolve) => {
        const keyframes = [{ transform: 'translateX(0)' }, { transform: `translateX(-${scrollDistance}px)` }];
        const timingOptions = { duration: scrollTime * 1000, easing: 'linear', fill: 'forwards' };
        const animation = title.animate(keyframes, timingOptions);
        animation.onfinish = () => {
            title.style.transform = 'translateX(0)';
            resolve();
        };
    });
}

function startAnimations() {
    const animations = [];
    const scrollSpeed = 50;
    const endDelayTime = 500;
    document.querySelectorAll('.task-title').forEach(title => {
        const titleWidth = title.offsetWidth;
        const containerWidth = title.closest('.task-title-container').offsetWidth;
        if (titleWidth > containerWidth) {
            const scrollDistance = titleWidth - containerWidth;
            const scrollTime = scrollDistance / scrollSpeed;
            animations.push(animateTitle(title, scrollDistance, scrollTime));
        }
    });

    Promise.all(animations).then(() => {
        setTimeout(startAnimations, endDelayTime);
    });
}

function bindCheckboxes() {
    const taskList = document.querySelector('.screen');
    
    // Remove any previous event listeners to avoid duplicate handlers
    taskList.removeEventListener('click', delegatedCheckboxClickHandler);
  
    // Add a single event listener to the parent `.screen` div
    taskList.addEventListener('click', delegatedCheckboxClickHandler);
  }
  
  function delegatedCheckboxClickHandler(e) {
    // Check if the clicked element is a checkbox or part of it
    if (e.target.matches('.custom-checkbox') || e.target.closest('.custom-checkbox')) {
      const checkbox = e.target.matches('.custom-checkbox') ? e.target : e.target.closest('.custom-checkbox');
      const url = checkbox.getAttribute('data-check-url');
      
      fetch(url, {
        method: 'PUT',
        headers: {
          'X-CSRF-Token': document.querySelector("[name='csrf-token']").content,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ complete: true }),
      })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        if (data.success) {
          checkbox.classList.add('checked');
          checkbox.parentElement.remove();
        }
      })
      .catch((error) => {
        console.error('There has been a problem with your fetch operation:', error);
      });
    }
  }
  

function checkboxClickHandler(e) {
    const checkbox = e.target;
    const url = checkbox.getAttribute('data-check-url');
    fetch(url, {
        method: 'PUT',
        headers: {
            'X-CSRF-Token': document.querySelector("[name='csrf-token']").content,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ complete: true }),
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        if (data.success) {
            checkbox.classList.add('checked');
            checkbox.parentElement.remove();
        }
    })
    .catch((error) => {
        console.error('There has been a problem with your fetch operation:', error);
    });
}
function bindCancelButton() {
    const cancelButton = document.querySelector('#cancel-button');
    const newTaskButton = document.querySelector('.new-task-link');
    const saveNewTaskButton = document.querySelector('#externalSaveButton');
    const CancelNewTaskButton = document.querySelector('#externalCancelButton');
    const taskList = document.querySelector('.screen');
  
    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        // Clear the form fields if necessary
        taskList.innerHTML = taskListHTML;
  
        // Show the 'O' button and task items
        newTaskButton.style.display = 'block';
        saveNewTaskButton.style.display = 'none';
        CancelNewTaskButton.style.display = 'none';
        
  
        // Remove the form from the screen
        bindCheckboxes();
      });
    }
  }
  
function toggleBatteryIndicatorBlinking() {
  var checkbox = document.getElementById('task_private');
  var batteryIndicator = document.querySelector('.battery-indicator');

  if (checkbox) {
      checkbox.addEventListener('change', function() {
          if (this.checked) {
              batteryIndicator.classList.add('blink');
          } else {
              batteryIndicator.classList.remove('blink');
          }
      });
  }
}

function bindNewTaskButton() {
    const newTaskButton = document.querySelector('.new-task-link');
    const save_new_task = document.querySelector('#externalSaveButton');
    const CancelNewTaskButton = document.querySelector('#externalCancelButton');
    const taskList = document.querySelector('.screen');
    const taskItems = document.querySelectorAll('.task-item');

    if (newTaskButton) {
      newTaskButton.addEventListener('click', (event) => {
        event.preventDefault();
        taskListHTML = taskList.innerHTML;
  
        // Hide the button and current tasks
        newTaskButton.style.display = 'none';
        save_new_task.style.display = 'block';
        CancelNewTaskButton.style.display = 'block';
        taskItems.forEach(taskItem => taskItem.style.display = 'none');
  
        // Fetch and display new task form
        fetch(newTaskButton.getAttribute('href'), {
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(response => response.text())
        .then(html => {
          taskList.innerHTML = html;
          document.querySelector('#task_title').focus(); // Focus on the task title input
          bindFormSubmission();
          toggleBatteryIndicatorBlinking();
          bindCancelButton();
        })
        .catch(error => console.error('Error fetching form:', error));
        history.pushState({}, '', '/tasks');
      });
    }
  }
  



function bindFormSubmission() {
    const form = document.querySelector('#new_task');
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            const path = form.getAttribute('action');
            fetch(path, {
              method: 'POST',
              body: formData,
              headers: {
                'X-CSRF-Token': document.querySelector("[name='csrf-token']").content,
                'Accept': 'application/json',
                // Don't set 'Content-Type': 'application/json' because we're sending FormData
              },
            })
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                if (data.redirect) {
                    window.location.href = data.redirect;
                } else {
                    console.error('Validation errors', data);
                }
            })
            .catch(error => {
                console.error('Error submitting form:', error);
            });
        });
    }
}
document.addEventListener('keydown', function(event) {
    // You may need to check for different key values depending on the browser and operating system
    if (event.key === '*' || event.key === '=') { // The '+' is usually with the '=' key without shift being pressed
        event.preventDefault(); // Prevent any default behavior
        const newTaskButton = document.querySelector('#new-task-button');
        if (newTaskButton && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        // Only trigger if we're not currently in a text input or textarea to prevent accidental triggers
        newTaskButton.click();
        }
    }
});

function bindExternalButtons() {
  const saveButton = document.getElementById('externalSaveButton');
  const cancelButton = document.getElementById('externalCancelButton');

  // Unbind previous click events to prevent multiple bindings
  saveButton.removeEventListener('click', externalSaveClickHandler);
  cancelButton.removeEventListener('click', externalCancelClickHandler);

  // Re-bind the click events to the external buttons
  saveButton.addEventListener('click', externalSaveClickHandler);
  cancelButton.addEventListener('click', externalCancelClickHandler);
}

function externalSaveClickHandler() {
  document.getElementById('my-submit-button').click();
}

function externalCancelClickHandler() {
  document.getElementById('cancel-button').click();
}

  
document.addEventListener("turbo:load", () => {
    startAnimations();
    bindCheckboxes();
    bindNewTaskButton();
    bindFormSubmission();
    bindExternalButtons();
});
