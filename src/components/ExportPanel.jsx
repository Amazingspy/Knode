/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Download, Copy, Check, BookOpen, Sparkles, Image, HelpCircle } from "lucide-react";
import { formatPackageToMarkdown } from "../utils/mdFormatter";
import { OnboardingGuide } from "./OnboardingGuide";

export function ExportPanel({ packageData, language = "en" }) {
  const isTa = language === "ta" || packageData.lang === "ta";

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("render");

  const markdownContent = formatPackageToMarkdown(packageData, language);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failure:", err);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    
    // Clean title for filenames
    const sanitizedTitle = packageData.title
      ? packageData.title.toLowerCase().trim().replace(/[^a-z0-9\u0B80-\u0BFF]+/g, "_")
      : "knode_package";
    const filename = `${sanitizedTitle}_knode_package.md`;
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div id="export_panel" className="space-y-6">
      {/* Action Header Card */}
      <div className="bg-slate-950 border border-violet-950/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="bg-violet-900/40 text-violet-300 font-bold font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded border border-violet-850/40">
            {isTa ? "கோப்பு தயார்" : "Source Ready"}
          </span>
          <h3 className="font-extrabold text-slate-100 text-lg mt-2 font-sans tracking-tight">{packageData.title}</h3>
          <p className="text-slate-400 text-xs mt-1 font-mono">
            {isTa 
              ? `கட்டமைக்கப்பட்ட மூல ஆவணம் • ${packageData.slides?.length || 0} ஸ்லைடுகள் • ${packageData.keyVocabulary?.length || 0} கலைச்சொற்கள்`
              : `Structured Blueprint Package • ${packageData.slides?.length || 0} slides • ${packageData.keyVocabulary?.length || 0} key glossary terms`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-850 active:bg-slate-950 border border-violet-950 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-350 hover:text-slate-100 cursor-pointer transition shadow"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                {isTa ? "நகலெடுக்கப்பட்டது!" : "Copied Markdown!"}
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                {isTa ? "அமைப்பை நகலெடு" : "Copy Source Markup"}
              </>
            )}
          </button>
          
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-750 hover:to-indigo-750 text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer transition shadow-md"
          >
            <Download className="h-4 w-4" />
            {isTa ? "மூலத்தைப் பதிவிறக்கு (.md)" : "Download NotebookLM Source (.md)"}
          </button>
        </div>
      </div>

      {/* Integration Guide */}
      <OnboardingGuide language={language} />

      {/* Preview Section */}
      <div className="bg-slate-900 border border-violet-950/40 rounded-2xl overflow-hidden shadow-xl">
        <div className="bg-slate-950 border-b border-violet-950/30 px-6 py-4 flex items-center justify-between">
          <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">
            {isTa ? "சரிபார்ப்பு முற்காட்சி (Verification Preview)" : "Package Verification Preview"}
          </span>

          <div className="flex bg-slate-900 p-0.5 rounded-xl border border-violet-950/30">
            <button
              onClick={() => setActiveTab("render")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                activeTab === "render"
                  ? "bg-violet-950 text-violet-100 border border-violet-850"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {isTa ? "வடிவமைக்கப்பட்ட வரைவு" : "Formatted Preview"}
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                activeTab === "code"
                  ? "bg-violet-950 text-violet-100 border border-violet-850"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {isTa ? "மார்க் டவுன் நிரல்" : "Raw Markdown Markup"}
            </button>
          </div>
        </div>

        {activeTab === "code" ? (
          <div className="bg-black p-6 overflow-x-auto select-all max-h-[500px]">
            <pre className="text-xs font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap">
              {markdownContent}
            </pre>
          </div>
        ) : (
          <div className="p-6 md:p-8 space-y-8 max-h-[600px] overflow-y-auto">
            {/* Title Block */}
            <div className="border-b border-violet-950/40 pb-5">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight leading-normal">
                {packageData.title}
              </h1>
              <p className="text-[10px] text-slate-500 mt-2 font-mono uppercase">
                Package ID: {packageData.id} • {isTa ? "ஜெமினி AI மூலம் கட்டமைக்கப்பட்டது" : "Refined with Gemini AI"}
              </p>
            </div>

            {/* Learning Objectives */}
            <div className="space-y-3 bg-violet-950/20 border border-violet-900/20 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-violet-300 font-bold text-sm">
                <BookOpen className="h-4.5 w-4.5 shrink-0" />
                <h4>🎯 {isTa ? "டார்கெட் கற்றல் நோக்கங்கள்" : "Targeted Learning Objectives"}</h4>
              </div>
              <ul className="grid sm:grid-cols-2 gap-2 text-xs text-slate-350 leading-relaxed pl-1">
                {packageData.learningObjectives?.map((obj, i) => (
                  <li key={i} className="flex gap-2 items-start">
                    <span className="font-bold text-violet-500 font-mono mt-0.5">•</span>
                    <span>{obj}</span>
                  </li>
                ))}
                {(!packageData.learningObjectives || packageData.learningObjectives.length === 0) && (
                  <p className="text-slate-500 italic font-mono">{isTa ? "இலக்குகள் எதுவும் இல்லை" : "No global objectives generated."}</p>
                )}
              </ul>
            </div>

            {/* Glossary */}
            <div className="space-y-3 p-5 border border-violet-950/30 rounded-2xl">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
                <HelpCircle className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                <h4>📖 {isTa ? "முக்கிய சொற்களஞ்சியங்கள்" : "Key Vocabulary Glossary"}</h4>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {packageData.keyVocabulary?.map((item, i) => (
                  <div key={i} className="bg-slate-950/60 border border-violet-950/20 p-3 rounded-xl">
                    <span className="font-bold text-violet-300 text-xs block">{item.term}</span>
                    <span className="text-[10px] text-slate-400 mt-1 block leading-normal">{item.definition}</span>
                  </div>
                ))}
                {(!packageData.keyVocabulary || packageData.keyVocabulary.length === 0) && (
                  <p className="text-slate-500 italic font-mono">{isTa ? "சொற்களஞ்சியம் இன்னும் வரையறுக்கப்படவில்லை." : "No terms defined."}</p>
                )}
              </div>
            </div>

            {/* Slide List Breakdown */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-violet-950/30 pb-2">
                <Sparkles className="h-4 w-4 text-violet-400 shrink-0" />
                <h4 className="font-bold text-slate-200 text-xs tracking-wider uppercase font-mono">
                  {isTa ? "ஸ்லைடு வாரியான கட்டமைப்பு விவரங்கள்" : "Slide-by-Slide Detailed Blueprint"}
                </h4>
              </div>

              {packageData.slides?.map((slide, i) => (
                <div key={slide.id} className="border border-violet-950/20 rounded-2xl overflow-hidden bg-slate-950/30 p-5 space-y-4">
                  <div className="flex items-start justify-between border-b border-violet-950/20 pb-2.5">
                    <h5 className="font-bold text-slate-200 text-xs sm:text-sm flex gap-2">
                      <span className="text-violet-400 font-mono">{isTa ? "ஸ்லைடு" : "Slide"} {i + 1}:</span>
                      {slide.title}
                    </h5>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    {/* Visual Cues and list bullet points */}
                    <div className="space-y-4 animate-fadeIn">
                      <div>
                        <span className="text-[10px] font-bold font-mono text-slate-450 uppercase block tracking-wider mb-2 text-slate-400">
                          {isTa ? "📌 கருத்துக்கள் & செய்தி குறிப்புகள்" : "📌 Core Content & Key Message Bullet Points"}
                        </span>
                        <ul className="space-y-1 text-xs text-slate-300 pl-1.5">
                          {slide.bulletPoints?.map((bp, bpIdx) => (
                            <li key={bpIdx} className="flex gap-2 items-start leading-relaxed">
                              <span className="font-bold text-violet-500 font-mono mt-0.5">•</span>
                              <span>{bp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {slide.keyVocabulary && slide.keyVocabulary.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold font-mono text-slate-450 uppercase block tracking-wider mb-2 text-slate-400">
                            {isTa ? "🔑 கலைச்சொற்கள்" : "🔑 Associated Terms"}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {slide.keyVocabulary.map((vocab, vIdx) => (
                              <span key={vIdx} className="bg-violet-950/30 text-violet-300 text-[9px] font-mono px-2 py-0.5 rounded-md border border-violet-900/30">
                                {vocab}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Speaker Notes */}
                    <div className="space-y-4">
                      <div className="bg-slate-950/50 p-3.5 rounded-xl border border-violet-950/20">
                        <span className="text-[10px] font-bold font-mono text-slate-450 uppercase block tracking-wider mb-1 px-1 text-slate-400">
                          {isTa ? "🗣️ பேச்சாளர் குறிப்புகள் (What to say)" : "🗣️ Speaker Notes & Presentation script"}
                        </span>
                        <p className="text-xs text-slate-350 leading-relaxed pl-1 font-sans">{slide.speakerNotes}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold font-mono text-slate-450 uppercase block tracking-wider mb-1.5 text-slate-400 flex items-center gap-1">
                          <Image className="h-3 w-3 text-violet-400" />
                          {isTa ? "🎨 காட்சி அமைப்புக் குறிப்பு (Visual Suggestions)" : "🎨 Visual Graphic Suggestions"}
                        </span>
                        <p className="text-[10px] text-violet-300 font-mono bg-slate-950/50 p-3 rounded-xl border border-violet-950/20 whitespace-pre-wrap leading-relaxed">
                          {slide.visualSuggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
