/**
 * editor-export.js - المحرر التفاعلي لربط الصور بالنصوص وتصدير الملخص النهائي
 * يدعم إضافة الرسوم بجانب القوانين بضغطة زر وتصدير Markdown والطباعة / PDF
 */

class EditorExportManager {
  constructor() {
    this.canvas = document.getElementById("summaryCanvas");
    this.attachBtn = document.getElementById("insertIntoSummaryBtn");
    this.printBtn = document.getElementById("printDocBtn");
    this.exportMdBtn = document.getElementById("exportMarkdownBtn");
    this.resetBtn = document.getElementById("resetSessionBtn");

    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    if (this.attachBtn) {
      this.attachBtn.addEventListener("click", () => this.insertImageNextToTarget());
    }

    if (this.printBtn) {
      this.printBtn.addEventListener("click", () => this.printDocument());
    }

    if (this.exportMdBtn) {
      this.exportMdBtn.addEventListener("click", () => this.exportMarkdown());
    }

    if (this.resetBtn) {
      this.resetBtn.addEventListener("click", () => this.resetWorkspace());
    }
  }

  insertImageNextToTarget() {
    if (!window.imageGenerator || !window.imageGenerator.currentGeneratedImageUrl) {
      alert("لا توجد صورة مولدة حالياً لإدراجها.");
      return;
    }

    const imgUrl = window.imageGenerator.currentGeneratedImageUrl;
    const conceptName = window.imageGenerator.currentConceptName || "رسم توضيحي للمفهوم";

    // إنشاء كتلة الصورة الأنيقة والمدمجة
    const figure = document.createElement("figure");
    figure.className = "embedded-concept-figure";
    figure.contentEditable = "false";
    figure.innerHTML = `
      <img src="${imgUrl}" alt="${conceptName}">
      <figcaption class="figure-caption">
        <strong>رسم توضيحي:</strong> ${conceptName}
      </figcaption>
    `;

    // البحث عن الكتلة المحددة حالياً أو المطابقة للاسم
    const highlightedBlock = document.querySelector(".summary-law-block[style*='outline']");

    if (highlightedBlock) {
      highlightedBlock.insertAdjacentElement("afterend", figure);
      highlightedBlock.style.outline = "none";
      alert("تم إدراج الرسم التوضيحي بجانب القانون المستهدف بنجاح!");
      return;
    }

    // إذا لم يحدد كتلة محددة، يدرجها مكان مؤشر الكتابة داخل المحرر
    const sel = window.getSelection();
    if (sel.rangeCount > 0 && this.canvas.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(figure);
      alert("تم إدراج الرسم داخل الملخص بنجاح!");
    } else {
      // إدراجها في نهاية الملخص
      this.canvas.appendChild(figure);
      alert("تمت إضافة الرسم التوضيحي في نهاية الملخص!");
    }
  }

  printDocument() {
    window.print();
  }

  exportMarkdown() {
    if (!this.canvas) return;

    let text = `# ${document.getElementById("activeDocTitle")?.textContent || "ملخص كتاب"}\n\n`;

    // تحويل محتوى المحرر إلى نصوص بصيغة Markdown
    const childNodes = Array.from(this.canvas.childNodes);

    childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent.trim()) text += `${node.textContent.trim()}\n\n`;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName.toLowerCase();

        if (tag === "h1" || tag === "h2" || tag === "h3") {
          text += `### ${node.innerText}\n\n`;
        } else if (tag === "p") {
          text += `${node.innerText}\n\n`;
        } else if (node.classList.contains("summary-law-block")) {
          const title = node.querySelector("strong")?.innerText || "قانون";
          const formula = node.querySelector(".summary-law-formula")?.innerText || "";
          const desc = node.querySelector(".summary-law-desc")?.innerText || "";
          text += `> **${title}**\n> \`\`\`\n> ${formula}\n> \`\`\`\n> ${desc}\n\n`;
        } else if (node.classList.contains("embedded-concept-figure")) {
          const img = node.querySelector("img");
          const caption = node.querySelector("figcaption")?.innerText || "Concept Illustration";
          if (img) text += `![${caption}](${img.src})\n\n`;
        } else {
          text += `${node.innerText}\n\n`;
        }
      }
    });

    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "summary-notes.md";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  resetWorkspace() {
    const confirmMsg = window.i18n && window.i18n.currentLang === "ar"
      ? "هل تريد تفريغ مساحة العمل والبدء بملف جديد؟"
      : "Reset workspace and start a new document?";

    if (confirm(confirmMsg)) {
      if (this.canvas) this.canvas.innerHTML = "";
      if (document.getElementById("activeDocTitle")) {
        document.getElementById("activeDocTitle").textContent = "مستند بدون عنوان";
      }
      if (document.getElementById("readingTimeIndicator")) {
        document.getElementById("readingTimeIndicator").textContent = "~ 0 دقيقة قراءة";
      }
      if (document.getElementById("sourceStats")) {
        document.getElementById("sourceStats").textContent = "0 صفحة / مقطع";
      }
      if (document.getElementById("conceptsListContainer")) {
        document.getElementById("conceptsListContainer").innerHTML = `<div class="empty-state-card">ارفع ملفاً ليبدأ النظام باستخراج القوانين والمفاهيم تلقائياً.</div>`;
      }
      if (document.getElementById("rawTextPasteInput")) {
        document.getElementById("rawTextPasteInput").value = "";
      }
      if (window.docParser) {
        window.docParser.rawContent = "";
      }
    }
  }
}

window.editorExport = new EditorExportManager();
