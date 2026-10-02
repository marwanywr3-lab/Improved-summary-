/**
 * visual-styles-engine.js - مهندس الأنماط والـ Prompts للـ 15 طابعاً بصرياً
 * يقوم ببناء وصف دقيق للصور الموجهة لشرح القوانين والمعادلات العلمية
 */

class VisualStylesEngine {
  constructor() {
    this.selectedStyleId = "chalkboard";
    this.stylesGrid = document.getElementById("stylesGrid");
    this.styleCounter = document.getElementById("activeStyleCounter");
    this.targetDisplay = document.getElementById("targetConceptDisplay");
    this.hiddenContextInput = document.getElementById("selectedConceptContextHidden");
    this.customInstruction = document.getElementById("customInstructionInput");

    // تعريف الـ 15 قالباً بصرياً بدقة عالية
    this.stylesCatalog = {
      chalkboard: {
        id: "chalkboard",
        name: "سبورة أكاديمية",
        promptPrefix: "A warm, high-detail chalkboard illustration on dark slate blackboard. Crisp white and gentle pastel chalk drawings explaining scientific/mathematical formulas. Showing diagrams, coordinate arrows, variable definitions, educational hand-lettered chalkboard calligraphy, cozy classroom academic aesthetic."
      },
      blueprint: {
        id: "blueprint",
        name: "مخطط هندسي تقني",
        promptPrefix: "An exquisite engineering blueprint on muted cyan-blue background with crisp white and cyan architectural measurement grid lines, technical schematic layout, precise callout vectors, isometric geometric projections, clean drafting aesthetic."
      },
      watercolor: {
        id: "watercolor",
        name: "رسم مائي ناعم",
        promptPrefix: "Soft educational watercolor illustration on textured off-white warm cold-press paper. Gentle organic washes of sepia, terracotta, and olive sage. Clean ink contours highlighting conceptual elements, scientific and clear yet deeply artistic."
      },
      vintage_engraving: {
        id: "vintage_engraving",
        name: "حفر المراجع الكلاسيكية",
        promptPrefix: "A 19th-century scientific encyclopedia woodcut engraving. Intricate cross-hatching, copperplate vintage line-art, aged cream paper background, classic naturalist and physical science manual diagram."
      },
      clay_isometric: {
        id: "clay_isometric",
        name: "طين إيزومتري 3D",
        promptPrefix: "A cute 3D isometric tactile miniature scene made of colored clay and plasticine. Smooth rounded surfaces, soft warm studio lighting, clean pastel palette illustrating physical concepts and formulas, playful educational diorama."
      },
      flat_vector: {
        id: "flat_vector",
        name: "فيكتور حديث مبسّط",
        promptPrefix: "Modern minimal vector infographic illustration. Clean geometric shapes, bold flat color palette (cream, warm charcoal, terracotta, olive), uncluttered composition, sharp vector outlines, contemporary educational graphic design."
      },
      geometric_origami: {
        id: "geometric_origami",
        name: "أوريغامي وهندسة ورقية",
        promptPrefix: "Abstract geometric origami folded paper aesthetic. Clean faceted planes, subtle paper textures, warm ambient lighting casting realistic soft shadows, dimensional paper-craft conceptual diagram."
      },
      retro_manual: {
        id: "retro_manual",
        name: "كتيّب إرشادي ريترو",
        promptPrefix: "A 1970s technical handbook manual illustration. Screen-printed halftone dots, muted retro earth tones, clean technical schematics, risograph print texture, vintage instructional diagram."
      },
      schematic_mindmap: {
        id: "schematic_mindmap",
        name: "شجرة وروابط ذهنية",
        promptPrefix: "An elegant schematic concept map. Interconnected nodes, subtle glow pathways, flow arrows detailing formulas and causal relationships, minimal warm background with clear conceptual hierarchy."
      },
      pixel_art: {
        id: "pixel_art",
        name: "بيكسل آرت تعليمي",
        promptPrefix: "Charming 16-bit retro pixel art educational diagram. Meticulously arranged pixels, vibrant yet soft nostalgic color palette, explaining mathematical theorems with game-like isometric clarity."
      },
      paper_cutout: {
        id: "paper_cutout",
        name: "قصاصات ورقية متعددة الطبقات",
        promptPrefix: "Layered paper-cut art with tangible 3D depth. Physical paper shadows between stacked warm cream, ochre, and warm beige cutout layers, minimalist tactile educational craft."
      },
      pastel_lineart: {
        id: "pastel_lineart",
        name: "رسم خطي وظلال باستيل",
        promptPrefix: "Refined minimalist ink line art with soft watercolor pastel highlights. Generous whitespace, elegant flowing calligraphic strokes, modern academic illustration with calm aesthetic."
      },
      kawaii_educational: {
        id: "kawaii_educational",
        name: "تبسيط كرتوني ودود",
        promptPrefix: "Cute, friendly kawaii scientific doodle characters embodying physics or math concepts. Gentle smiling shapes, clear arrows, soft pastel palette, making complex laws instantly approachable and clear."
      },
      cinematic_macro: {
        id: "cinematic_macro",
        name: "مشهد سينمائي دافئ",
        promptPrefix: "A cinematic shallow depth-of-field 3D render. Warm diffused golden hour rim light, macro focus on physical law models and formulas carved in natural wood and brass, premium editorial look."
      },
      holographic_hud: {
        id: "holographic_hud",
        name: "شاشة واجهة بيانات مستقبلية",
        promptPrefix: "A clean, modern translucent futuristic HUD user interface. Glowing thin vectors, mathematical curves, floating coordinate grids, high readability, dark warm-gray backdrop with amber illumination."
      }
    };

    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    if (this.stylesGrid) {
      const cards = this.stylesGrid.querySelectorAll(".style-card");
      cards.forEach((card, index) => {
        card.addEventListener("click", () => {
          cards.forEach((c) => c.classList.remove("selected"));
          card.classList.add("selected");
          this.selectedStyleId = card.getAttribute("data-style-id");
          if (this.styleCounter) {
            this.styleCounter.textContent = `${index + 1} / 15`;
          }
        });
      });
    }
  }

  setTargetFromLaw(buttonElement) {
    const parentBlock = buttonElement.closest(".summary-law-block");
    if (!parentBlock) return;

    const lawTitle = parentBlock.getAttribute("data-concept-target") || parentBlock.querySelector("strong")?.innerText || "";
    const formulaText = parentBlock.querySelector(".summary-law-formula")?.innerText || "";
    const descText = parentBlock.querySelector(".summary-law-desc")?.innerText || "";

    const combinedConcept = `${lawTitle}: ${formulaText}`.trim();
    const fullContext = `${formulaText}. ${descText}`.trim();

    if (this.targetDisplay) {
      this.targetDisplay.textContent = combinedConcept;
      this.targetDisplay.classList.remove("empty");
    }

    if (this.hiddenContextInput) {
      this.hiddenContextInput.value = fullContext;
    }

    const generateBtn = document.getElementById("generateVisualBtn");
    if (generateBtn) generateBtn.disabled = false;

    // تمييز الكتلة المستهدفة بنعومة
    document.querySelectorAll(".summary-law-block").forEach((b) => (b.style.outline = "none"));
    parentBlock.style.outline = "2px solid var(--accent-primary)";
  }

  composeFullPrompt() {
    const targetConcept = this.targetDisplay ? this.targetDisplay.textContent.trim() : "";
    const context = this.hiddenContextInput ? this.hiddenContextInput.value.trim() : "";
    const userNotes = this.customInstruction ? this.customInstruction.value.trim() : "";

    const styleMeta = this.stylesCatalog[this.selectedStyleId] || this.stylesCatalog.chalkboard;

    let prompt = `${styleMeta.promptPrefix} Educational scientific illustration explaining the concept: "${targetConcept}". `;

    if (context) {
      prompt += `Details and contextual formulas to visualize: ${context.slice(0, 300)}. `;
    }

    if (userNotes) {
      prompt += `User focus instruction: ${userNotes}. `;
    }

    prompt += "Clean, high readability, beautiful composition, zero cluttered watermarks, high pedagogical value.";
    return prompt;
  }
}

window.visualStyles = new VisualStylesEngine();
