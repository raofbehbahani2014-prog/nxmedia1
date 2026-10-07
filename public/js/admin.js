document.addEventListener('DOMContentLoaded', () => {
  // آپلود فیلدهای تصویر/ویدئو داخل فرم‌های CRUD
  document.querySelectorAll('.field-upload').forEach(box => {
    const input = box.querySelector('input[type=file]');
    const hidden = box.querySelector('input[type=hidden]');
    const preview = box.querySelector('.upload-preview');
    const isVideo = box.dataset.type === 'video';

    function renderPreview(url) {
      if (!url) { preview.innerHTML = ''; return; }
      preview.innerHTML = isVideo
        ? `<video src="${url}" controls></video>`
        : `<img src="${url}" alt="">`;
    }
    renderPreview(hidden.value);

    input.addEventListener('change', async () => {
      if (!input.files.length) return;
      const fd = new FormData();
      fd.append('file', input.files[0]);
      box.classList.add('dragover');
      try {
        const res = await fetch('/admin/upload-field', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.ok) {
          hidden.value = data.url;
          renderPreview(data.url);
        } else {
          alert(data.message || 'خطا در آپلود فایل');
        }
      } catch (e) {
        alert('خطا در آپلود فایل');
      }
      box.classList.remove('dragover');
    });
  });

  // تب‌های صفحه تنظیمات سایت
  const tabs = document.querySelectorAll('.tabs a[data-tab]');
  const panels = document.querySelectorAll('.tab-panel');
  if (tabs.length) {
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.style.display = 'none');
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).style.display = 'block';
      });
    });
  }

  // تایید حذف
  document.querySelectorAll('form.confirm-delete').forEach(f => {
    f.addEventListener('submit', (e) => {
      if (!confirm('آیا از حذف این مورد مطمئن هستید؟')) e.preventDefault();
    });
  });
});
