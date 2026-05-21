/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Formats a KnodePackage object into a structured Markdown file 
 * that acts as a perfect source for NotebookLM slide generation.
 * Supports both English and Tamil headers based on the package or active rendering.
 */
export function formatPackageToMarkdown(pkg, language = "en") {
  const isTa = language === "ta" || pkg.lang === "ta";
  
  let md = isTa 
    ? `# பிரசன்டேஷன் வடிவம்: ${pkg.title}\n\n`
    : `# Presentation Outline: ${pkg.title}\n\n`;
    
  md += isTa 
    ? `> **மூல குறியீடு (Source ID):** ${pkg.id}\n`
    : `> **Source ID:** ${pkg.id}\n`;
    
  md += isTa
    ? `> **உருவாக்கப்பட்ட தேதி:** ${new Date(pkg.createdAt).toLocaleDateString()}\n\n`
    : `> **Generated On:** ${new Date(pkg.createdAt).toLocaleDateString()}\n\n`;
  
  md += isTa 
    ? `## 🎯 கற்றல் நோக்கங்கள் (Learning Objectives)\n\n`
    : `## 🎯 Learning Objectives\n\n`;
    
  if (pkg.learningObjectives && pkg.learningObjectives.length > 0) {
    pkg.learningObjectives.forEach((obj) => {
      md += `- ${obj}\n`;
    });
  } else {
    md += isTa ? `*நோக்கங்கள் எதுவும் வரையறுக்கப்படவில்லை.*\n` : `*No global objectives defined.*\n`;
  }
  md += `\n---\n\n`;

  md += isTa 
    ? `## 📖 கலைச்சொல் அகராதி (Key Vocabulary & Glossary)\n\n`
    : `## 📖 Key Vocabulary & Glossary\n\n`;
    
  if (pkg.keyVocabulary && pkg.keyVocabulary.length > 0) {
    pkg.keyVocabulary.forEach((item) => {
      md += `- **${item.term}**: ${item.definition}\n`;
    });
  } else {
    md += isTa ? `*அகராதி இன்னும் உருவாக்கப்படவில்லை.*\n` : `*No glossary terms defined.*\n`;
  }
  md += `\n---\n\n`;

  md += isTa 
    ? `## 🛝 ஸ்லைடு வாரியாக கட்டமைப்பு விவரங்கள் (Slide-by-Slide Structural Breakdown)\n\n`
    : `## 🛝 Slide-by-Slide Structural Breakdown\n\n`;
    
  md += isTa
    ? `நோட்புக்எல்எம் அறிவுறுத்தல்கள்: பிரசன்டேஷனை உருவாக்க பின்வரும் ஸ்லைடு விவரங்களை கவனமாகப் படியுங்கள்.\n\n`
    : `NotebookLM Instructions: Read the following slide specs to compile a cohesive, professional presentation slide-by-slide.\n\n`;

  pkg.slides.forEach((slide, idx) => {
    md += isTa ? `### ஸ்லைடு ${idx + 1}: ${slide.title}\n\n` : `### SLIDE ${idx + 1}: ${slide.title}\n\n`;
    
    md += isTa ? `#### 📌 முக்கிய கருத்துக்கள் & செய்தி குறிப்புகள்\n` : `#### 📌 Core Content & Key Message Bullet Points\n`;
    if (slide.bulletPoints && slide.bulletPoints.length > 0) {
      slide.bulletPoints.forEach((bp) => {
        md += `- ${bp}\n`;
      });
    } else {
      md += isTa ? `*ஸ்லைடு விவரங்கள் காலியாக உள்ளது.*\n` : `*No bullet points defined for this slide.*\n`;
    }
    md += `\n`;

    md += isTa ? `#### 🗣️ பேச்சாளர் குறிப்புகள் (என்ன பேச வேண்டும்)\n` : `#### 🗣️ Speaker Notes (What to say)\n`;
    md += `${slide.speakerNotes || (isTa ? "*( presenter notes இல்லை)*" : "*(No presenter notes suggested)*")}\n\n`;

    md += isTa ? `#### 🎨 காட்சி ஆலோசனைகள் (மாடல்கள், வரைபடங்கள், விளக்கப்படங்கள்)\n` : `#### 🎨 Visual Suggestions (Artwork, layouts, diagrams, charts)\n`;
    md += isTa 
      ? `*காட்சி விளக்கம்:* ${slide.visualSuggestion || "*(காட்சி வழிகாட்டுதல் இல்லை)*"}\n\n`
      : `*Visual Description:* ${slide.visualSuggestion || "*(No visual guidance requested)*"}\n\n`;

    if (slide.keyVocabulary && slide.keyVocabulary.length > 0) {
      md += isTa 
        ? `#### 🔑 தொடர்புடைய கலைச்சொற்கள்: \`${slide.keyVocabulary.join(", ")}\`\n\n`
        : `#### 🔑 Relevant Terms: \`${slide.keyVocabulary.join(", ")}\`\n\n`;
    }

    md += `---\n\n`;
  });

  md += isTa 
    ? `*இந்த ஆவணம் நோட்புக்எல்எம் மூலம் ஸ்லைடு உள்ளடக்கங்களை சரியாக உருவாக்க க்னோடு (Knode) மூலம் வடிவமைக்கப்பட்டுள்ளது.*`
    : `*This document is structured using Knode to yield premium slide deck quality outputs from NotebookLM.*`;

  return md;
}
