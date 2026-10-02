/**
 * document-parser.js - محرك قراءة واستخراج النصوص والمفاهيم الرياضية
 * يدعم قراءة ملفات TXT, Markdown, واستخراج القوانين والمعادلات تلقائياً
 */

class DocumentParser {
  constructor() {
    this.rawContent = "";
    this.docTitle = "";
    this.sections = [];
    this.extractedConcepts = [];

    this.dropZone = document.getElementById("dropZone");
    this.fileInput = document.getElementById("fileInput");
    this.browseBtn = document.getElementById("browseFileBtn");
    this.statsBadge = document.getElementById("sourceStats");
    this.conceptsContainer = document.getElementById("conceptsListContainer");
    this.activeTitleDisplay = document.getElementById("activeDocTitle");
    this.summarizeBtn = document.getElementById("startSummarizeBtn");

    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    if (this.browseBtn && this.fileInput) {
      this.browseBtn.addEventListener("click", () => this.fileInput.click());
    }

    if (this.fileInput) {
      this.fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) this.handleUploadedFile(file);
      });
    }

    // السحب والإفلات
    if (this.dropZone) {
      ["dragenter", "dragover"].forEach((eventName) => {
        this.dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          this.dropZone.classList.add("drag-active");
        });
      });

      ["dragleave", "drop"].forEach((eventName) => {
        this.dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          this.dropZone.classList.remove("drag-active");
        });
      });

      this.dropZone.addEventListener("drop", (e) => {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        if (file) this.handleUploadedFile(file);
      });
    }

    // معالجة النصوص الملصقة يدوياً
    const processPasteBtn = document.getElementById("processPastedTextBtn");
    const pasteInput = document.getElementById("rawTextPasteInput");
    if (processPasteBtn && pasteInput) {
      processPasteBtn.addEventListener("click", () => {
        const text = pasteInput.value.trim();
        if (!text) return alert("يرجى لصق نص أولاً.");
        this.loadRawText(text, "مستند مدخل يدوياً");
      });
    }
  }

  async handleUploadedFile(file) {
    this.docTitle = file.name.replace(/\.[^/.]+$/, "");
    if (this.activeTitleDisplay) this.activeTitleDisplay.textContent = this.docTitle;

    const extension = file.name.split(".").pop().toLowerCase();

    if (extension === "txt" || extension === "md") {
      const text = await file.text();
      this.loadRawText(text, this.docTitle);
    } else if (extension === "pdf") {
      // قراءة مبسطة للـ PDF المتوافق أو طلب النص المباشر
      this.showPdfNotice(file);
    } else {
      alert("صيغة الملف غير مدعومة حالياً. يرجى اختيار ملف PDF أو TXT أو MD.");
    }
  }

  showPdfNotice(file) {
    // تلميح تعليمي عند رفع ملف PDF ثنائي
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target.result;
      // استخلاص سلاسل النصوص الواضحة من الـ PDF
      const extractedMatches = result.match(/[\x20-\x7E\u0600-\u06FF]{4,}/g) || [];
      const roughText = extractedMatches.join(" ");
      if (roughText.length > 200) {
        this.loadRawText(roughText, file.name);
      } else {
        alert("تنبيه: لقراءة الكتب المصورة بصيغة PDF بدقة أعلى، يفضل نسخ ولصق النص الدراسي داخل الصندوق المخصص.");
      }
    };
    reader.readAsBinaryString(file);
  }

  loadRawText(text, title) {
    this.rawContent = text;
    this.docTitle = title || "مستند دراسي";

    if (this.activeTitleDisplay) {
      this.activeTitleDisplay.textContent = this.docTitle;
    }

    this.segmentText();
    this.extractFormulasAndConcepts();
    this.renderConceptsList();

    if (this.summarizeBtn) {
      this.summarizeBtn.disabled = false;
    }
  }

  segmentText() {
    // تقسيم النص لفصول أو فقرات رئيسية
    this.sections = this.rawContent
      .split(/\n\s*\n|(?<=[.!?؟])\s{2,}/)
      .map((s) => s.trim())
      .filter((s) => s.length > 30);

    const count = this.sections.length || 1;
    if (this.statsBadge) {
      const label = window.i18n ? window.i18n.t("pages_count_format", { count }) : `${count} مقطع`;
      this.statsBadge.textContent = label;
    }
  }

  extractFormulasAndConcepts() {
    this.extractedConcepts = [];
    const text = this.rawContent;

    // استخراج القوانين والمعادلات الرياضية والعلمية
    const formulaPatterns = [
      /(?:قانون|معادلة|نظرية|Formula|Theorem|Law)\s*[:：\-]?\s*([^\n.؛]{3,40})/gi,
      /([A-Za-z]\s*=\s*[^.\n]{3,35})/g,
      /([a-zA-Z\u0621-\u064A]+\s*=\s*[0-9a-zA-Z\u0621-\u064A\s\+\-\*\/\^\(\)]+)/g
    ];

    formulaPatterns.forEach((regex) => {
      let match;
      while ((match = regex.exec(text)) !== null) {
        const found = match[1] ? match[1].trim() : match[0].trim();
        if (found.length > 3 && !this.extractedConcepts.some((c) => c.title === found)) {
          this.extractedConcepts.push({
            title: found,
            type: "قانون / معادلة",
            context: this.findSurroundingContext(match.index)
          });
        }
      }
    });

    // إضافة المفاهيم العامة إن لم توجد قوانين صريحة
    if (this.extractedConcepts.length === 0) {
      this.sections.slice(0, 5).forEach((sec, idx) => {
        const words = sec.split(" ").slice(0, 4).join(" ");
        this.extractedConcepts.push({
          title: `المفهوم: ${words}...`,
          type: "مفهوم رئيسي",
          context: sec
        });
      });
    }
  }

  findSurroundingContext(index) {
    const start = Math.max(0, index - 200);
    const end = Math.min(this.rawContent.length, index + 300);
    return this.rawContent.substring(start, end);
  }

  renderConceptsList() {
    if (!this.conceptsContainer) return;
    this.conceptsContainer.innerHTML = "";

    if (this.extractedConcepts.length === 0) {
      this.conceptsContainer.innerHTML = `<div class="empty-state-card">لم يتم العثور على قوانين مباشرة، يمكنك تحديد أي نص يدوياً لتوليد رسم له.</div>`;
      return;
    }

    this.extractedConcepts.forEach((item, i) => {
      const card = document.createElement("div");
      card.className = "concept-item-card";
      card.innerHTML = `
        <span class="concept-item-title">${item.title}</span>
        <span class="concept-item-type">${item.type}</span>
      `;

      card.addEventListener("click", () => {
        this.selectConceptForVisual(item);
      });

      this.conceptsContainer.appendChild(card);
    });
  }

  selectConceptForVisual(item) {
    const chip = document.getElementById("targetConceptDisplay");
    const hiddenCtx = document.getElementById("selectedConceptContextHidden");
    const generateBtn = document.getElementById("generateVisualBtn");

    if (chip) {
      chip.textContent = item.title;
      chip.classList.remove("empty");
    }

    if (hiddenCtx) {
      hiddenCtx.value = item.context;
    }

    if (generateBtn) {
      generateBtn.disabled = false;
    }
  }
}

window.docParser = new DocumentParser();
