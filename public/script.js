let editingNoteId = null;

async function loadNotes() {
    try {
        const response = await fetch('/notes');

        if (!response.ok) {
            throw new Error('Error al cargar las notas');
        }

        const notes = await response.json();

        renderNotes(notes);

    } catch (error) {
        showFeedback(
            'Error',
            'No fue posible cargar las notas.',
            false
        );
    }
}

function renderNotes(notes) {
    const notesContainer = document.querySelector('#notes');

    notesContainer.innerHTML = '';

    if (notes.length === 0) {
        notesContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-journal-text display-1 text-secondary"></i>

                <h2 class="mt-4">
                    No hay notas todavía
                </h2>

                <p class="text-secondary fs-5">
                    Crea tu primera nota para comenzar.
                </p>
            </div>
        `;

        return;
    }

    notes.forEach(note => {
        const noteElement = document.createElement('div');

        noteElement.className = 'card mb-3';

        noteElement.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">
                    ${note.title}
                </h5>

                <p class="card-text">
                    ${note.content}
                </p>

                <button
                    class="btn btn-sm btn-warning edit-note"
                    data-id="${note.id}">
                    <i class="bi bi-pencil"></i>
                </button>

                <button
                    class="btn btn-sm btn-danger delete-note"
                    data-id="${note.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;

        notesContainer.appendChild(noteElement);
    });
}

const noteForm = document.querySelector('#noteForm');

noteForm.addEventListener('submit', createNote);

const newNoteButton =
    document.querySelector('[data-bs-target="#noteModal"]');

newNoteButton.addEventListener('click', () => {
    editingNoteId = null;

    noteForm.reset();

    noteForm.classList.remove('was-validated');

    document.querySelector('#title').setCustomValidity('');
    document.querySelector('#content').setCustomValidity('');

    document.querySelector('#noteModalLabel').textContent =
        'Nueva nota';
});

async function createNote(event) {
    event.preventDefault();

    const form = event.target;

    const titleInput = document.querySelector('#title');
    const contentInput = document.querySelector('#content');

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    titleInput.setCustomValidity('');
    contentInput.setCustomValidity('');

    if (!title) {
        titleInput.setCustomValidity(
            'El título es obligatorio'
        );
    }

    if (!content) {
        contentInput.setCustomValidity(
            'El contenido es obligatorio'
        );
    }

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    let response;

    if (editingNoteId === null) {
        response = await fetch('/notes', {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                title,
                content
            })
        });

    } else {
        response = await fetch(
            `/notes/${editingNoteId}`,
            {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    title,
                    content
                })
            }
        );
    }

    if (!response.ok) {
        showFeedback(
            'Error',
            'No fue posible guardar la nota.',
            false
        );

        return;
    }

    document.querySelector('#title').value = '';
    document.querySelector('#content').value = '';

    form.classList.remove('was-validated');

    const modalElement =
        document.querySelector('#noteModal');

    const modal =
        bootstrap.Modal.getInstance(modalElement);

    modal.hide();

    const wasEditing = editingNoteId !== null;

    editingNoteId = null;

    document.querySelector('#noteModalLabel').textContent =
        'Nueva nota';

    await loadNotes();

    if (wasEditing) {
        showFeedback(
            'Éxito',
            'Nota editada correctamente.'
        );
    } else {
        showFeedback(
            'Éxito',
            'Nota creada correctamente.'
        );
    }
}

document
    .querySelector('#notes')
    .addEventListener('click', event => {

        const editButton =
            event.target.closest('.edit-note');

        if (editButton) {
            const id = editButton.dataset.id;

            editNote(id);

            return;
        }

        const deleteButton =
            event.target.closest('.delete-note');

        if (deleteButton) {
            const id = deleteButton.dataset.id;

            deleteNote(id);
        }
    });

async function editNote(id) {
    const response =
        await fetch(`/notes/${id}`);

    if (!response.ok) {
        showFeedback(
            'Error',
            'No fue posible cargar la nota.',
            false
        );

        return;
    }

    const note = await response.json();

    editingNoteId = id;

    noteForm.classList.remove('was-validated');

    document
        .querySelector('#title')
        .setCustomValidity('');

    document
        .querySelector('#content')
        .setCustomValidity('');

    document.querySelector('#title').value =
        note.title;

    document.querySelector('#content').value =
        note.content;

    document.querySelector('#noteModalLabel').textContent =
        'Editar nota';

    const modalElement =
        document.querySelector('#noteModal');

    const modal =
        new bootstrap.Modal(modalElement);

    modal.show();
}

let noteToDeleteId = null;

function deleteNote(id) {
    noteToDeleteId = id;

    const modalElement =
        document.querySelector('#deleteModal');

    const modal =
        new bootstrap.Modal(modalElement);

    modal.show();
}

const confirmDelete =
    document.querySelector('#confirmDelete');

confirmDelete.addEventListener('click', async () => {
    const response =
        await fetch(`/notes/${noteToDeleteId}`, {
            method: 'DELETE'
        });

    if (!response.ok) {
        const deleteModalElement =
            document.querySelector('#deleteModal');

        const deleteModal =
            bootstrap.Modal.getInstance(
                deleteModalElement
            );

        deleteModal.hide();

        showFeedback(
            'Error',
            'No fue posible eliminar la nota.',
            false
        );

        return;
    }

    const deleteModalElement =
        document.querySelector('#deleteModal');

    const deleteModal =
        bootstrap.Modal.getInstance(
            deleteModalElement
        );

    deleteModal.hide();

    noteToDeleteId = null;

    await loadNotes();

    showFeedback(
        'Éxito',
        'Nota eliminada correctamente.'
    );
});

const deleteModal =
    document.querySelector('#deleteModal');

deleteModal.addEventListener(
    'hidden.bs.modal',
    () => {
        noteToDeleteId = null;
    }
);

function showFeedback(
    title,
    message,
    success = true
) {
    const feedbackTitle =
        document.querySelector('#feedbackTitle');

    const feedbackMessage =
        document.querySelector('#feedbackMessage');

    const feedbackIcon =
        document.querySelector('#feedbackIcon');

    feedbackTitle.textContent = title;
    feedbackMessage.textContent = message;

    if (success) {
        feedbackIcon.className =
            'bi bi-check-circle-fill text-success fs-1';
    } else {
        feedbackIcon.className =
            'bi bi-x-circle-fill text-danger fs-1';
    }

    const modalElement =
        document.querySelector('#feedbackModal');

    const modal =
        new bootstrap.Modal(modalElement);

    modal.show();
}

const themeToggle =
    document.querySelector('#themeToggle');

themeToggle.addEventListener('click', () => {
    const html =
        document.documentElement;

    const currentTheme =
        html.getAttribute('data-bs-theme');

    if (currentTheme === 'dark') {
        html.setAttribute(
            'data-bs-theme',
            'light'
        );

        themeToggle.innerHTML =
            '<i class="bi bi-moon-fill"></i>';

    } else {
        html.setAttribute(
            'data-bs-theme',
            'dark'
        );

        themeToggle.innerHTML =
            '<i class="bi bi-sun-fill"></i>';
    }
});

loadNotes();