/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BookOpen, Sparkles, FileDown, Upload, ArrowRight } from "lucide-react";

export function OnboardingGuide({ language = "en" }) {
  const isTa = language === "ta";

  const t = {
    title: isTa ? "நோட்புக்எல்எம் ஒருங்கிணைப்பு வழிகாட்டி" : "NotebookLM Integration Guide",
    subtitle: isTa ? "ஸ்லைடு உருவாக்குதலின் தரத்தை அதிகரிக்கவும்" : "Maximize slide generation quality",
    desc: isTa 
      ? "நோட்புக்எல்எம் (NotebookLM) என்பது ஒரு மேம்பட்ட அறிவுத்திறன் கொண்ட ஒருங்கிணைந்த தளமாகும். குழப்பமான, முழுமையற்ற உரைகளை விட, மிகவும் ஒழுங்குபடுத்தப்பட்ட வடிவத்தைப் பயன்படுத்தும் போது இது மிகச் சிறந்த ஸ்லைடுகளைத் தரும். க்னோடு (Knode) உங்கள் பொருள்களை ஸ்லைடு வாரியாக வடிவமைத்து, நோட்புக்எல்எம்-க்கு துல்லியமான வழிகாட்டுதலை வழங்கி மேலாண்மை செய்கிறது."
      : "NotebookLM is an advanced intelligence workspace. It performs exceptionally well when starting with a highly structured spec rather than a raw, messy document. The Knode Package formats your material slide-by-slide with objectives, bullet points, speaker guidance, and visual descriptions, instructing NotebookLM precisely what to build.",
    step1Title: isTa ? "1. மூலத்தை ஏற்றுமதி செய்க" : "1. Export Knode Source",
    step1Desc: isTa 
      ? "உங்கள் ஸ்லைடுகள் தனிப்பயனாக்கப்பட்டதும், ஒழுங்குபடுத்தப்பட்ட மார்க் டவுன் (.md) கோப்பைச் சேமிக்க 'NotebookLM மூலத்தைப் பதிவிறக்கு' என்பதைக் கிளிக் செய்யவும்."
      : "Once your slides are customized, click 'Download NotebookLM Source' to save the structured Markdown (.md) file.",
    step2Title: isTa ? "2. நோட்புக்எல்எம்-இல் ஏற்றவும்" : "2. Load into NotebookLM",
    step2Desc: isTa 
      ? "NotebookLM (notebooklm.google) தளத்திற்குச் சென்று, புதிய நோட்புக்கைத் திறந்து, பதிவிறக்கிய மார்க் டவுன் (.md) கோப்பை பதிவேற்றவும்."
      : "Go to NotebookLM (notebooklm.google), open a new notebook, and upload the exported Markdown file directly as a source.",
    step3Title: isTa ? "3. நேரடி ஸ்லைடு உருவாக்கம்" : "3. Direct Slide Generation",
    step3Desc: isTa 
      ? "நோட்புக்எல்எம் சாட்டில்: 'இங்குள்ள ஸ்லைடு முறிவைக் கொண்டு ஒரு தொழில்முறை பிரசன்டேஷனைத் தயாரித்துத் தரவும்' என்று கேட்கவும்."
      : "Ask NotebookLM's chat: 'Using the SLIDE BREAKDOWN in this source, write a professional presentation' or use it to generate structured summaries, scripts, or Q&A.",
    promptTitle: isTa ? "பரிந்துரைக்கப்படும் நோட்புக்எல்எம் சாட் ப்ராம்ப்ட்:" : "Recommended NotebookLM Prompt Template:",
    promptValue: isTa
      ? "\"இந்த கோப்பில் கொடுக்கப்பட்டுள்ள ஸ்லைடு வாரியான கட்டமைப்பைக் கொண்டு ஒரு விரிவான பிரசன்டேஷனை உருவாக்கவும். க்னோடு குறிப்பிட்டுள்ள ஒவ்வொரு ஸ்லைடின் தலைப்பு, முக்கிய கருத்துக்களைச் சரியாகப் பொறுத்தி காட்சி ஆலோசனைகளைப் பயன்படுத்தி வடிவமைக்கவும்.\""
      : "\"Create a detailed presentation draft based exactly on the Slide-by-Slide Structural Breakdown found in the source file. Structure each slide exactly as Knode specifies, matching the core bullet points and utilizing the visual clues to organize the page.\""
  };

  const steps = [
    {
      icon: <FileDown className="h-5 w-5 text-violet-400" />,
      title: t.step1Title,
      description: t.step1Desc
    },
    {
      icon: <Upload className="h-5 w-5 text-violet-400" />,
      title: t.step2Title,
      description: t.step2Desc
    },
    {
      icon: <Sparkles className="h-5 w-5 text-violet-400" />,
      title: t.step3Title,
      description: t.step3Desc
    }
  ];

  return (
    <div className="bg-slate-900 border border-violet-900/30 rounded-2xl p-6 shadow-lg shadow-violet-950/10">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-violet-950/60 border border-violet-850/40 text-violet-400 rounded-xl">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-100 text-lg">{t.title}</h3>
          <p className="text-xs text-violet-400 font-mono tracking-wide">{t.subtitle}</p>
        </div>
      </div>

      <p className="text-sm text-slate-350 leading-relaxed mb-6">
        {t.desc}
      </p>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {steps.map((step, index) => (
          <div key={index} className="bg-slate-950/50 border border-violet-950/30 p-4 rounded-xl hover:border-violet-900/40 transition">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-1.5 bg-slate-900 rounded-xl border border-violet-950/20">
                {step.icon}
              </div>
              <h4 className="font-bold text-slate-200 text-xs tracking-tight">{step.title}</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-violet-950/30 border border-violet-900/20 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row items-start gap-3">
          <Sparkles className="h-5 w-5 text-violet-400 shrink-0 mt-0.5" />
          <div className="w-full">
            <p className="text-xs font-bold text-slate-100 tracking-wide uppercase font-mono">{t.promptTitle}</p>
            <p className="text-xs text-violet-200 bg-black/40 font-mono p-3 rounded-lg border border-violet-950/40 mt-2 select-all leading-relaxed whitespace-pre-wrap">
              {t.promptValue}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
