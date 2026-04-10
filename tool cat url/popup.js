let inputCount = 1;

// Khôi phục dữ liệu khi mở popup
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['savedUrls', 'inputCount', 'downloadMethod'], (result) => {
    // Khôi phục phương thức tải
    if (result.downloadMethod) {
      const radio = document.querySelector(`input[value="${result.downloadMethod}"]`);
      if (radio) radio.checked = true;
    }
    
    if (result.savedUrls && result.savedUrls.length > 0) {
      inputCount = result.inputCount || result.savedUrls.length;
      const urlContainer = document.getElementById('urlContainer');
      urlContainer.innerHTML = ''; // Xóa input mặc định
      
      result.savedUrls.forEach((url, index) => {
        const actualIndex = index + 1;
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';
        inputGroup.setAttribute('data-index', actualIndex);
        inputGroup.innerHTML = `
          <div class="input-header">
            <label>Link ${actualIndex}:</label>
            <button class="remove-btn ${result.savedUrls.length === 1 ? 'hidden' : ''}" data-index="${actualIndex}">✕</button>
          </div>
          <textarea class="url-input" placeholder="Dán URL tại đây...">${url}</textarea>
        `;
        
        urlContainer.appendChild(inputGroup);
        
        // Thêm event listener cho nút xóa
        inputGroup.querySelector('.remove-btn').addEventListener('click', function() {
          removeInput(this.getAttribute('data-index'));
        });
        
        // Lưu khi thay đổi
        inputGroup.querySelector('textarea').addEventListener('input', saveAllUrls);
      });
    } else {
      // Thêm event listener cho textarea mặc định
      document.querySelector('.url-input').addEventListener('input', saveAllUrls);
    }
  });
});

// Lưu phương thức tải khi thay đổi
document.querySelectorAll('input[name="downloadMethod"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    chrome.storage.local.set({ downloadMethod: e.target.value });
  });
});

// Lưu tất cả URL vào storage
function saveAllUrls() {
  const allTextareas = document.querySelectorAll('.url-input');
  const urls = [];
  
  allTextareas.forEach(textarea => {
    urls.push(textarea.value);
  });
  
  chrome.storage.local.set({
    savedUrls: urls,
    inputCount: inputCount
  });
}

// Thêm input mới
document.getElementById('addBtn').addEventListener('click', () => {
  inputCount++;
  const urlContainer = document.getElementById('urlContainer');
  
  const inputGroup = document.createElement('div');
  inputGroup.className = 'input-group';
  inputGroup.setAttribute('data-index', inputCount);
  inputGroup.innerHTML = `
    <div class="input-header">
      <label>Link ${inputCount}:</label>
      <button class="remove-btn" data-index="${inputCount}">✕</button>
    </div>
    <textarea class="url-input" placeholder="Dán URL tại đây..."></textarea>
  `;
  
  urlContainer.appendChild(inputGroup);
  
  // Thêm event listener cho nút xóa
  inputGroup.querySelector('.remove-btn').addEventListener('click', function() {
    removeInput(this.getAttribute('data-index'));
  });
  
  // Thêm event listener để lưu khi thay đổi
  inputGroup.querySelector('textarea').addEventListener('input', saveAllUrls);
  
  // Scroll xuống input mới
  urlContainer.scrollTop = urlContainer.scrollHeight;
  
  // Focus vào textarea mới
  inputGroup.querySelector('textarea').focus();
  
  // Hiện nút xóa cho tất cả input nếu có > 1
  updateRemoveButtons();
  
  // Lưu ngay
  saveAllUrls();
});

// Xóa input
function removeInput(index) {
  const inputGroup = document.querySelector(`.input-group[data-index="${index}"]`);
  if (inputGroup) {
    inputGroup.remove();
    updateRemoveButtons();
    updateLabels();
    saveAllUrls(); // Lưu sau khi xóa
  }
}

// Cập nhật hiển thị nút xóa
function updateRemoveButtons() {
  const allInputs = document.querySelectorAll('.input-group');
  const removeButtons = document.querySelectorAll('.remove-btn');
  
  if (allInputs.length === 1) {
    removeButtons.forEach(btn => btn.classList.add('hidden'));
  } else {
    removeButtons.forEach(btn => btn.classList.remove('hidden'));
  }
}

// Cập nhật lại số thứ tự label
function updateLabels() {
  const allInputs = document.querySelectorAll('.input-group');
  allInputs.forEach((input, index) => {
    const label = input.querySelector('label');
    label.textContent = `Link ${index + 1}:`;
  });
}

// Tải tất cả file
document.getElementById('downloadBtn').addEventListener('click', () => {
  const resultDiv = document.getElementById('result');
  const errorDiv = document.getElementById('error');
  const allTextareas = document.querySelectorAll('.url-input');
  const downloadMethod = document.querySelector('input[name="downloadMethod"]:checked').value;
  const cleanedLinksContainer = document.getElementById('cleanedLinksContainer');
  const cleanedLinksList = document.getElementById('cleanedLinksList');
  
  // Ẩn thông báo cũ
  resultDiv.classList.add('hidden');
  errorDiv.classList.add('hidden');
  cleanedLinksContainer.classList.add('hidden');
  
  // Lấy tất cả URL
  const urls = [];
  allTextareas.forEach(textarea => {
    const url = textarea.value.trim();
    if (url) {
      urls.push(url);
    }
  });
  
  if (urls.length === 0) {
    errorDiv.textContent = '⚠️ Vui lòng dán ít nhất 1 URL!';
    errorDiv.classList.remove('hidden');
    return;
  }
  
  // Kiểm tra tất cả URL
  for (let i = 0; i < urls.length; i++) {
    if (!urls[i].includes('drive.google.com')) {
      errorDiv.textContent = `⚠️ Link ${i + 1} không phải từ Google Drive!`;
      errorDiv.classList.remove('hidden');
      return;
    }
  }
  
  const cleanedUrls = urls.map(url => cleanUrl(url));
  
  if (downloadMethod === 'chrome') {
    // Tải bằng Chrome
    let processedCount = 0;
    const totalUrls = cleanedUrls.length;
    
    cleanedUrls.forEach((cleanedUrl) => {
      chrome.downloads.download({ url: cleanedUrl }, (downloadId) => {
        processedCount++;
        
        if (processedCount === totalUrls) {
          resultDiv.querySelector('.success').textContent = `✓ Đã bắt đầu tải ${totalUrls} file bằng Chrome!`;
          resultDiv.classList.remove('hidden');
          
          setTimeout(() => {
            resultDiv.classList.add('hidden');
          }, 3000);
        }
      });
    });
  } else if (downloadMethod === 'copy') {
    // Hiển thị từng link đã làm sạch
    cleanedLinksList.innerHTML = '';
    
    cleanedUrls.forEach((cleanedUrl, index) => {
      const linkItem = document.createElement('div');
      linkItem.className = 'cleaned-link-item';
      linkItem.innerHTML = `
        <div class="link-number">Link ${index + 1}:</div>
        <div class="link-url">${cleanedUrl}</div>
        <div class="link-actions">
          <button class="copy-btn" data-url="${cleanedUrl}">📋 Copy</button>
          <button class="open-btn" data-url="${cleanedUrl}">🔗 Mở</button>
        </div>
      `;
      
      cleanedLinksList.appendChild(linkItem);
    });
    
    // Hiển thị container
    cleanedLinksContainer.classList.remove('hidden');
    
    // Thêm event listener cho các nút copy
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const url = this.getAttribute('data-url');
        navigator.clipboard.writeText(url).then(() => {
          const originalText = this.textContent;
          this.textContent = '✓ Đã copy!';
          this.classList.add('copied');
          
          setTimeout(() => {
            this.textContent = originalText;
            this.classList.remove('copied');
          }, 2000);
        });
      });
    });
    
    // Thêm event listener cho các nút mở
    document.querySelectorAll('.open-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const url = this.getAttribute('data-url');
        chrome.tabs.create({ url: url });
      });
    });
    
    // Scroll xuống để thấy kết quả
    cleanedLinksContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});

// Copy tất cả link
document.getElementById('copyAllBtn').addEventListener('click', () => {
  const allLinks = [];
  document.querySelectorAll('.link-url').forEach(linkDiv => {
    allLinks.push(linkDiv.textContent);
  });
  
  const allLinksText = allLinks.join('\n\n');
  
  navigator.clipboard.writeText(allLinksText).then(() => {
    const btn = document.getElementById('copyAllBtn');
    const originalText = btn.textContent;
    btn.textContent = '✓ Đã copy tất cả!';
    
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  });
});

// Hàm làm sạch URL
function cleanUrl(url) {
  let cleanedUrl = url;
  
  // Xóa range=...& (bao gồm cả giá trị của nó)
  cleanedUrl = cleanedUrl.replace(/&range=[^&]+&/g, '&');
  cleanedUrl = cleanedUrl.replace(/\?range=[^&]+&/g, '?');
  cleanedUrl = cleanedUrl.replace(/&range=[^&]+$/g, '');
  
  // Xóa =1&srfvp=1 (phần cuối cùng)
  cleanedUrl = cleanedUrl.replace(/=1&srfvp=1$/g, '');
  
  // Dọn dẹp các ký tự & thừa
  cleanedUrl = cleanedUrl.replace(/&&+/g, '&');
  cleanedUrl = cleanedUrl.replace(/\?&/g, '?');
  
  return cleanedUrl;
}


// Nút xóa tất cả
document.getElementById('clearBtn').addEventListener('click', () => {
  if (confirm('Bạn có chắc muốn xóa tất cả link?')) {
    const allTextareas = document.querySelectorAll('.url-input');
    allTextareas.forEach(textarea => {
      textarea.value = '';
    });
    saveAllUrls();
    
    // Hiển thị thông báo
    const resultDiv = document.getElementById('result');
    resultDiv.querySelector('.success').textContent = '✓ Đã xóa tất cả link!';
    resultDiv.classList.remove('hidden');
    
    setTimeout(() => {
      resultDiv.classList.add('hidden');
    }, 2000);
  }
});
