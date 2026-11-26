const API_BASE = '/api/students';

// DOM Elements
const studentForm = document.getElementById('studentForm');
const studentIdInput = document.getElementById('studentId');
const nameInput = document.getElementById('name');
const enrollmentInput = document.getElementById('enrollmentNumber');
const emailInput = document.getElementById('email');
const branchInput = document.getElementById('branch');
const semesterInput = document.getElementById('semester');
const sectionInput = document.getElementById('section');

const formHeading = document.getElementById('formHeading');
const formModeBadge = document.getElementById('formModeBadge');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const resetBtn = document.getElementById('resetBtn');

const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const totalStudentsCount = document.getElementById('totalStudentsCount');
const recordsSubtitle = document.getElementById('recordsSubtitle');
const studentsTableBody = document.getElementById('studentsTableBody');
const tableWrapper = document.getElementById('tableWrapper');
const emptyState = document.getElementById('emptyState');
const loadingState = document.getElementById('loadingState');

const alertBox = document.getElementById('alertBox');
const alertMessage = document.getElementById('alertMessage');
const closeAlertBtn = document.getElementById('closeAlertBtn');

const deleteModal = document.getElementById('deleteModal');
const deleteModalText = document.getElementById('deleteModalText');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

let alertTimer = null;
let searchDebounceTimer = null;
let pendingDeleteId = null;
let currentStudents = [];

// Show success or error banner
function showAlert(message, type = 'success') {
  if (alertTimer) {
    clearTimeout(alertTimer);
  }

  alertBox.className = `alert ${type === 'error' ? 'alert-error' : 'alert-success'}`;
  alertMessage.textContent = message;

  alertTimer = setTimeout(() => {
    hideAlert();
  }, 5000);
}

function hideAlert() {
  alertBox.classList.add('hidden');
}

closeAlertBtn.addEventListener('click', hideAlert);

// Escape HTML to prevent XSS
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Client-side validation before sending API request
function validateFormData(payload) {
  if (!payload.name || payload.name.length < 2) {
    return 'Student name must be at least 2 characters long.';
  }

  if (!payload.enrollmentNumber || !/^[A-Z0-9-]{3,30}$/.test(payload.enrollmentNumber)) {
    return 'Enrollment number must be 3-30 characters (letters, numbers, or hyphens only).';
  }

  if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return 'Please enter a valid email address.';
  }

  if (!payload.branch) {
    return 'Please select a branch.';
  }

  const sem = Number(payload.semester);
  if (!Number.isInteger(sem) || sem < 1 || sem > 8) {
    return 'Please select a valid semester (1 to 8).';
  }

  if (!payload.section) {
    return 'Please select a section.';
  }

  return null;
}

// Fetch students from backend API
async function fetchStudents(searchQuery = '') {
  loadingState.classList.remove('hidden');
  tableWrapper.classList.add('hidden');
  emptyState.classList.add('hidden');

  try {
    const query = searchQuery.trim();
    const url = query ? `${API_BASE}?search=${encodeURIComponent(query)}` : API_BASE;
    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to load student records.');
    }

    currentStudents = result.data || [];
    totalStudentsCount.textContent = result.totalCount ?? currentStudents.length;

    if (query) {
      recordsSubtitle.textContent = `Showing ${currentStudents.length} matching result(s) out of ${result.totalCount} total`;
    } else {
      recordsSubtitle.textContent = `Showing ${currentStudents.length} student(s)`;
    }

    renderStudentsTable(currentStudents);
  } catch (error) {
    showAlert(error.message || 'Unable to connect to the server.', 'error');
    emptyState.classList.remove('hidden');
  } finally {
    loadingState.classList.add('hidden');
  }
}

// Render student rows in the table
function renderStudentsTable(students) {
  studentsTableBody.innerHTML = '';

  if (!students.length) {
    tableWrapper.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  tableWrapper.classList.remove('hidden');

  const rowsHtml = students
    .map(
      (student) => `
      <tr>
        <td><span class="enrollment-chip">${escapeHtml(student.enrollmentNumber)}</span></td>
        <td><strong>${escapeHtml(student.name)}</strong></td>
        <td>${escapeHtml(student.email)}</td>
        <td><span class="branch-tag">${escapeHtml(student.branch)}</span></td>
        <td>Sem ${escapeHtml(student.semester)}</td>
        <td>${escapeHtml(student.section)}</td>
        <td class="actions-col">
          <div class="row-actions">
            <button
              type="button"
              class="btn btn-sm btn-edit"
              data-action="edit"
              data-id="${escapeHtml(student._id)}"
            >
              Edit
            </button>
            <button
              type="button"
              class="btn btn-sm btn-delete"
              data-action="delete"
              data-id="${escapeHtml(student._id)}"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    `
    )
    .join('');

  studentsTableBody.innerHTML = rowsHtml;
}

// Reset form back to Add mode
function resetFormToCreateMode() {
  studentForm.reset();
  studentIdInput.value = '';
  formHeading.textContent = 'Add New Student';
  formModeBadge.textContent = 'Create Mode';
  formModeBadge.className = 'badge badge-blue';
  submitBtn.textContent = 'Add Student';
  cancelEditBtn.classList.add('hidden');
}

// Populate form for editing an existing student
function startEditStudent(student) {
  studentIdInput.value = student._id;
  nameInput.value = student.name;
  enrollmentInput.value = student.enrollmentNumber;
  emailInput.value = student.email;
  branchInput.value = student.branch;
  semesterInput.value = String(student.semester);
  sectionInput.value = student.section;

  formHeading.textContent = 'Edit Student';
  formModeBadge.textContent = 'Edit Mode';
  formModeBadge.className = 'badge badge-amber';
  submitBtn.textContent = 'Update Student';
  cancelEditBtn.classList.remove('hidden');

  nameInput.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Handle Add / Update form submit
studentForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    name: nameInput.value.trim(),
    enrollmentNumber: enrollmentInput.value.trim().toUpperCase(),
    email: emailInput.value.trim().toLowerCase(),
    branch: branchInput.value.trim(),
    semester: semesterInput.value ? Number(semesterInput.value) : '',
    section: sectionInput.value.trim().toUpperCase()
  };

  const validationError = validateFormData(payload);
  if (validationError) {
    showAlert(validationError, 'error');
    return;
  }

  const editingId = studentIdInput.value;
  const isEditing = Boolean(editingId);
  const url = isEditing ? `${API_BASE}/${editingId}` : API_BASE;
  const method = isEditing ? 'PUT' : 'POST';

  submitBtn.disabled = true;
  submitBtn.textContent = isEditing ? 'Updating...' : 'Adding...';

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Operation failed.');
    }

    showAlert(result.message || (isEditing ? 'Student updated!' : 'Student added!'), 'success');
    resetFormToCreateMode();
    await fetchStudents(searchInput.value);
  } catch (error) {
    showAlert(error.message || 'Could not save student record.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = studentIdInput.value ? 'Update Student' : 'Add Student';
  }
});

cancelEditBtn.addEventListener('click', resetFormToCreateMode);
resetBtn.addEventListener('click', resetFormToCreateMode);

// Handle Edit and Delete buttons via event delegation
studentsTableBody.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const action = button.dataset.action;
  const id = button.dataset.id;
  const student = currentStudents.find((item) => item._id === id);
  if (!student) return;

  if (action === 'edit') {
    startEditStudent(student);
  } else if (action === 'delete') {
    openDeleteModal(student);
  }
});

// Delete Modal controls
function openDeleteModal(student) {
  pendingDeleteId = student._id;
  deleteModalText.textContent = `Are you sure you want to delete ${student.name} (${student.enrollmentNumber})? This action cannot be undone.`;
  deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
  pendingDeleteId = null;
  deleteModal.classList.add('hidden');
}

cancelDeleteBtn.addEventListener('click', closeDeleteModal);

deleteModal.addEventListener('click', (event) => {
  if (event.target === deleteModal) {
    closeDeleteModal();
  }
});

confirmDeleteBtn.addEventListener('click', async () => {
  if (!pendingDeleteId) return;

  const idToDelete = pendingDeleteId;
  confirmDeleteBtn.disabled = true;
  confirmDeleteBtn.textContent = 'Deleting...';

  try {
    const response = await fetch(`${API_BASE}/${idToDelete}`, {
      method: 'DELETE'
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to delete student.');
    }

    if (studentIdInput.value === idToDelete) {
      resetFormToCreateMode();
    }

    closeDeleteModal();
    showAlert(result.message || 'Student deleted successfully.', 'success');
    await fetchStudents(searchInput.value);
  } catch (error) {
    showAlert(error.message || 'Could not delete student record.', 'error');
  } finally {
    confirmDeleteBtn.disabled = false;
    confirmDeleteBtn.textContent = 'Delete';
  }
});

// Live search by Name or Enrollment Number
searchInput.addEventListener('input', () => {
  const hasText = searchInput.value.trim().length > 0;
  clearSearchBtn.classList.toggle('hidden', !hasText);

  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    fetchStudents(searchInput.value);
  }, 250);
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearSearchBtn.classList.add('hidden');
  fetchStudents('');
});

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  fetchStudents();
});
