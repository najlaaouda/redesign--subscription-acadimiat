/**
 * Compare-table data — categories and rows.
 * Each row has a label + 3 cell values for [starter, pro, advanced].
 * Cell can be a string ("غير محدود", "5GB", "3 تصاميم") or a boolean
 * (true = available ✓, false = not available ✕).
 */
export type Cell = string | boolean;

export interface CompareRow {
  label: string;
  tooltip?: string;
  values: [Cell, Cell, Cell];
}

export interface CompareCategory {
  id: string;
  title: string;
  rows: CompareRow[];
}

export const CATEGORIES: CompareCategory[] = [
  {
    id: "fees",
    title: "رسوم وعمولات",
    rows: [
      {
        label: "عمولة أكاديميات",
        tooltip: "تطبق فقط على كل عملية بيع",
        values: ["10% + $1", "5% + $1", "بدون عمولة"],
      },
      {
        label: "بطاقات Credit & Debit Card Sales",
        values: ["3.9% + 30¢", "3.9% + 30¢", "3.9% + 30¢"],
      },
      {
        label: "رسوم تحويل",
        values: [
          "$15 + عمولة البنك",
          "$15 + عمولة البنك",
          "$15 + عمولة البنك",
        ],
      },
      {
        label: "طلبات سحب الأرباح",
        tooltip: "السحب الفوري متاح للمبالغ 200$ فأكثر",
        values: ["فوري عند الطلب", "فوري عند الطلب", "فوري عند الطلب"],
      },
    ],
  },
  {
    id: "content",
    title: "المحتوى",
    rows: [
      { label: "دورات تدريبية منشورة", values: ["1", "5", "غير محدود"] },
      {
        label: "جلسات استشارات / إرشاد شخصي منشورة",
        values: ["1", "10", "غير محدود"],
      },
      { label: "منتجات رقمية", values: ["1", "غير محدود", "غير محدود"] },
      { label: "باقات / مسارات", values: [false, "3", "غير محدود"] },
      { label: "رفع فيديوهات", values: ["20 فيديو", "غير محدود", "غير محدود"] },
      { label: "مساحة التخزين", values: ["5GB", "100GB", "غير محدود"] },
      {
        label: "مرفقات الدورات التدريبية",
        values: ["غير محدود", "غير محدود", "غير محدود"],
      },
      {
        label: "محتويات المنتج الرقمي",
        values: ["غير محدود", "غير محدود", "غير محدود"],
      },
      { label: "دورات البث المباشر", values: [false, true, true] },
      { label: "تحميل جميع أنواع الملفات", values: [true, true, true] },
      { label: "تصنيف المنتجات", values: [true, true, true] },
      { label: "بنك خاص بالملفات", values: [true, true, true] },
    ],
  },
  {
    id: "accounts",
    title: "الحسابات",
    rows: [
      {
        label: "حسابات متدربين",
        values: ["غير محدود", "غير محدود", "غير محدود"],
      },
      { label: "حساب مالك", values: ["1", "1", "1"] },
      { label: "حساب مدير", values: [false, false, "2"] },
      { label: "حساب مشرف", values: [false, "1", "5"] },
    ],
  },
  {
    id: "platform",
    title: "مميزات المنصة",
    rows: [
      { label: "تصميم الشهادة", values: ["1 تصميم", "3 تصاميم", "3 تصاميم"] },
      { label: "شهادة إتمام الدورة", values: [true, true, true] },
      { label: "تعديل شروط إتمام الدورة", values: [true, true, true] },
      { label: "التحكم في ألوان المنصة", values: [true, true, true] },
      { label: "تصاميم جاهزة للمنصة", values: [true, true, true] },
      { label: "تصميمات جاهزة لصفحة المنتجات", values: [true, true, true] },
      { label: "التوافق مع محركات البحث (SEO)", values: [true, true, true] },
      { label: "نظام إدارة محتوى (CMS)", values: [true, true, true] },
      { label: "نظام إشعارات", values: [true, true, true] },
      { label: "التقارير", values: [true, true, true] },
      { label: "محادثة دعم فني فورية", values: [true, true, true] },
      { label: "مركز المساعدة / قاعدة المعرفة", values: [true, true, true] },
      {
        label: "نظام محادثة للاستشارات",
        values: [true, true, true],
        tooltip:
          "نظام رسائل داخل المنصة للتواصل بين المستشار والعميل مع إمكانية تبادل الملفات.",
      },
      { label: "الربط مع Calendly", values: [true, true, true] },
      { label: "نطاق (دومين) فرعي مجاناً", values: [true, true, true] },
      { label: "نطاق (دومين) مخصص", values: [false, true, true] },
      { label: "إزالة شعار أكاديميات", values: [false, false, true] },
      {
        label: "إسناد دورات",
        values: [false, false, true],
        tooltip:
          "إسناد دورات للعميل من داخل لوحة التحكم بدون دفع وبدون استخدام كوبونات.",
      },
      {
        label: "مجتمع أكاديميات الخاص",
        values: [false, true, true],
        tooltip:
          "مجتمع أكاديميات يضم المحترفين وصنّاع المحتوى والمدربين والخبراء ليتبادلوا خبراتهم ويقدّموا الدعم المشترك، يتشاركون التحديات ليؤسّسوا أعمالهم باحترافية لتحقيق أهدافهم — مثل تحديات بناء المنتج الرقمي والتسويق وغيرها.",
      },
      {
        label: "إطلاق سريع للمنصة",
        values: [false, false, true],
        tooltip:
          "٣ ساعات استشارية خلال أول ٢١ يوم من شراء الباقة مع مستشار أكاديميات لتسريع إطلاق المنصة من حيث التصميم وربط جميع الأدوات مثل أدوات التحليل Google Tag Manager و Calendly والنطاق المخصّص.",
      },
    ],
  },
  {
    id: "training",
    title: "التدريب التفاعلي",
    rows: [
      { label: "التعليقات على الدروس", values: [true, true, true] },
      {
        label: "الأنشطة التفاعلية",
        values: [false, true, true],
        tooltip:
          "تتضمّن أنشطة تدريبية داخل المحاضرات — نظام واجبات، موسوعة تفاعلية، نقاشات، حالات دراسية، وقائمة المصطلحات.",
      },
      { label: "اختبارات الإكمال", values: [true, true, true] },
    ],
  },
  {
    id: "marketing",
    title: "التسويق والمبيعات",
    rows: [
      { label: "صفحات الهبوط", values: ["3", "10", "غير محدود"] },
      { label: "شجرة الروابط", values: ["1", "5", "غير محدود"] },
      {
        label: "النشرة البريدية",
        values: ["500 مشترك", "2,000 مشترك", "غير محدود"],
      },
      {
        label: "التسويق بالبريد الإلكتروني",
        values: [
          "500 رسالة شهرياً",
          "1,000 رسالة شهرياً",
          "15,000 رسالة شهرياً",
        ],
      },
      { label: "ربط مواقع التواصل الاجتماعي", values: [true, true, true] },
      { label: "الربط مع Google Tag Manager", values: [true, true, true] },
      { label: "تصدير كوبونات الخصم", values: [false, true, true] },
      { label: "الربط مع Zapier", values: [false, false, true] },
      { label: "كوبونات بنسبة 100%", values: [false, false, true] },
    ],
  },
  {
    id: "payment",
    title: "بوابة الدفع",
    rows: [
      {
        label: "بوابة دفع أكاديميات",
        tooltip: "تكون مفعلة بشكل تلقائي للأكاديمية",
        values: [true, true, true],
      },
      { label: "الربط الفوري مع Stripe", values: [false, false, true] },
      { label: "الربط الفوري مع PayPal", values: [false, false, true] },
      { label: "الربط الفوري مع Tamara", values: [false, false, true] },
      { label: "الربط الفوري مع PayMob", values: [false, false, true] },
      { label: "الربط الفوري مع Tap Company", values: [false, false, true] },
    ],
  },
];
