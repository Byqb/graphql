// Function to display user progress in a table format
function displayProgressTable(progresses) {
    // Create table element with styling class
    const table = document.createElement('table');
    table.className = 'progress-table';

    // Create and populate table header
    const headerRow = document.createElement('tr');
    const headers = ['Path', 'Created At', 'Grade', 'Captain', 'Auditors'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Create table rows for each progress entry
    progresses.forEach(progress => {
        const row = document.createElement('tr');

        // Add project path
        const pathCell = document.createElement('td');
        pathCell.textContent = progress.path;
        row.appendChild(pathCell);

        // Add completion date
        const createdAtCell = document.createElement('td');
        createdAtCell.textContent = new Date(progress.createdAt).toLocaleString();
        row.appendChild(createdAtCell);

        // Add project grade
        const gradeCell = document.createElement('td');
        gradeCell.textContent = progress.grade;
        row.appendChild(gradeCell);

        // Add group captain
        const captainCell = document.createElement('td');
        captainCell.textContent = progress.group?.captainLogin;
        row.appendChild(captainCell);

        // Add list of auditors
        const auditorsCell = document.createElement('td');
        const auditors = progress.group?.auditors?.map(a => a.auditorLogin).join(', ');
        auditorsCell.textContent = auditors;
        row.appendChild(auditorsCell);

        table.appendChild(row);
    });

    // Clear and update the progress table container
    const progressTableContainer = document.getElementById('progressTableContainer');
    progressTableContainer.innerHTML = '';
    progressTableContainer.appendChild(table);
}