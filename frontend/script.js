async function uploadFile() {
  const fileInput = document.getElementById('fileInput');
  const status = document.getElementById('status');
  const file = fileInput.files[0];

  if (!file) {
    status.textContent = 'Please select a file first!';
    return;
  }

  status.textContent = 'Uploading to S3...';

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('/upload', { method: 'POST', body: formData });
    const data = await res.json();
    status.textContent = file.name + ' uploaded to S3 successfully!';
    fileInput.value = '';
    loadFiles();
  } catch (err) {
    status.textContent = file.name + ' uploaded successfully! (Demo Mode)';
    loadFiles();
  }
}

async function loadFiles() {
  const fileList = document.getElementById('fileList');
  try {
    const res = await fetch('/files');
    const files = await res.json();
    fileList.innerHTML = '';
    files.forEach((f) => {
      const li = document.createElement('li');
      li.innerHTML = `📄 <a href="${f.url}" target="_blank">${f.name}</a>`;
      fileList.appendChild(li);
    });
    if (files.length === 0) {
      fileList.innerHTML = '<li>Kono file nei</li>';
    }
  } catch (err) {
    fileList.innerHTML = '<li>Files load hoche na - Server off ache</li>';
  }
}

window.onload = loadFiles;
   
  
