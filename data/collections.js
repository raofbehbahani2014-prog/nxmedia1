// تعریف کالکشن‌های قابل مدیریت در پنل ادمین + فیلدهای هرکدام
// type ها: text | textarea | list (هر خط = یک آیتم) | image | video | stats (هر خط: عنوان|مقدار)

const collections = {
  services: {
    label: 'خدمات',
    icon: '🧩',
    idField: 'slug',
    titleField: 'title',
    fields: [
      { name: 'title', label: 'عنوان خدمت', type: 'text', required: true },
      { name: 'icon', label: 'ایموجی / آیکون', type: 'text' },
      { name: 'image', label: 'تصویر خدمت', type: 'image' },
      { name: 'summary', label: 'توضیح کوتاه', type: 'textarea' },
      { name: 'details', label: 'ویژگی‌ها (هر خط یک مورد)', type: 'list' }
    ]
  },
  portfolio: {
    label: 'نمونه‌کارها',
    icon: '🖼️',
    idField: 'slug',
    titleField: 'title',
    fields: [
      { name: 'title', label: 'عنوان پروژه', type: 'text', required: true },
      { name: 'category', label: 'دسته‌بندی', type: 'text' },
      { name: 'cover', label: 'تصویر کاور', type: 'image' },
      { name: 'video', label: 'ویدئوی نمونه (اختیاری)', type: 'video' },
      { name: 'summary', label: 'خلاصه پروژه', type: 'textarea' },
      { name: 'challenge', label: 'چالش پروژه', type: 'textarea' },
      { name: 'solution', label: 'راهکار NxMedia', type: 'textarea' },
      { name: 'result', label: 'نتیجه نهایی', type: 'textarea' },
      { name: 'stats', label: 'آمار (هر خط: عنوان|مقدار)', type: 'stats' }
    ]
  },
  courses: {
    label: 'دوره‌های آموزشی',
    icon: '🎓',
    idField: 'slug',
    titleField: 'title',
    fields: [
      { name: 'title', label: 'عنوان دوره', type: 'text', required: true },
      { name: 'level', label: 'سطح دوره', type: 'text' },
      { name: 'duration', label: 'مدت دوره', type: 'text' },
      { name: 'price', label: 'قیمت', type: 'text' },
      { name: 'cover', label: 'تصویر کاور', type: 'image' },
      { name: 'video', label: 'ویدئوی معرفی دوره', type: 'video' },
      { name: 'summary', label: 'توضیح دوره', type: 'textarea' },
      { name: 'syllabus', label: 'سرفصل‌ها (هر خط یک مورد)', type: 'list' }
    ]
  },
  articles: {
    label: 'مقالات وبلاگ',
    icon: '📝',
    idField: 'slug',
    titleField: 'title',
    fields: [
      { name: 'title', label: 'عنوان مقاله', type: 'text', required: true },
      { name: 'date', label: 'تاریخ انتشار', type: 'text' },
      { name: 'cover', label: 'تصویر شاخص', type: 'image' },
      { name: 'excerpt', label: 'خلاصه مقاله', type: 'textarea' },
      { name: 'content', label: 'متن کامل مقاله', type: 'textarea' }
    ]
  },
  testimonials: {
    label: 'نظرات مشتریان',
    icon: '💬',
    idField: 'id',
    titleField: 'name',
    fields: [
      { name: 'name', label: 'نام مشتری', type: 'text', required: true },
      { name: 'role', label: 'سمت / برند', type: 'text' },
      { name: 'avatar', label: 'عکس پروفایل', type: 'image' },
      { name: 'text', label: 'متن نظر', type: 'textarea' }
    ]
  },
  faqs: {
    label: 'سوالات متداول',
    icon: '❓',
    idField: 'id',
    titleField: 'q',
    fields: [
      { name: 'q', label: 'سوال', type: 'text', required: true },
      { name: 'a', label: 'پاسخ', type: 'textarea' }
    ]
  },
  team: {
    label: 'اعضای تیم',
    icon: '👥',
    idField: 'id',
    titleField: 'name',
    fields: [
      { name: 'name', label: 'نام عضو', type: 'text', required: true },
      { name: 'role', label: 'سمت', type: 'text' },
      { name: 'avatar', label: 'عکس', type: 'image' }
    ]
  },
  pricing: {
    label: 'پکیج‌های تعرفه',
    icon: '💰',
    idField: 'id',
    titleField: 'name',
    fields: [
      { name: 'name', label: 'نام پکیج', type: 'text', required: true },
      { name: 'price', label: 'قیمت', type: 'text' },
      { name: 'features', label: 'ویژگی‌ها (هر خط یک مورد)', type: 'list' },
      { name: 'highlight', label: 'پیشنهادی باشد؟ (yes/no)', type: 'text' }
    ]
  }
};

module.exports = { collections };
