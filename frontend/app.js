const API_URL = '/api/opportunities';

const form = document.getElementById('opportunity-form');
const formTitle = document.getElementById('form-title');
const saveButton = document.getElementById('save-button');
const cancelButton = document.getElementById('cancel-button');
const tableBody = document.getElementById('opportunities-body');
const messageBox = document.getElementById('message');
const detailsCard = document.getElementById('details-card');
const detailsDiv = document.getElementById('details');

const fieldNames = [
  'title',
  'description',
  'research_area',
  'faculty_name',
  'department',
  'required_skills',
  'positions',
  'deadline',
  'status'
];

let messageTimer;

function showMessage(text, type) {
  messageBox.innerHTML = text;
  messageBox.className = 'message ' + type;
  clearTimeout(messageTimer);
  messageTimer = setTimeout(() => {
    messageBox.className = 'message hidden';
  }, 5000);
}

function showServerError(data) {
  let text = data.message || 'Something went wrong';
  if (data.errors) {
    text += '<ul><li>' + data.errors.map(escapeHtml).join('</li><li>') + '</li></ul>';
  }
  showMessage(text, 'error');
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function loadOpportunities() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (!response.ok) {
      showServerError(data);
      return;
    }

    if (data.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7">No research opportunities yet.</td></tr>';
      return;
    }

    tableBody.innerHTML = '';
    for (const opportunity of data) {
      const row = document.createElement('tr');
      row.innerHTML =
        '<td>' + opportunity.id + '</td>' +
        '<td>' + escapeHtml(opportunity.title) + '</td>' +
        '<td>' + escapeHtml(opportunity.research_area) + '</td>' +
        '<td>' + escapeHtml(opportunity.faculty_name) + '</td>' +
        '<td>' + opportunity.deadline + '</td>' +
        '<td><span class="badge ' + opportunity.status + '">' + opportunity.status + '</span></td>' +
        '<td>' +
          '<button class="small view" onclick="viewOpportunity(' + opportunity.id + ')">View</button>' +
          '<button class="small edit" onclick="editOpportunity(' + opportunity.id + ')">Edit</button>' +
          (opportunity.status === 'Open'
            ? '<button class="small close" onclick="closeOpportunity(' + opportunity.id + ')">Close</button>'
            : '') +
          '<button class="small delete" onclick="deleteOpportunity(' + opportunity.id + ')">Delete</button>' +
        '</td>';
      tableBody.appendChild(row);
    }
  } catch (error) {
    showMessage('Could not connect to the server.', 'error');
  }
}

async function getOpportunity(id) {
  const response = await fetch(API_URL + '/' + id);
  const data = await response.json();
  if (!response.ok) {
    showServerError(data);
    return null;
  }
  return data;
}

async function viewOpportunity(id) {
  try {
    const opportunity = await getOpportunity(id);
    if (!opportunity) {
      return;
    }

    detailsDiv.innerHTML =
      '<p><strong>ID:</strong> ' + opportunity.id + '</p>' +
      '<p><strong>Title:</strong> ' + escapeHtml(opportunity.title) + '</p>' +
      '<p><strong>Description:</strong> ' + escapeHtml(opportunity.description) + '</p>' +
      '<p><strong>Research Area:</strong> ' + escapeHtml(opportunity.research_area) + '</p>' +
      '<p><strong>Faculty Member:</strong> ' + escapeHtml(opportunity.faculty_name) + '</p>' +
      '<p><strong>Department:</strong> ' + escapeHtml(opportunity.department) + '</p>' +
      '<p><strong>Required Skills:</strong> ' + escapeHtml(opportunity.required_skills) + '</p>' +
      '<p><strong>Available Positions:</strong> ' + opportunity.positions + '</p>' +
      '<p><strong>Application Deadline:</strong> ' + opportunity.deadline + '</p>' +
      '<p><strong>Status:</strong> <span class="badge ' + opportunity.status + '">' + opportunity.status + '</span></p>';
    detailsCard.classList.remove('hidden');
    detailsCard.scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    showMessage('Could not connect to the server.', 'error');
  }
}

function getFormData() {
  const data = {};
  for (const field of fieldNames) {
    data[field] = document.getElementById(field).value.trim();
  }
  return data;
}

function validateForm(data) {
  const errors = [];

  if (data.title === '') errors.push('Research title is required');
  if (data.description === '') errors.push('Research description is required');
  if (data.research_area === '') errors.push('Research area is required');
  if (data.faculty_name === '') errors.push("Faculty member's name is required");
  if (data.department === '') errors.push('Department is required');
  if (data.required_skills === '') errors.push('Required skills are required');

  if (data.positions === '') {
    errors.push('Number of positions is required');
  } else if (!Number.isInteger(Number(data.positions)) || Number(data.positions) < 1) {
    errors.push('Number of positions must be a whole number of at least 1');
  }

  if (data.deadline === '') errors.push('Application deadline is required');

  return errors;
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const data = getFormData();
  const errors = validateForm(data);
  if (errors.length > 0) {
    showServerError({ message: 'Please fix the following:', errors: errors });
    return;
  }

  const id = document.getElementById('opportunity-id').value;
  const isEditing = id !== '';

  try {
    const response = await fetch(isEditing ? API_URL + '/' + id : API_URL, {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();

    if (!response.ok) {
      showServerError(result);
      return;
    }

    showMessage(isEditing ? 'Opportunity updated successfully.' : 'Opportunity created successfully.', 'success');
    resetForm();
    loadOpportunities();
    if (isEditing && !detailsCard.classList.contains('hidden')) {
      viewOpportunity(id);
    }
  } catch (error) {
    showMessage('Could not connect to the server.', 'error');
  }
}

async function editOpportunity(id) {
  try {
    const opportunity = await getOpportunity(id);
    if (!opportunity) {
      return;
    }

    for (const field of fieldNames) {
      document.getElementById(field).value = opportunity[field];
    }
    document.getElementById('opportunity-id').value = opportunity.id;
    formTitle.textContent = 'Edit Opportunity #' + opportunity.id;
    saveButton.textContent = 'Update Opportunity';
    cancelButton.classList.remove('hidden');
    form.scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    showMessage('Could not connect to the server.', 'error');
  }
}

async function closeOpportunity(id) {
  try {
    const opportunity = await getOpportunity(id);
    if (!opportunity) {
      return;
    }

    opportunity.status = 'Closed';

    const response = await fetch(API_URL + '/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opportunity)
    });
    const result = await response.json();

    if (!response.ok) {
      showServerError(result);
      return;
    }

    showMessage('Opportunity closed successfully.', 'success');
    loadOpportunities();
    if (!detailsCard.classList.contains('hidden')) {
      viewOpportunity(id);
    }
  } catch (error) {
    showMessage('Could not connect to the server.', 'error');
  }
}

async function deleteOpportunity(id) {
  if (!confirm('Are you sure you want to delete this opportunity?')) {
    return;
  }

  try {
    const response = await fetch(API_URL + '/' + id, { method: 'DELETE' });
    const result = await response.json();

    if (!response.ok) {
      showServerError(result);
      return;
    }

    showMessage('Opportunity deleted successfully.', 'success');
    detailsCard.classList.add('hidden');
    if (document.getElementById('opportunity-id').value === String(id)) {
      resetForm();
    }
    loadOpportunities();
  } catch (error) {
    showMessage('Could not connect to the server.', 'error');
  }
}

function resetForm() {
  form.reset();
  document.getElementById('opportunity-id').value = '';
  formTitle.textContent = 'Add New Opportunity';
  saveButton.textContent = 'Add Opportunity';
  cancelButton.classList.add('hidden');
}

form.addEventListener('submit', handleFormSubmit);
cancelButton.addEventListener('click', resetForm);

loadOpportunities();
