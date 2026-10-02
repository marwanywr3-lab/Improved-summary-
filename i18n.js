/**
 * i18n.js - محرك الترجمة الشامل (عربي / إنجليزي)
 * يدعم التبديل اللحظي للنصوص وتغيير اتجاه الصفحة RTL/LTR
 */

const translations = {
  ar: {
    app_title: "مُلخّص الرؤى",
    app_badge: "مُدعّم بالرسم التوضيحي",
    btn_api_settings: "مفاتيح API",
    btn_reset: "جديد",
    missing_key_warning: "يُرجى إدخال مفتاح الـ API الخاص بك لتتمكن من التلخيص وتوليد الصور التوضيحية.",
    btn_configure_now: "إعداد المفاتيح الآن",
    panel_source_title: "المستند والمصدر",
    dropzone_prompt: "اسحب كتابك أو ملفك هنا",
    dropzone_types: "يدعم صيغ PDF، TXT، Markdown",
    dropzone_browse: "أو استعرض من جهازك",
    fallback_paste_summary: "أو الصق نصاً دراسياً مباشرة",
    btn_process_text: "تحليل النص",
    concepts_found_heading: "المفاهيم والقوانين المرصودة",
    concepts_empty_hint: "ارفع ملفاً ليبدأ النظام باستخراج القوانين والمفاهيم تلقائياً.",
    summary_depth_label: "نمط التلخيص:",
    depth_detailed: "شامل مع التركيز على القوانين والمفاهيم",
    depth_concise: "موجز مركز (نقاط مراجعة سريعة)",
    depth_formulas: "استخلاص القوانين والمعادلات فقط",
    btn_generate_summary: "توليد الملخص التفاعلي",
    untitled_document: "مستند بدون عنوان",
    tooltip_print: "طباعة الملخص",
    tooltip_export_md: "تصدير كـ Markdown",
    visual_studio_title: "استوديو المفاهيم البصرية",
    studio_ready: "جاهز",
    studio_rendering: "جاري التوليد...",
    label_selected_concept: "المفهوم / القانون المستهدف:",
    hint_select_text_or_concept: "حدد نصاً في الملخص أو اختر مفهوماً من القائمة",
    label_custom_instruction: "تعليمات إضافية للصورة (اختياري):",
    label_choose_style: "اختر الطابع البصري (15 نمطاً متاحاً):",
    btn_render_visual: "إنشاء الصورة التوضيحية",
    preview_empty_state: "ستظهر الصورة التوضيحية الموَّلدة هنا فور اكتمالها.",
    btn_attach_to_summary: "إدراج في الملخص بجانب المفهوم",
    btn_download_img: "حفظ الصورة",
    modal_api_title: "إعدادات مفاتيح الربط (API Keys)",
    modal_api_intro: "تُحفظ مفاتيحك مشفرة محلياً في متصفحك فقط ولا يتم إرسالها إلى أي خادم وسيط. تُرسل الطلبات مباشرة من جهازك لمزود الخدمة.",
    label_ai_provider: "مزود خدمة الذكاء الاصطناعي الأساسي:",
    label_openai_key: "مفتاح OpenAI API Key:",
    label_gemini_key: "مفتاح Google Gemini API Key:",
    tip_badge: "تنبيه أمان:",
    tip_storage_notice: "يمكنك مسح مفاتيحك في أي لحظة بضغطة زر واحدة.",
    btn_delete_keys: "مسح المفاتيح المخزنة",
    btn_save_keys: "حفظ المفاتيح",
    reading_time_format: "~ {time} دقيقة قراءة",
    pages_count_format: "{count} صفحة / مقطع",
    
    // الأساليب الـ 15
    style_chalkboard_name: "سبورة أكاديمية",
    style_chalkboard_desc: "طابع طباشيري دافئ وتوضيحي",
    style_blueprint_name: "مخطط هندسي تقني",
    style_blueprint_desc: "شبكة قياسات دقيقة وخطوط واضحة",
    style_watercolor_name: "رسم مائي ناعم",
    style_watercolor_desc: "ألوان هادئة ونغمات باستيل عضوية",
    style_vintage_name: "حفر المراجع الكلاسيكية",
    style_vintage_desc: "طراز كتب وموسوعات القرن التاسع عشر",
    style_clay_name: "طين إيزومتري 3D",
    style_clay_desc: "مجسمات طينية لطيفة بزاوية إيزومترية",
    style_vector_name: "فيكتور حديث مبسّط",
    style_vector_desc: "أشكال نظيفة وألوان متوازنة ومتباينة",
    style_origami_name: "أوريغامي وهندسة ورقية",
    style_origami_desc: "أبعاد تجريدية بأسلوب ثني الورق",
    style_retromanual_name: "كتيّب إرشادي ريترو",
    style_retromanual_desc: "مطبوعات علمية سبعينية وخطوط تظليل",
    style_mindmap_name: "شجرة وروابط ذهنية",
    style_mindmap_desc: "عقد مترابطة توضح تسلسل المفهوم",
    style_pixel_name: "بيكسل آرت تعليمي",
    style_pixel_desc: "طابع ألعاب كلاسيكي 16-بت جذاب",
    style_papercut_name: "قصاصات ورقية متعددة الطبقات",
    style_papercut_desc: "ظلال حقيقية وعمق فني بارز",
    style_lineart_name: "رسم خطي وظلال باستيل",
    style_lineart_desc: "خطوط سائلة بلمسات تلوين دافئة",
    style_kawaii_name: "تبسيط كرتوني ودود",
    style_kawaii_desc: "أشكال مرحة تشرح القوانين المعقدة",
    style_cinematic_name: "مشهد سينمائي دافئ",
    style_cinematic_desc: "إضاءة حقيقية وعمق ميداني مركز",
    style_hud_name: "شاشة واجهة بيانات مستقبلية",
    style_hud_desc: "مخططات شفافة واضحة وعالية التفاصيل"
  },
  en: {
    app_title: "Visual Summarizer",
    app_badge: "Visual Concept Engine",
    btn_api_settings: "API Keys",
    btn_reset: "New",
    missing_key_warning: "Please configure your API key to generate summaries and educational visual diagrams.",
    btn_configure_now: "Configure Keys Now",
    panel_source_title: "Source Document",
    dropzone_prompt: "Drop your textbook or file here",
    dropzone_types: "Supports PDF, TXT, Markdown",
    dropzone_browse: "Or browse your device",
    fallback_paste_summary: "Or paste text directly",
    btn_process_text: "Process Text",
    concepts_found_heading: "Extracted Laws & Concepts",
    concepts_empty_hint: "Upload a document to extract scientific laws and concepts automatically.",
    summary_depth_label: "Summary Depth:",
    depth_detailed: "Comprehensive (Laws & Core Concepts)",
    depth_concise: "Concise (Quick Revision Bullets)",
    depth_formulas: "Formulas & Definitions Only",
    btn_generate_summary: "Generate Interactive Summary",
    untitled_document: "Untitled Document",
    tooltip_print: "Print Summary",
    tooltip_export_md: "Export as Markdown",
    visual_studio_title: "Visual Concept Studio",
    studio_ready: "Ready",
    studio_rendering: "Generating...",
    label_selected_concept: "Target Concept / Formula:",
    hint_select_text_or_concept: "Highlight text in summary or choose from list",
    label_custom_instruction: "Additional visual instructions (optional):",
    label_choose_style: "Choose Visual Aesthetic (15 Styles):",
    btn_render_visual: "Generate Visual Concept",
    preview_empty_state: "The generated educational visual will appear here.",
    btn_attach_to_summary: "Attach into Summary next to concept",
    btn_download_img: "Save Image",
    modal_api_title: "API Keys Configuration",
    modal_api_intro: "Your keys are stored encrypted locally in your browser. All requests are sent directly to the AI provider.",
    label_ai_provider: "Primary AI Provider:",
    label_openai_key: "OpenAI API Key:",
    label_gemini_key: "Google Gemini API Key:",
    tip_badge: "Security Note:",
    tip_storage_notice: "You can delete your stored keys anytime with a single click.",
    btn_delete_keys: "Clear Stored Keys",
    btn_save_keys: "Save Keys",
    reading_time_format: "~ {time} min read",
    pages_count_format: "{count} pages / sections",

    // 15 Styles
    style_chalkboard_name: "Academic Chalkboard",
    style_chalkboard_desc: "Warm classroom blackboard chalk style",
    style_blueprint_name: "Technical Blueprint",
    style_blueprint_desc: "Precise engineering grid lines",
    style_watercolor_name: "Soft Watercolor",
    style_watercolor_desc: "Gentle organic pastel wash",
    style_vintage_name: "Vintage Textbook Engraving",
    style_vintage_desc: "19th-century scientific encyclopedia style",
    style_clay_name: "3D Isometric Clay",
    style_clay_desc: "Tactile plasticine models in isometric angle",
    style_vector_name: "Minimal Modern Vector",
    style_vector_desc: "Clean flat geometric shapes",
    style_origami_name: "Geometric Origami",
    style_origami_desc: "Paper-folded dimensional representations",
    style_retro_manual_name: "Retro Field Guide",
    style_retro_manual_desc: "1970s scientific handbook hatching",
    style_schematic_mindmap_name: "Schematic Mind Map",
    style_schematic_mindmap_desc: "Interconnected conceptual nodes",
    style_pixel_art_name: "Educational Pixel Art",
    style_pixel_art_desc: "Nostalgic 16-bit diagram aesthetic",
    style_paper_cutout_name: "Layered Paper Cutout",
    style_paper_cutout_desc: "Crafted layered shadows and depth",
    style_pastel_lineart_name: "Pastel Line Art",
    style_pastel_lineart_desc: "Clean ink lines with soft fills",
    style_kawaii_educational_name: "Friendly Visuals",
    style_kawaii_educational_desc: "Approachable friendly scientific doodles",
    style_cinematic_macro_name: "Warm Cinematic Macro",
    style_cinematic_macro_desc: "Focused lighting and depth-of-field",
    style_holographic_hud_name: "Futuristic Data HUD",
    style_holographic_hud_desc: "Transparent high-tech data display"
  }
};

class I18nManager {
  constructor() {
    this.currentLang = localStorage.getItem("app_lang") || "ar";
    this.init();
  }

  init() {
    this.applyLanguage(this.currentLang);
    const toggleBtn = document.getElementById("langToggleBtn");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => this.toggle());
    }
  }

  t(key, params = {}) {
    let str = translations[this.currentLang][key] || key;
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(`{${k}}`, v);
    }
    return str;
  }

  applyLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem("app_lang", lang);

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    const langLabel = document.getElementById("currentLangLabel");
    if (langLabel) {
      langLabel.textContent = lang === "ar" ? "EN" : "عربي";
    }

    // تحديث النصوص العادية
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });

    // تحديث العناوين التوضيحية (Tooltips)
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      if (translations[lang][key]) {
        el.setAttribute("title", translations[lang][key]);
      }
    });
  }

  toggle() {
    const nextLang = this.currentLang === "ar" ? "en" : "ar";
    this.applyLanguage(nextLang);
  }
}

// تهيئة الترجمة وجعلها متاحة عالمياً
window.i18n = new I18nManager();
