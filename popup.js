const urlInput = document.getElementById('urlInput');
const pasteBtn = document.getElementById('pasteBtn');
const statusDiv = document.getElementById('status');

function cleanUrl(url) {
  let cleanedUrl = url.trim();

  cleanedUrl = cleanedUrl.replace(/&range=[^&]+&/g, '&');
  cleanedUrl = cleanedUrl.replace(/\?range=[^&]+&/g, '?');
  cleanedUrl = cleanedUrl.replace(/&range=[^&]+$/g, '');
  cleanedUrl = cleanedUrl.replace(/\?range=[^&]+$/g, '');

  cleanedUrl = cleanedUrl.replace(/[?&](ump|srfvp)=[^&]+/g, '');

  cleanedUrl = cleanedUrl.replace(/&&+/g, '&');
  cleanedUrl = cleanedUrl.replace(/\?&/g, '?');
  cleanedUrl = cleanedUrl.replace(/[?&]$/g, '');

  return cleanedUrl;
}

function showStatus(message, type = 'info') {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.classList.remove('hidden');

  setTimeout(() => {
    statusDiv.classList.add('hidden');
  }, 3000);
}

function processAndOpenUrl(url) {
  if (!url || !url.includes('drive.google.com')) {
    showStatus('⚠️ Vui lòng nhập link Google Drive hợp lệ!', 'error');
    return;
  }

  const cleanedUrl = cleanUrl(url);

  chrome.tabs.create({ url: cleanedUrl }, () => {
    if (chrome.runtime.lastError) {
      showStatus('⚠️ Không thể mở tab mới!', 'error');
      return;
    }

    showStatus('✓ Đã mở tab mới với link đã làm sạch!', 'success');
    urlInput.value = '';
  });
}

urlInput.addEventListener('paste', () => {
  setTimeout(() => {
    const url = urlInput.value.trim();
    if (url) processAndOpenUrl(url);
  }, 50);
});

urlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (url) processAndOpenUrl(url);
  }
});

async function readClipboardSafely() {
  if (!navigator.clipboard || !navigator.clipboard.readText) {
    throw new Error('Clipboard API not supported');
  }

  return await navigator.clipboard.readText();
}

pasteBtn.addEventListener('click', async () => {
  try {
    const text = await readClipboardSafely();

    if (!text) {
      showStatus('⚠️ Clipboard trống!', 'error');
      return;
    }

    if (!text.includes('drive.google.com')) {
      showStatus('⚠️ Clipboard không chứa link Google Drive!', 'error');
      return;
    }

    processAndOpenUrl(text);
  } catch (err) {
    console.error('Clipboard read failed:', err);
    showStatus('⚠️ Trình duyệt chặn đọc clipboard. Hãy nhấn Ctrl+V vào ô bên dưới.', 'error');
    urlInput.focus();
    urlInput.select();
  }
});

urlInput.focus();