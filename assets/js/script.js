const $addBtn = $('#add-task');
const $toDoOutput = $('.to-do');
const $inProgressOutput = $('.in-progress');
const $doneOutput = $('.done');

function generateRandomNumber() {
    const min = Math.pow(10, 14); // Minimum 15-digit number
    const max = Math.pow(10, 15) - 1; // Maximum 15-digit number
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getTaskData() {
    const rawTaskData = localStorage.getItem('tasks');
    const tasks = JSON.parse(rawTaskData) || []

    return tasks;
}

function setupDragging() {
    $('.card-body').droppable({
        accept: 'article',
        drop: handleTaskDrop
    });


    $('article').draggable({
        opacity: .8,
        zIndex: 100,
        helper: function (eventObj) {
            const el = $(eventObj.target);
            let clone;

            if (el.is('article')) {
                clone = el.clone();
            } else {
                clone = el.closest('article').clone();
            }

            return clone.css({
                width: el.outerWidth(),
                height: el.outerHeight()
            });
        }

    });
}

function outputTasks() {
    const tasks = getTaskData();

    $toDoOutput.empty();
    $inProgressOutput.empty();
    $doneOutput.empty();

    tasks.forEach(function (taskObj) {
        const $taskEl = $(`
            <article data-id="${taskObj.id}" class="task-card p-2 border border-2 m-2 bg-white}">
              <h5>${taskObj.title}</h5>
              <p>${taskObj.description}</p>
              <p>${taskObj.duedate}</p>
              <button class="btn bg-danger text-white">delete</button>
            </article>
        `);

        const duedate = dayjs(taskObj.duedate);
        const currentDate = dayjs();

        if (duedate.isSame(currentDate, 'day')) {
            $taskEl.addClass('alert');
        }

        if (duedate.isBefore(currentDate, 'day')) {
            $taskEl.addClass('past-due');
        }


        // !!!I know something has to be done about the fact there is also a inprogress column
        if (taskObj.done) {
            $doneOutput.append($taskEl);
            $taskEl.addClass('done');
        } else if (taskObj.inProgress) {
            $inProgressOutput.append($taskEl);
            $taskEl.removeClass('done');
        } else {
            $toDoOutput.append($taskEl);
            $taskEl.removeClass('done');
        }

    })

    setupDragging();
}

function addTask() {
    //grab input elements 

    const $titleInput = $('#title-input');
    const $descriptionInput = $('#description-input');
    const $dueDateInput = $('#due-date-input');

    // generate a random id for task

    const id = generateRandomNumber();

    //create an object with the input values

    const task = {
        id: id,
        title: $titleInput.val(),
        description: $descriptionInput.val(),
        duedate: $dueDateInput.val(),
        done: false
    };

    //get the old local storage of tasks or a new array

    const tasks = getTaskData();

    //push the object to the array of tasks

    tasks.push(task);

    // save/replace the old array in localStorage with the newly updated array

    localStorage.setItem('tasks', JSON.stringify(tasks));

    $titleInput.val('');
    $descriptionInput.val('');
    $dueDateInput.val('');

    $('#formModal').modal('hide');

    outputTasks();
}

function handleTaskDrop(eventObj, ui) {
    const box = $(eventObj.target);
    const article = $(ui.draggable[0]);
    const taskId = article.data('id');

    const tasks = getTaskData();

    const task = tasks.find(taskObj => taskObj.id === taskId);

    if (box.hasClass('done')) {
        task.done = true;
        task.inProgress = false;
        article.addClass('done').removeClass('in-progress');
    } else if (box.hasClass('in-progress')) {
        task.done = false;
        task.inProgress = true;
        article.addClass('in-progress').removeClass('done');
    } else {
        task.done = false;
        task.inProgress = false;
        article.removeClass('done in-progress');
    }

    localStorage.setItem('tasks', JSON.stringify(tasks));

    box.append(article);
}


function deleteTask(eventObj) {
    const btn = $(eventObj.target);
    const taskId = btn.parent('article').data('id');

    const tasks = getTaskData();

    const filtered = tasks.filter(function (taskObj) {
        if (taskObj.id !== taskId) return true;
    });

    localStorage.setItem('tasks', JSON.stringify(filtered));

    btn.parent('article').remove();

}

function init() {
    $('#due-date-input').datepicker({
        minDate: 0
    });

    outputTasks();

    $('main').on('click', 'button.bg-danger', deleteTask);

    $addBtn.on('click', addTask);
}

init();
