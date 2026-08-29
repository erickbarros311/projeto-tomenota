(function () {
  'use strict';

  const STORAGE_KEY = 'tome-nota-anotacoes';
  const NOTES_PER_PAGE = 6;

  const elements = {
    btnNovaAnotacao: document.getElementById('btnNovaAnotacao'),
    searchInput: document.getElementById('searchInput'),
    notesList: document.getElementById('notesList'),
    notesEmpty: document.getElementById('notesEmpty'),
    pagination: document.getElementById('pagination'),
    paginationInfo: document.getElementById('paginationInfo'),
    btnPaginaAnterior: document.getElementById('btnPaginaAnterior'),
    btnPaginaProxima: document.getElementById('btnPaginaProxima'),
    noteDialog: document.getElementById('noteDialog'),
    noteForm: document.getElementById('noteForm'),
    dialogTitle: document.getElementById('dialogTitle'),
    noteTitle: document.getElementById('noteTitle'),
    noteDescription: document.getElementById('noteDescription'),
    btnFecharDialog: document.getElementById('btnFecharDialog'),
    btnCancelar: document.getElementById('btnCancelar'),
    confirmDialog: document.getElementById('confirmDialog'),
    btnFecharConfirm: document.getElementById('btnFecharConfirm'),
    btnCancelarExclusao: document.getElementById('btnCancelarExclusao'),
    btnConfirmarExclusao: document.getElementById('btnConfirmarExclusao'),
  };

  let notes = loadNotes();
  let editingNoteId = null;
  let deletingNoteId = null;
  let currentPage = 1;
  let searchQuery = '';

  function loadNotes() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function saveNotes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function normalizeText(text) {
    return text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  }

  function getFilteredNotes() {
    const query = normalizeText(searchQuery.trim());

    return notes
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .filter(function (note) {
        if (!query) return true;
        return (
          normalizeText(note.title).includes(query) ||
          normalizeText(note.description).includes(query)
        );
      });
  }

  function getTotalPages(totalNotes) {
    return Math.max(1, Math.ceil(totalNotes / NOTES_PER_PAGE));
  }

  function updatePagination(totalNotes) {
    const totalPages = getTotalPages(totalNotes);

    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    if (totalNotes === 0) {
      elements.pagination.hidden = true;
      return;
    }

    const start = (currentPage - 1) * NOTES_PER_PAGE + 1;
    const end = Math.min(currentPage * NOTES_PER_PAGE, totalNotes);

    elements.pagination.hidden = false;
    elements.paginationInfo.textContent =
      'Exibindo ' + start + '–' + end + ' de ' + totalNotes + ' · Página ' + currentPage + ' de ' + totalPages;
    elements.btnPaginaAnterior.disabled = currentPage <= 1;
    elements.btnPaginaProxima.disabled = currentPage >= totalPages;
  }

  function renderNotes() {
    const filteredNotes = getFilteredNotes();
    const totalNotes = filteredNotes.length;
    const totalPages = getTotalPages(totalNotes);
    const pageNotes = filteredNotes.slice(
      (currentPage - 1) * NOTES_PER_PAGE,
      currentPage * NOTES_PER_PAGE
    );

    elements.notesList.innerHTML = '';

    const showEmptyState = totalNotes === 0;
    elements.notesEmpty.classList.toggle('hidden', !showEmptyState);
    elements.notesList.classList.toggle('hidden', showEmptyState);

    if (showEmptyState) {
      const hasNotes = notes.length > 0;
      elements.notesEmpty.querySelector('p').textContent =
        hasNotes ? 'Nenhuma anotação encontrada.' : 'Nenhuma anotação ainda.';
      elements.notesEmpty.querySelector('.notes-empty__hint').hidden = hasNotes;
      updatePagination(0);
      return;
    }

    pageNotes.forEach(function (note) {
      const li = document.createElement('li');
      li.className = 'note-card';
      li.dataset.id = note.id;

      li.innerHTML =
        '<div class="note-card__body">' +
          '<h3 class="note-card__title">' + escapeHtml(note.title) + '</h3>' +
          '<p class="note-card__description">' + escapeHtml(note.description) + '</p>' +
        '</div>' +
        '<div class="note-card__footer">' +
          '<button type="button" class="btn btn--outline" data-action="edit">Editar</button>' +
          '<button type="button" class="btn btn--outline btn--outline-danger" data-action="delete">Excluir</button>' +
        '</div>';

      elements.notesList.appendChild(li);
    });

    updatePagination(totalNotes);

    if (currentPage > totalPages) {
      currentPage = totalPages;
      renderNotes();
    }
  }

  function openNoteDialog(note) {
    editingNoteId = note ? note.id : null;
    elements.dialogTitle.textContent = note ? 'Editar anotação' : 'Nova anotação';
    elements.noteTitle.value = note ? note.title : '';
    elements.noteDescription.value = note ? note.description : '';
    elements.noteDialog.showModal();
    elements.noteTitle.focus();
  }

  function closeNoteDialog() {
    elements.noteDialog.close();
    editingNoteId = null;
    elements.noteForm.reset();
  }

  function openConfirmDialog(noteId) {
    deletingNoteId = noteId;
    elements.confirmDialog.showModal();
  }

  function closeConfirmDialog() {
    elements.confirmDialog.close();
    deletingNoteId = null;
  }

  function handleNoteSubmit(event) {
    event.preventDefault();

    const title = elements.noteTitle.value.trim();
    const description = elements.noteDescription.value.trim();

    if (!title) {
      elements.noteTitle.focus();
      return;
    }

    if (editingNoteId) {
      const note = notes.find(function (n) { return n.id === editingNoteId; });
      if (note) {
        note.title = title;
        note.description = description;
        note.updatedAt = new Date().toISOString();
      }
    } else {
      notes.push({
        id: generateId(),
        title: title,
        description: description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      currentPage = 1;
    }

    saveNotes();
    renderNotes();
    closeNoteDialog();
  }

  function deleteNote(noteId) {
    notes = notes.filter(function (n) { return n.id !== noteId; });
    saveNotes();

    const filteredCount = getFilteredNotes().length;
    const totalPages = getTotalPages(filteredCount);
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    renderNotes();
    closeConfirmDialog();
  }

  elements.btnNovaAnotacao.addEventListener('click', function () {
    openNoteDialog(null);
  });

  elements.searchInput.addEventListener('input', function () {
    searchQuery = elements.searchInput.value;
    currentPage = 1;
    renderNotes();
  });

  elements.btnPaginaAnterior.addEventListener('click', function () {
    if (currentPage > 1) {
      currentPage -= 1;
      renderNotes();
    }
  });

  elements.btnPaginaProxima.addEventListener('click', function () {
    const totalPages = getTotalPages(getFilteredNotes().length);
    if (currentPage < totalPages) {
      currentPage += 1;
      renderNotes();
    }
  });

  elements.btnFecharDialog.addEventListener('click', closeNoteDialog);
  elements.btnCancelar.addEventListener('click', closeNoteDialog);

  elements.noteForm.addEventListener('submit', handleNoteSubmit);

  elements.notesList.addEventListener('click', function (event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const card = button.closest('.note-card');
    const noteId = card.dataset.id;
    const action = button.dataset.action;

    if (action === 'edit') {
      const note = notes.find(function (n) { return n.id === noteId; });
      if (note) openNoteDialog(note);
    } else if (action === 'delete') {
      openConfirmDialog(noteId);
    }
  });

  elements.btnFecharConfirm.addEventListener('click', closeConfirmDialog);
  elements.btnCancelarExclusao.addEventListener('click', closeConfirmDialog);

  elements.btnConfirmarExclusao.addEventListener('click', function () {
    if (deletingNoteId) {
      deleteNote(deletingNoteId);
    }
  });

  renderNotes();
})();
