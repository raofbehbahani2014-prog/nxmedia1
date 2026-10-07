const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { readDB, writeDB, slugify } = require('../data/db');
const { collections } = require('../data/collections');
const { requireAdmin } = require('../middleware/adminAuth');

const router = express.Router();

// ---------- تنظیمات آپلود فایل ----------
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = slugify(path.basename(file.originalname, ext));
    cb(null, `${base}-${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 300 * 1024 * 1024 }, // ۳۰۰ مگابایت (برای ویدئو)
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|svg|mp4|webm|mov|quicktime/;
    const ok = allowed.test(file.mimetype) || allowed.test(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error('نوع فایل مجاز نیست'), ok);
  }
});

function mediaType(filename) {
  return /\.(mp4|webm|mov)$/i.test(filename) ? 'video' : 'image';
}

// ---------- ورود ادمین ----------
router.get('/login', (req, res) => {
  if (req.session.isAdmin) return res.redirect('/admin');
  res.render('pages/admin/login', { title: 'ورود ادمین | NxMedia', error: null, layout: false });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'admin123';
  if (username === adminUser && password === adminPass) {
    req.session.isAdmin = true;
    req.session.adminName = username;
    return res.redirect('/admin');
  }
  res.render('pages/admin/login', { title: 'ورود ادمین | NxMedia', error: 'نام کاربری یا رمز عبور اشتباه است.' });
});

router.post('/logout', (req, res) => {
  req.session.isAdmin = false;
  res.redirect('/admin/login');
});

// از این به بعد همه روت‌ها نیاز به لاگین ادمین دارند
router.use(requireAdmin);

// ---------- داشبورد ----------
router.get('/', (req, res) => {
  const db = readDB();
  const counts = Object.keys(collections).reduce((acc, key) => {
    acc[key] = (db[key] || []).length;
    return acc;
  }, {});
  const leadCounts = {
    contact: (db.leads?.contact || []).length,
    projectRequests: (db.leads?.projectRequests || []).length,
    consultations: (db.leads?.consultations || []).length
  };
  res.render('pages/admin/dashboard', {
    title: 'داشبورد ادمین | NxMedia',
    collections, counts, leadCounts, mediaCount: (db.media || []).length
  });
});

// ---------- مدیریت متن‌ها و تنظیمات کلی سایت ----------
router.get('/site-settings', (req, res) => {
  const db = readDB();
  res.render('pages/admin/site-settings', { title: 'متن‌ها و تنظیمات سایت | ادمین', site: db.site });
});

router.post('/site-settings', (req, res) => {
  const db = readDB();
  // فرم به‌صورت تودرتو می‌آید: site[hero][title1] و ...
  db.site = deepMerge(db.site, req.body.site || {});
  writeDB(db);
  res.redirect('/admin/site-settings?saved=1');
});

function deepMerge(target, src) {
  for (const key in src) {
    if (src[key] !== null && typeof src[key] === 'object' && !Array.isArray(src[key])) {
      target[key] = deepMerge(target[key] || {}, src[key]);
    } else {
      target[key] = src[key];
    }
  }
  return target;
}

// ---------- کتابخانه رسانه (آپلود عکس/ویدئو) ----------
router.get('/media', (req, res) => {
  const db = readDB();
  res.render('pages/admin/media', { title: 'کتابخانه رسانه | ادمین', media: (db.media || []).slice().reverse() });
});

router.post('/media/upload', upload.array('files', 20), (req, res) => {
  const db = readDB();
  db.media = db.media || [];
  (req.files || []).forEach(f => {
    db.media.push({
      id: 'media-' + Date.now() + '-' + Math.round(Math.random() * 1000),
      url: '/uploads/' + f.filename,
      name: f.originalname,
      type: mediaType(f.filename),
      uploadedAt: new Date().toISOString()
    });
  });
  writeDB(db);
  res.redirect('/admin/media');
});

router.post('/media/:id/delete', (req, res) => {
  const db = readDB();
  const item = (db.media || []).find(m => m.id === req.params.id);
  if (item) {
    const filePath = path.join(uploadDir, path.basename(item.url));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    db.media = db.media.filter(m => m.id !== req.params.id);
    writeDB(db);
  }
  res.redirect('/admin/media');
});

// آپلود سریع (استفاده‌شده داخل فرم ویرایش آیتم‌ها، پاسخ JSON می‌دهد)
router.post('/upload-field', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, message: 'فایلی ارسال نشد' });
  const db = readDB();
  db.media = db.media || [];
  const entry = {
    id: 'media-' + Date.now(),
    url: '/uploads/' + req.file.filename,
    name: req.file.originalname,
    type: mediaType(req.file.filename),
    uploadedAt: new Date().toISOString()
  };
  db.media.push(entry);
  writeDB(db);
  res.json({ ok: true, url: entry.url });
});

// ---------- CRUD عمومی برای کالکشن‌ها ----------
router.get('/:collection', (req, res, next) => {
  const conf = collections[req.params.collection];
  if (!conf) return next();
  const db = readDB();
  res.render('pages/admin/collection-list', {
    title: `مدیریت ${conf.label} | ادمین`,
    key: req.params.collection,
    conf,
    items: db[req.params.collection] || []
  });
});

router.get('/:collection/new', (req, res, next) => {
  const conf = collections[req.params.collection];
  if (!conf) return next();
  res.render('pages/admin/collection-form', {
    title: `افزودن ${conf.label} | ادمین`,
    key: req.params.collection,
    conf,
    item: null
  });
});

router.get('/:collection/:id/edit', (req, res, next) => {
  const conf = collections[req.params.collection];
  if (!conf) return next();
  const db = readDB();
  const item = (db[req.params.collection] || []).find(i => String(i[conf.idField]) === req.params.id);
  if (!item) return res.redirect(`/admin/${req.params.collection}`);
  res.render('pages/admin/collection-form', {
    title: `ویرایش ${conf.label} | ادمین`,
    key: req.params.collection,
    conf,
    item
  });
});

function buildItemFromBody(conf, body, existing) {
  const item = existing ? { ...existing } : {};
  conf.fields.forEach(f => {
    const raw = body[f.name];
    if (f.type === 'list') {
      item[f.name] = (raw || '').split('\n').map(s => s.trim()).filter(Boolean);
    } else if (f.type === 'stats') {
      item[f.name] = (raw || '').split('\n').map(s => s.trim()).filter(Boolean).map(line => {
        const [label, value] = line.split('|').map(s => (s || '').trim());
        return { label: label || '', value: value || '' };
      });
    } else {
      item[f.name] = raw !== undefined ? raw : (item[f.name] || '');
    }
  });
  return item;
}

router.post('/:collection/new', (req, res, next) => {
  const conf = collections[req.params.collection];
  if (!conf) return next();
  const db = readDB();
  db[req.params.collection] = db[req.params.collection] || [];

  const item = buildItemFromBody(conf, req.body, null);
  if (conf.idField === 'slug') {
    item.slug = slugify(req.body.slug || req.body.title || req.body.name);
  } else {
    item.id = req.params.collection + '-' + Date.now();
  }
  db[req.params.collection].push(item);
  writeDB(db);
  res.redirect(`/admin/${req.params.collection}`);
});

router.post('/:collection/:id/edit', (req, res, next) => {
  const conf = collections[req.params.collection];
  if (!conf) return next();
  const db = readDB();
  const list = db[req.params.collection] || [];
  const idx = list.findIndex(i => String(i[conf.idField]) === req.params.id);
  if (idx === -1) return res.redirect(`/admin/${req.params.collection}`);

  const updated = buildItemFromBody(conf, req.body, list[idx]);
  updated[conf.idField] = list[idx][conf.idField]; // شناسه ثابت می‌ماند
  list[idx] = updated;
  db[req.params.collection] = list;
  writeDB(db);
  res.redirect(`/admin/${req.params.collection}`);
});

router.post('/:collection/:id/delete', (req, res, next) => {
  const conf = collections[req.params.collection];
  if (!conf) return next();
  const db = readDB();
  db[req.params.collection] = (db[req.params.collection] || []).filter(i => String(i[conf.idField]) !== req.params.id);
  writeDB(db);
  res.redirect(`/admin/${req.params.collection}`);
});

// ---------- مشاهده درخواست‌ها (فرم‌های سایت) ----------
router.get('/leads/all', (req, res) => {
  const db = readDB();
  res.render('pages/admin/leads', { title: 'درخواست‌های دریافتی | ادمین', leads: db.leads || { contact: [], projectRequests: [], consultations: [] } });
});

module.exports = router;
