/**
 * chatbot-engine.js - محرك الشات بوت التفاعلي الذكي
 * يقرأ سياق الملخص الحالي، ويجيب عن الاستفسارات، وينشئ الصور بطلب مباشر من الدردشة
 */

class ChatbotEngine {
  constructor() {
    this.floatingBtn = document.getElementById("chatFloatingToggleBtn");
    this.chatBox = document.getElementById("chatFloatingBox");
    this.closeBtn = document.getElementById("closeChatWidgetBtn");
    this.messagesContainer = document.getElementById("chatWidgetMessages");
    this.inputField = document.getElementById("chatWidgetInput");
    this.sendBtn = document.getElementById("chatWidgetSendBtn");

    this.conversationHistory = [];
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    if (this.floatingBtn) {
      this.floatingBtn.addEventListener("click", () => this.toggleChat());
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.toggleChat(false));
    }

    if (this.sendBtn) {
      this.sendBtn.addEventListener("click", () => this.handleSendMessage());
    }

    if (this.inputField) {
      this.inputField.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      });
    }
  }

  toggleChat(forceState) {
    if (!this.chatBox) return;
    const shouldShow = forceState !== undefined ? forceState : this.chatBox.classList.contains("hidden");
    if (shouldShow) {
      this.chatBox.classList.remove("hidden");
      if (this.inputField) this.inputField.focus();
    } else {
      this.chatBox.classList.add("hidden");
    }
  }

  appendMessage(text, sender = "bot", isHtml = false) {
    if (!this.messagesContainer) return;
    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-msg chat-msg-${sender}`;

    if (isHtml) {
      msgDiv.innerHTML = text;
    } else {
      msgDiv.textContent = text;
    }

    this.messagesContainer.appendChild(msgDiv);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  async handleSendMessage() {
    const text = this.inputField.value.trim();
    if (!text) return;

    if (!window.storageKeys || !window.storageKeys.hasValidKey()) {
      alert("يرجى إدخال مفتاح الـ API الخاص بك أولاً لاستخدام الشات بوت.");
      if (window.storageKeys) window.storageKeys.openModal();
      return;
    }

    this.inputField.value = "";
    this.appendMessage(text, "user");

    // فحص ما إذا كان المستخدم يطلب رسم أو توليد صورة مباشرة
    const isImageRequest = /(?:ارسم|صورة|رسمة|توليد صورة|وضح برسم|image|draw|generate image)/i.test(text);

    if (isImageRequest) {
      await this.triggerImageFromChat(text);
      return;
    }

    // الرد العادي عبر الذكاء الاصطناعي مع سياق الملخص الحالي
    await this.queryAiAssistant(text);
  }

  getCurrentSummaryContext() {
    const canvas = document.getElementById("summaryCanvas");
    if (canvas && canvas.innerText.trim().length > 10) {
      return canvas.innerText.slice(0, 4000);
    }
    const raw = window.docParser ? window.docParser.rawContent : "";
    return raw.slice(0, 4000);
  }

  async queryAiAssistant(userQuery) {
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "chat-msg chat-msg-bot";
    typingIndicator.textContent = "جاري التفكير...";
    this.messagesContainer.appendChild(typingIndicator);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

    const { provider, key } = window.storageKeys.getActiveCredentials();
    const currentContext = this.getCurrentSummaryContext();

    const systemPrompt = `
You are an intelligent tutor embedded in a book summarization app.
Document context:
"""
${currentContext || "No document loaded yet."}
"""
Instructions:
1. Answer the student accurately using the document context above.
2. If they ask about a law, explain its variables and applications concisely.
3. Keep responses warm, engaging, and directly to the point.
    `.trim();

    try {
      let botReply = "";

      if (provider === "openai") {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${key}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              ...this.conversationHistory.slice(-4),
              { role: "user", content: userQuery }
            ],
            temperature: 0.4
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "OpenAI error");
        botReply = data.choices[0].message.content;
      } else {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: systemPrompt },
                  { text: userQuery }
                ]
              }
            ]
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Gemini error");
        botReply = data.candidates[0].content.parts[0].text;
      }

      typingIndicator.remove();
      this.appendMessage(botReply, "bot");

      this.conversationHistory.push({ role: "user", content: userQuery });
      this.conversationHistory.push({ role: "assistant", content: botReply });
    } catch (err) {
      typingIndicator.remove();
      this.appendMessage(`حدث خطأ: ${err.message}`, "bot");
    }
  }

  async triggerImageFromChat(userText) {
    const cleanConcept = userText
      .replace(/(?:ارسم|صورة|رسمة|توليد صورة|وضح برسم|image|draw|generate image)\s*(?:لي|عن|لـ|for|of)?/gi, "")
      .trim();

    const targetConcept = cleanConcept.length > 2 ? cleanConcept : "المفهوم المطلوب";

    this.appendMessage(`أمرك! جاري إرسال "${targetConcept}" إلى استوديو المفاهيم البصرية وتوليد الصورة فوراً...`, "bot");

    // تعيين المفهوم في الاستوديو الجانبي
    const chip = document.getElementById("targetConceptDisplay");
    const hiddenCtx = document.getElementById("selectedConceptContextHidden");
    if (chip) {
      chip.textContent = targetConcept;
      chip.classList.remove("empty");
    }
    if (hiddenCtx) {
      hiddenCtx.value = this.getCurrentSummaryContext().slice(0, 300);
    }

    if (window.imageGenerator) {
      try {
        await window.imageGenerator.generateVisual();
        const imgUrl = window.imageGenerator.currentGeneratedImageUrl;
        if (imgUrl) {
          const cardHtml = `
            <div>تم إنشاء الصورة بنجاح!</div>
            <img src="${imgUrl}" style="max-width: 100%; border-radius: 8px; margin-top: 6px; display: block;" alt="${targetConcept}">
            <button class="btn-accent-sm" style="margin-top: 6px; width: 100%;" onclick="window.editorExport.insertImageNextToTarget()">إدراجها في الملخص</button>
          `;
          this.appendMessage(cardHtml, "bot", true);
        }
      } catch (e) {
        this.appendMessage(`تعذر إنشاء الصورة: ${e.message}`, "bot");
      }
    }
  }
}

window.chatbot = new ChatbotEngine();
