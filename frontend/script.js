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
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    status.textContent = file.name + ' uploaded to S3 successfully!';
    fileInput.value = '';
    loadFiles();
  } catch (err) {
    status.textContent = 'Upload failed: ' + err.message;
  }
}

async function loadFiles() {
  const list = document.getElementById('fileList');
  if (!list) return;
  try {
    const res = await fetch('/files');
    const files = await res.json();
    list.innerHTML = '';
    if (files.length === 0) {
      list.innerHTML = '<li>Kono file nei</li>';
      return;
    }
    files.forEach(f => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = f.url;
      a.textContent = f.name;
      a.target = '_blank';
      li.appendChild(a);
      list.appendChild(li);
    });
  } catch (err) {
    list.innerHTML = '<li>Files load hocche na</li>';
  }
}

window.onload = loadFiles;
