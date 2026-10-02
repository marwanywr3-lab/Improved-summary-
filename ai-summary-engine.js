/**
 * ai-summary-engine.js - محرك التلخيص الذكي وتحليل المفاهيم
 * يتصل بمزودي الذكاء الاصطناعي (OpenAI / Gemini) مباشرة عبر متصفح العميل
 */

class AISummaryEngine {
  constructor() {
    this.summarizeBtn = document.getElementById("startSummarizeBtn");
    this.summaryDepthSelect = document.getElementById("summaryDepthSelect");
    this.summaryCanvas = document.getElementById("summaryCanvas");
    this.readingTimeBadge = document.getElementById("readingTimeIndicator");
    this.loader = document.getElementById("globalLoader");
    this.loaderMsg = document.getElementById("loaderMessage");

    this.init();
  }

  init() {
    if (this.summarizeBtn) {
      this.summarizeBtn.addEventListener("click", () => this.generateSummary());
    }

    // رصد تحديد النصوص داخل المحرر لاختيار المفهوم تلقائياً
    if (this.summaryCanvas) {
      this.summaryCanvas.addEventListener("mouseup", () => this.handleTextSelection());
    }
  }

  handleTextSelection() {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText.length > 2 && selectedText.length < 120) {
      const chip = document.getElementById("targetConceptDisplay");
      const hiddenCtx = document.getElementById("selectedConceptContextHidden");
      const generateBtn = document.getElementById("generateVisualBtn");

      if (chip) {
        chip.textContent = selectedText;
        chip.classList.remove("empty");
      }
      if (hiddenCtx) {
        hiddenCtx.value = selectedText;
      }
      if (generateBtn) {
        generateBtn.disabled = false;
      }
    }
  }

  setLoading(isLoading, message = "") {
    if (!this.loader) return;
    if (isLoading) {
      this.loader.classList.remove("hidden");
      if (this.loaderMsg && message) this.loaderMsg.textContent = message;
    } else {
      this.loader.classList.add("hidden");
    }
  }

  async generateSummary() {
    if (!window.storageKeys || !window.storageKeys.hasValidKey()) {
      alert(window.i18n ? window.i18n.t("missing_key_warning") : "يرجى إدخال مفتاح الـ API أولاً.");
      if (window.storageKeys) window.storageKeys.openModal();
      return;
    }

    const rawText = window.docParser ? window.docParser.rawContent : "";
    if (!rawText || rawText.trim().length === 0) {
      alert("يرجى رفع ملف أو لصق نص دراسي للتلخيص.");
      return;
    }

    const depth = this.summaryDepthSelect ? this.summaryDepthSelect.value : "detailed";
    const { provider, key } = window.storageKeys.getActiveCredentials();

    this.setLoading(true, "جاري استقراء الكتاب وتلخيص القوانين والمفاهيم...");

    try {
      const summaryHtml = await this.requestSummaryFromAI(provider, key, rawText, depth);
      this.renderSummary(summaryHtml);
    } catch (error) {
      console.error("Summary Generation Error:", error);
      alert(`حدث خطأ أثناء التلخيص: ${error.message}`);
    } finally {
      this.setLoading(false);
    }
  }

  buildSystemPrompt(depth) {
    const lang = window.i18n ? window.i18n.currentLang : "ar";
    const isAr = lang === "ar";

    let depthGuidance = "";
    if (depth === "concise") {
      depthGuidance = isAr
        ? "لخص النص بنقاط رئيسية موجزة وسريعة، مركزاً على الاستنتاجات الأساسية فقط."
        : "Summarize into concise, high-impact bullet points and quick takeaways.";
    } else if (depth === "formulas_only") {
      depthGuidance = isAr
        ? "استخرج القوانين الحسابية والفيزيائية والنظريات فقط، مع شرح مدلول كل متغير داخل صندوق القانون."
        : "Extract scientific and mathematical formulas and laws exclusively, describing variables for each.";
    } else {
      depthGuidance = isAr
        ? "قدم تلخيصاً أكاديمياً متكاملاً، مقسماً إلى مقدمة فكرية، وفقرات للمفاهيم، وصناديق مميزة لكل قانون أو معادلة."
        : "Provide a comprehensive academic breakdown: overview, structured concept sections, and designated formula blocks.";
    }

    return `
You are a premier educational text summarizer designed to help students study mathematics, science, and technical books.
Language requirement: Output MUST be in ${isAr ? "Arabic (اللغة العربية)" : "English"}.
Instructions:
1. Output valid and semantic HTML elements without wrapping them in \`\`\`html markdown.
2. Structure your summary using <h3> for section titles, <p> for explanations, and <ul>/<li> for lists.
3. CRITICAL: Whenever you mention a scientific law, mathematical formula, or foundational theorem, put it inside a special block like this:
<div class="summary-law-block" data-concept-target="[Short Name of Law]">
  <div class="summary-law-header">
    <strong>[Law or Theorem Name]</strong>
    <button type="button" class="btn-outline-sm btn-quick-visual" onclick="window.visualStyles.setTargetFromLaw(this)">توليد رسم توضيحي</button>
  </div>
  <div class="summary-law-formula">[The mathematical expression or law formula]</div>
  <p class="summary-law-desc">[Concise explanation of the variables and application]</p>
</div>
4. Depth directive: ${depthGuidance}
5. Maintain a clean, elegant, educational tone.
    `.trim();
  }

  async requestSummaryFromAI(provider, key, text, depth) {
    const prompt = this.buildSystemPrompt(depth);
    const trimmedInput = text.slice(0, 18000); // إبقاء النص ضمن نافذة السياق السريعة

    if (provider === "openai") {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: `Here is the document content to summarize:\n\n${trimmedInput}` }
          ],
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "فشل الاتصال بـ OpenAI API");
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } else {
      // الاتصال بـ Google Gemini API
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { text: `المستند المراد تلخيصه:\n${trimmedInput}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3
          }
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "فشل الاتصال بـ Google Gemini API");
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    }
  }

  renderSummary(htmlContent) {
    if (!this.summaryCanvas) return;

    // تنظيف أي علامات ماركداون برمجية زائدة
    let cleanHtml = htmlContent.replace(/```html/gi, "").replace(/```/g, "").trim();
    this.summaryCanvas.innerHTML = cleanHtml;

    // حساب وقت القراءة التقريبي
    const wordCount = this.summaryCanvas.innerText.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 180));

    if (this.readingTimeBadge) {
      this.readingTimeBadge.textContent = window.i18n 
        ? window.i18n.t("reading_time_format", { time: minutes })
        : `~ ${minutes} دقيقة قراءة`;
    }
  }
}

window.aiSummary = new AISummaryEngine();
