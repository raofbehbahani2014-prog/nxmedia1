require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const { readDB, writeDB } = require('./data/db');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'nxmedia-secret-key-change-me',
  resave: false,
  saveUninitialized: false
}));

// متغیرهای عمومی در دسترس همه ویوها
app.use((req, res, next) => {
  const db = readDB();
  res.locals.site = db.site;
  res.locals.siteName = db.site.siteName;
  res.locals.currentUser = req.session.user || null;
  next();
});

// ---------- پنل ادمین ----------
app.use('/admin', adminRoutes);

// ---------- صفحات اصلی ----------
app.get('/', (req, res) => {
  const db = readDB();
  res.render('pages/home', {
    title: `${db.site.siteName} | تولید محتوا و آموزش اینستاگرام`,
    services: db.services.slice(0, 6),
    testimonials: db.testimonials.slice(0, 3),
    portfolio: db.portfolio.slice(0, 4)
  });
});

app.get('/about', (req, res) => {
  const db = readDB();
  res.render('pages/about', { title: `درباره ما و معرفی مجموعه | ${db.site.siteName}`, team: db.team });
});

// ---------- خدمات ----------
app.get('/services', (req, res) => {
  const db = readDB();
  res.render('pages/services', { title: `خدمات تولید محتوا و مدیریت اینستاگرام | ${db.site.siteName}`, services: db.services });
});

app.get('/services/:slug', (req, res) => {
  const db = readDB();
  const service = db.services.find(s => s.slug === req.params.slug);
  if (!service) return res.status(404).render('pages/404', { title: 'صفحه پیدا نشد' });
  res.render('pages/service-detail', {
    title: `${service.title} | ${db.site.siteName}`,
    service,
    related: db.services.filter(s => s.slug !== service.slug).slice(0, 3)
  });
});

app.get('/pricing', (req, res) => {
  const db = readDB();
  res.render('pages/pricing', { title: `تعرفه خدمات | ${db.site.siteName}`, pricing: db.pricing });
});

// ---------- نمونه‌کارها ----------
app.get('/portfolio', (req, res) => {
  const db = readDB();
  res.render('pages/portfolio', { title: `نمونه‌کارها و پروژه‌های انجام‌شده | ${db.site.siteName}`, portfolio: db.portfolio });
});

app.get('/portfolio/:slug', (req, res) => {
  const db = readDB();
  const item = db.portfolio.find(p => p.slug === req.params.slug);
  if (!item) return res.status(404).render('pages/404', { title: 'صفحه پیدا نشد' });
  res.render('pages/case-study', { title: `${item.title} | Case Study | ${db.site.siteName}`, item });
});

// ---------- آموزش ----------
app.get('/education', (req, res) => {
  const db = readDB();
  res.render('pages/education', { title: `آموزش تولید محتوا | ${db.site.siteName}`, courses: db.courses, articles: db.articles });
});

app.get('/courses', (req, res) => {
  const db = readDB();
  res.render('pages/courses', { title: `دوره‌های آموزشی | ${db.site.siteName}`, courses: db.courses });
});

app.get('/courses/:slug', (req, res) => {
  const db = readDB();
  const course = db.courses.find(c => c.slug === req.params.slug);
  if (!course) return res.status(404).render('pages/404', { title: 'صفحه پیدا نشد' });
  res.render('pages/course-detail', { title: `${course.title} | ${db.site.siteName}`, course });
});

app.get('/blog', (req, res) => {
  const db = readDB();
  res.render('pages/blog', { title: `وبلاگ و مقالات آموزشی | ${db.site.siteName}`, articles: db.articles });
});

app.get('/blog/:slug', (req, res) => {
  const db = readDB();
  const article = db.articles.find(a => a.slug === req.params.slug);
  if (!article) return res.status(404).render('pages/404', { title: 'صفحه پیدا نشد' });
  res.render('pages/article-detail', { title: `${article.title} | ${db.site.siteName}`, article });
});

// ---------- تماس / فرم‌ها ----------
app.get('/contact', (req, res) => {
  const db = readDB();
  res.render('pages/contact', { title: `تماس با ما | ${db.site.siteName}`, faqs: db.faqs });
});

app.post('/contact', (req, res) => {
  const db = readDB();
  db.leads.contact.push({ ...req.body, date: new Date().toLocaleString('fa-IR') });
  writeDB(db);
  res.render('pages/thanks', { title: 'پیام شما ارسال شد', message: 'پیام شما با موفقیت ثبت شد. تیم ما طی ۲۴ ساعت آینده با شما تماس می‌گیرد.' });
});

app.get('/request-project', (req, res) => {
  const db = readDB();
  res.render('pages/request-project', { title: `درخواست پروژه | ${db.site.siteName}`, services: db.services });
});

app.post('/request-project', (req, res) => {
  const db = readDB();
  db.leads.projectRequests.push({ ...req.body, date: new Date().toLocaleString('fa-IR') });
  writeDB(db);
  res.render('pages/thanks', { title: 'درخواست شما ثبت شد', message: 'درخواست پروژه شما ثبت شد. کارشناسان ما به‌زودی با شما هماهنگ می‌کنند.' });
});

app.get('/consultation', (req, res) => {
  res.render('pages/consultation', { title: `رزرو مشاوره اینستاگرام | ${res.locals.siteName}` });
});

app.post('/consultation', (req, res) => {
  const db = readDB();
  db.leads.consultations.push({ ...req.body, createdAt: new Date().toLocaleString('fa-IR') });
  writeDB(db);
  res.render('pages/thanks', { title: 'رزرو شما ثبت شد', message: 'زمان مشاوره شما ثبت شد. جزئیات نهایی از طریق واتساپ یا ایمیل اطلاع‌رسانی می‌شود.' });
});

app.post('/newsletter', (req, res) => {
  console.log('عضویت خبرنامه:', req.body.email);
  res.json({ ok: true, message: 'با موفقیت در خبرنامه عضو شدید.' });
});

// ---------- FAQ ----------
app.get('/faq', (req, res) => {
  const db = readDB();
  res.render('pages/faq', { title: `سوالات متداول | ${db.site.siteName}`, faqs: db.faqs });
});

// ---------- جستجوی داخلی ساده ----------
app.get('/search', (req, res) => {
  const db = readDB();
  const q = (req.query.q || '').trim().toLowerCase();
  let results = [];
  if (q) {
    results = [
      ...db.services.filter(s => s.title.toLowerCase().includes(q) || (s.summary || '').toLowerCase().includes(q)).map(s => ({ type: 'خدمت', title: s.title, url: `/services/${s.slug}` })),
      ...db.articles.filter(a => a.title.toLowerCase().includes(q)).map(a => ({ type: 'مقاله', title: a.title, url: `/blog/${a.slug}` })),
      ...db.courses.filter(c => c.title.toLowerCase().includes(q)).map(c => ({ type: 'دوره', title: c.title, url: `/courses/${c.slug}` })),
      ...db.portfolio.filter(p => p.title.toLowerCase().includes(q)).map(p => ({ type: 'نمونه‌کار', title: p.title, url: `/portfolio/${p.slug}` }))
    ];
  }
  res.render('pages/search', { title: `نتایج جستجو برای «${req.query.q || ''}» | ${db.site.siteName}`, q: req.query.q || '', results });
});

// ---------- احراز هویت مشتری (نمونه ساده) ----------
app.get('/client/login', (req, res) => {
  res.render('pages/client/login', { title: `ورود مشتری | ${res.locals.siteName}`, error: null });
});

app.post('/client/login', (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    req.session.user = { name: email.split('@')[0], email };
    return res.redirect('/client/dashboard');
  }
  res.render('pages/client/login', { title: `ورود مشتری | ${res.locals.siteName}`, error: 'ایمیل یا رمز عبور نامعتبر است.' });
});

app.post('/client/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/client/login');
  next();
}

// ---------- پنل مشتری (اسکلت اولیه) ----------
app.get('/client/dashboard', requireLogin, (req, res) => {
  res.render('pages/client/dashboard', { title: `پنل مشتری | ${res.locals.siteName}` });
});

app.get('/client/projects', requireLogin, (req, res) => {
  res.render('pages/client/projects', { title: 'مدیریت پروژه‌ها | پنل مشتری' });
});

app.get('/client/content-calendar', requireLogin, (req, res) => {
  res.render('pages/client/content-calendar', { title: 'تقویم محتوایی اختصاصی | پنل مشتری' });
});

app.get('/client/files', requireLogin, (req, res) => {
  res.render('pages/client/files', { title: 'آپلود و دریافت فایل | پنل مشتری' });
});

app.get('/client/invoices', requireLogin, (req, res) => {
  res.render('pages/client/invoices', { title: 'فاکتورها و پرداخت | پنل مشتری' });
});

// ---------- صفحات قانونی ----------
app.get('/terms', (req, res) => {
  res.render('pages/terms', { title: `قوانین و شرایط همکاری | ${res.locals.siteName}` });
});

app.get('/privacy', (req, res) => {
  res.render('pages/privacy', { title: `حریم خصوصی | ${res.locals.siteName}` });
});

// ---------- sitemap و robots ساده ----------
app.get('/sitemap.xml', (req, res) => {
  const db = readDB();
  const base = `${req.protocol}://${req.get('host')}`;
  const staticUrls = ['/', '/about', '/services', '/portfolio', '/education', '/courses', '/blog', '/pricing', '/contact', '/faq', '/request-project', '/consultation', '/terms', '/privacy'];
  const dynamicUrls = [
    ...db.services.map(s => `/services/${s.slug}`),
    ...db.portfolio.map(p => `/portfolio/${p.slug}`),
    ...db.courses.map(c => `/courses/${c.slug}`),
    ...db.articles.map(a => `/blog/${a.slug}`)
  ];
  const urls = [...staticUrls, ...dynamicUrls];
  res.set('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${base}${u}</loc></url>`).join('\n')}
</urlset>`);
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /client/\nDisallow: /admin/\nSitemap: ${req.protocol}://${req.get('host')}/sitemap.xml`);
});

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).render('pages/404', { title: 'صفحه پیدا نشد' });
});

app.listen(PORT, () => {
  console.log(`✅ NxMedia در حال اجرا روی http://localhost:${PORT}`);
  console.log(`🔐 پنل ادمین: http://localhost:${PORT}/admin/login`);
});
