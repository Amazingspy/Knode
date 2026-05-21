/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Plus, Trash2, ArrowUp, ArrowDown, Sparkles, BookOpen, 
  HelpCircle, Loader2, Type, MessageSquare, Image, RefreshCw 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function EditorPanel({ packageData, onUpdatePackage, language = "en" }) {
  const isTa = language === "ta";

  const [activeTab, setActiveTab] = useState("slides");
  const [activeSlideId, setActiveSlideId] = useState(
    packageData.slides[0]?.id || ""
  );

  // Refine text instructions
  const [refinePrompt, setRefinePrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState(null);

  // Quick states for adding objectives or vocab terms
  const [newObjective, setNewObjective] = useState("");
  const [newVocabTerm, setNewVocabTerm] = useState("");
  const [newVocabDef, setNewVocabDef] = useState("");

  const activeSlide = packageData.slides.find(s => s.id === activeSlideId);

  const updateActiveSlide = (fields) => {
    if (!activeSlide) return;
    const updatedSlides = packageData.slides.map((s) => {
      if (s.id === activeSlideId) {
        return { ...s, ...fields };
      }
      return s;
    });
    onUpdatePackage({ ...packageData, slides: updatedSlides });
  };

  // Move slide up or down
  const handleMoveSlide = (direction, index) => {
    const newSlides = [...packageData.slides];
    if (direction === "up" && index > 0) {
      const temp = newSlides[index];
      newSlides[index] = newSlides[index - 1];
      newSlides[index - 1] = temp;
    } else if (direction === "down" && index < newSlides.length - 1) {
      const temp = newSlides[index];
      newSlides[index] = newSlides[index + 1];
      newSlides[index + 1] = temp;
    }

    // Re-index slide numbers
    const indexedSlides = newSlides.map((s, idx) => ({
      ...s,
      slideNumber: idx + 1
    }));

    onUpdatePackage({ ...packageData, slides: indexedSlides });
  };

  // Add slide
  const handleAddSlide = () => {
    const newSlide = {
      id: `slide_${Date.now()}`,
      slideNumber: packageData.slides.length + 1,
      title: isTa ? "தலைப்பிடப்படாத புதிய ஸ்லைடு" : "Untitled Slide",
      bulletPoints: isTa 
        ? ["பாடக் கருத்துப் புள்ளி 1.", "ஆதார விளக்கம் 2."] 
        : ["Key discovery summary point 1.", "Supporting evidence or description 2."],
      speakerNotes: isTa 
        ? "இந்த ஸ்லைடின் நோக்கத்தைக் கூட்டாளர்களுக்கு விளக்குக." 
        : "Explain the main outcome of this slide. Address the audience professionally.",
      visualSuggestion: isTa 
        ? "முக்கிய மூலக்கூறுகள் அடங்கிய வரைபடம்" 
        : "Descriptive icon of key elements with sequential blocks.",
      keyVocabulary: []
    };

    const updatedSlides = [...packageData.slides, newSlide];
    onUpdatePackage({ ...packageData, slides: updatedSlides });
    setActiveSlideId(newSlide.id);
  };

  // Delete slide
  const handleDeleteSlide = (slideId) => {
    if (packageData.slides.length <= 1) return; // Must keep at least 1 slide
    
    // Find next active slide index
    const activeIdx = packageData.slides.findIndex(s => s.id === slideId);
    let nextActiveId = activeSlideId;
    if (activeSlideId === slideId) {
      const fallbackIdx = activeIdx === 0 ? 1 : activeIdx - 1;
      nextActiveId = packageData.slides[fallbackIdx]?.id || "";
    }

    const filteredSlides = packageData.slides.filter(s => s.id !== slideId);
    const indexedSlides = filteredSlides.map((s, idx) => ({
      ...s,
      slideNumber: idx + 1
    }));

    onUpdatePackage({ ...packageData, slides: indexedSlides });
    setActiveSlideId(nextActiveId);
  };

  // Bullet points handlers
  const handleUpdateBullet = (bulletIdx, value) => {
    if (!activeSlide) return;
    const newBullets = [...activeSlide.bulletPoints];
    newBullets[bulletIdx] = value;
    updateActiveSlide({ bulletPoints: newBullets });
  };

  const handleAddBullet = () => {
    if (!activeSlide) return;
    updateActiveSlide({
      bulletPoints: [...activeSlide.bulletPoints, ""]
    });
  };

  const handleDeleteBullet = (bulletIdx) => {
    if (!activeSlide) return;
    const newBullets = activeSlide.bulletPoints.filter((_, idx) => idx !== bulletIdx);
    updateActiveSlide({ bulletPoints: newBullets });
  };

  // AI Refine slide handler
  const handleAICopilotRefine = async () => {
    if (!activeSlide || !refinePrompt.trim()) return;
    
    setIsRefining(true);
    setRefineError(null);

    try {
      const res = await fetch("/api/refine-slide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slide: activeSlide,
          refinementInstructions: refinePrompt,
          learningObjectives: packageData.learningObjectives,
          lang: language
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to refine slide.");
      }

      const updatedSlide = await res.json();
      
      const newSlides = packageData.slides.map((s) => {
        if (s.id === activeSlide.id) {
          return updatedSlide;
        }
        return s;
      });

      onUpdatePackage({ ...packageData, slides: newSlides });
      setRefinePrompt("");
    } catch (err) {
      console.error(err);
      setRefineError(err.message || "An error occurred during AI assistance.");
    } finally {
      setIsRefining(false);
    }
  };

  // Global Objectives & Glossary Handlers
  const handleAddObjective = () => {
    if (!newObjective.trim()) return;
    if (packageData.learningObjectives.includes(newObjective.trim())) return;
    
    onUpdatePackage({
      ...packageData,
      learningObjectives: [...packageData.learningObjectives, newObjective.trim()]
    });
    setNewObjective("");
  };

  const handleRemoveObjective = (idx) => {
    const updated = packageData.learningObjectives.filter((_, i) => i !== idx);
    onUpdatePackage({
      ...packageData,
      learningObjectives: updated
    });
  };

  const handleAddVocab = () => {
    if (!newVocabTerm.trim() || !newVocabDef.trim()) return;
    
    const newTerm = {
      term: newVocabTerm.trim(),
      definition: newVocabDef.trim()
    };

    onUpdatePackage({
      ...packageData,
      keyVocabulary: [...packageData.keyVocabulary, newTerm]
    });
    setNewVocabTerm("");
    setNewVocabDef("");
  };

  const handleRemoveVocab = (idx) => {
    const updated = packageData.keyVocabulary.filter((_, i) => i !== idx);
    onUpdatePackage({
      ...packageData,
      keyVocabulary: updated
    });
  };

  return (
    <div id="editor_panel" className="bg-slate-900 border border-violet-950/40 rounded-2xl overflow-hidden shadow-xl flex flex-col min-h-[680px]">
      {/* Header Tabs */}
      <div className="bg-slate-950/80 border-b border-violet-950/30 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-100 text-sm tracking-widest uppercase font-mono">
            {isTa ? "2. ஸ்லைடு வரைவு திருத்தி & ஏஐ துணையாளர்" : "2. Package Editor & AI Structurer"}
          </h3>
          <p className="text-xs text-slate-400">
            {isTa ? "கற்றல் நோக்கங்கள், கலைச்சொற்கள், ஸ்லைடுகள் மற்றும் பேச்சாளர் குறிப்புகளைச் சரிசெய்க" : "Refine objectives, vocabulary, slides, text and speaker cues"}
          </p>
        </div>
        
        <div className="flex bg-slate-900 p-1 rounded-xl self-start sm:self-center border border-violet-950/40">
          <button
            onClick={() => setActiveTab("slides")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              activeTab === "slides"
                ? "bg-violet-950 border border-violet-800 text-violet-100 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {isTa ? `ஸ்லைடு வரைபடம் (${packageData.slides.length})` : `Slides Map (${packageData.slides.length})`}
          </button>
          <button
            onClick={() => setActiveTab("metadata")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              activeTab === "metadata"
                ? "bg-violet-950 border border-violet-800 text-violet-100 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {isTa ? "சொற்களஞ்சியம் & இலக்குகள்" : "Glossary & Goals"}
          </button>
        </div>
      </div>

      {activeTab === "slides" ? (
        <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-violet-950/40">
          {/* Left Column: Slide Navigator */}
          <div className="w-full md:w-80 flex flex-col bg-slate-950/30 h-full">
            <div className="p-4 border-b border-violet-950/30 bg-slate-950 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                {isTa ? "ஸ்லைடு கட்டமைப்பு" : "Slide Outline"}
              </span>
              <button
                onClick={handleAddSlide}
                className="inline-flex items-center gap-1 text-xs font-semibold bg-violet-950 border border-violet-900/30 text-violet-300 hover:text-white px-2.5 py-1.5 rounded-md cursor-pointer transition"
              >
                <Plus className="h-3 w-3" />
                {isTa ? "பிணைய ஸ்லைடு" : "Add Slide"}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[500px] md:max-h-[600px] p-2.5 space-y-2">
              <AnimatePresence initial={false}>
                {packageData.slides.map((slide, index) => {
                  const isActive = slide.id === activeSlideId;
                  return (
                    <motion.div
                      key={slide.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => setActiveSlideId(slide.id)}
                      className={`group p-3 rounded-xl border select-none transition cursor-pointer relative ${
                        isActive
                          ? "bg-violet-950/40 border-violet-800 text-violet-100 shadow-inner"
                          : "bg-slate-950/60 hover:bg-slate-900 border-violet-950/20 text-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="text-[10px] font-bold text-violet-400 font-mono shrink-0 mt-0.5">
                          #{slide.slideNumber}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-xs truncate ${isActive ? "text-violet-200" : "text-slate-100"}`}>
                            {slide.title || (isTa ? "தலைப்பிடப்படாத ஸ்லைடு" : "Untitled Slide")}
                          </p>
                          <p className="text-[10px] text-slate-address mt-0.5 text-slate-500 truncate">
                            {slide.bulletPoints?.length || 0} bullets • {slide.speakerNotes?.slice(0, 45)}...
                          </p>
                        </div>
                      </div>

                      {/* Operations controls on hover */}
                      <div className="opacity-0 group-hover:opacity-100 absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-slate-950 border border-violet-950 p-0.5 rounded shadow-lg transition">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveSlide("up", index);
                          }}
                          disabled={index === 0}
                          title={isTa ? "மேலே நகர்த்து" : "Move Up"}
                          className="p-1 hover:bg-slate-900 rounded text-slate-400 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveSlide("down", index);
                          }}
                          disabled={index === packageData.slides.length - 1}
                          title={isTa ? "கீழே நகர்த்து" : "Move Down"}
                          className="p-1 hover:bg-slate-900 rounded text-slate-400 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSlide(slide.id);
                          }}
                          disabled={packageData.slides.length <= 1}
                          title={isTa ? "அழி" : "Delete Slide"}
                          className="p-1 hover:bg-red-950 hover:text-red-400 rounded text-slate-400 disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Slide Editor & AI refine copilot */}
          <div className="flex-1 p-6 space-y-6 bg-slate-950/10">
            {activeSlide ? (
              <div className="space-y-5">
                {/* ID Indicator */}
                <div className="flex items-center justify-between border-b border-violet-950/40 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-violet-950/60 border border-violet-900/20 text-violet-300 font-bold font-mono px-2.5 py-1 rounded text-[10px] tracking-wide uppercase">
                      {isTa ? `ஸ்லைடு ${activeSlide.slideNumber}` : `Active Slide ${activeSlide.slideNumber}`}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">ID: {activeSlide.id}</span>
                  </div>
                </div>

                {/* Primary Slide Inputs */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="slide_title" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono flex items-center gap-1.5">
                      <Type className="h-3.5 w-3.5 text-violet-400" />
                      {isTa ? "ஸ்லைடு தலைப்பு" : "Slide Title"}
                    </label>
                    <input
                      id="slide_title"
                      value={activeSlide.title}
                      onChange={(e) => updateActiveSlide({ title: e.target.value })}
                      type="text"
                      className="w-full px-4 py-2 bg-slate-950 border border-violet-950/40 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-800 transition"
                    />
                  </div>

                  {/* Bullet points editor */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <Type className="h-3.5 w-3.5 text-violet-400" />
                        {isTa ? "ஸ்லைடு முக்கிய கருத்துக்கள்" : "Slide Bullet Points"}
                      </label>
                      <button
                        onClick={handleAddBullet}
                        type="button"
                        className="text-xs font-semibold text-violet-300 hover:text-white flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {isTa ? "கருத்தைச் சேர்" : "Add Bullet"}
                      </button>
                    </div>

                    <div className="space-y-2">
                      {activeSlide.bulletPoints.map((bullet, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <span className="text-xs text-violet-400 font-semibold font-mono w-4 text-center">
                            •
                          </span>
                          <input
                            value={bullet}
                            onChange={(e) => handleUpdateBullet(idx, e.target.value)}
                            type="text"
                            className="flex-1 px-3 py-2 bg-slate-950 border border-violet-950/40 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-800 transition font-sans"
                          />
                          <button
                            onClick={() => handleDeleteBullet(idx)}
                            type="button"
                            title={isTa ? "நீக்கு" : "Remove Bullet"}
                            className="p-1.5 hover:bg-slate-900 text-slate-500 hover:text-red-400 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Speaker Notes */}
                  <div>
                    <label htmlFor="slide_speaker_notes" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-violet-400" />
                      {isTa ? "பேச்சாளர் குறிப்புகள் (ஆலோசனைகள்)" : "Speaker Notes (suggestions)"}
                    </label>
                    <textarea
                      id="slide_speaker_notes"
                      value={activeSlide.speakerNotes}
                      onChange={(e) => updateActiveSlide({ speakerNotes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-slate-950 border border-violet-950/40 rounded-xl text-xs text-slate-350 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-800 transition font-sans leading-relaxed resize-none"
                      placeholder={isTa ? "வழங்குபவரான நீங்கள் பேச வேண்டிய வாக்கியங்களை உள்ளிடவும்..." : "Type suggested presentation dialogue script..."}
                    ></textarea>
                  </div>

                  {/* Visual Suggestions */}
                  <div>
                    <label htmlFor="slide_visual_suggestion" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono flex items-center gap-1.5">
                      <Image className="h-3.5 w-3.5 text-violet-400" />
                      {isTa ? "காட்சி ஆலோசனைக் குறிப்புகள் (Plain-text visual suggestions)" : "Visual Suggestion Cues (Plain-text directions)"}
                    </label>
                    <textarea
                      id="slide_visual_suggestion"
                      value={activeSlide.visualSuggestion}
                      onChange={(e) => updateActiveSlide({ visualSuggestion: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 bg-slate-950 border border-violet-950/40 rounded-xl text-xs text-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-800 transition font-mono leading-relaxed"
                      placeholder={isTa ? "எ.கா. 3 அடுக்கு இயந்திர நெட்வொர்க் படம் மத்திய நிலையில் அமைய வேண்டும்" : "e.g. Draw a centered logic flow explaining distributed Sagae transactions..."}
                    ></textarea>
                  </div>
                </div>

                {/* AI slide helper copilot panel */}
                <div className="bg-violet-950/30 border border-violet-900/20 rounded-2xl p-4 mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-violet-400 animate-pulse" />
                    <span className="font-bold text-[10px] font-mono tracking-wider uppercase text-slate-100">
                      {isTa ? "அகச் செயலி ஜெமினி கோ-பைலட் ஸ்லைடு துணையாளன்" : "Gemini Copilot Slide Assistant"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    {isTa 
                      ? "இந்த குறிப்பிட்ட ஸ்லைடை ஏஐ கொண்டு செப்பனிடுக. வடிவமைப்பு மற்றும் கற்பிக்கும் நோக்கங்களை ஏஐ துணையுடன் விருப்பம்போல் மாற்றி அமையுங்கள்."
                      : "Redraft or refine this specific slide. Specify layout changes, target glossary terms, or simplify instructions. Let AI handle the heavy lifting."}
                  </p>

                  <div className="flex gap-2">
                    <input
                      value={refinePrompt}
                      onChange={(e) => setRefinePrompt(e.target.value)}
                      type="text"
                      disabled={isRefining}
                      placeholder={isTa ? "உதாரணம்: தமிழ் மொழியில் சுருக்கமாக மாற்றியமைத்துக் கொடு" : "e.g. Translate to elegant Tamil or simplify bullet points..."}
                      className="flex-grow px-3 py-2 bg-slate-950 border border-violet-950/40 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-800 transition"
                    />
                    <button
                      onClick={handleAICopilotRefine}
                      disabled={isRefining || !refinePrompt.trim()}
                      className="bg-violet-600 hover:bg-violet-750 disabled:opacity-50 text-white rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition shrink-0"
                    >
                      {isRefining ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          {isTa ? "மாற்றுகிறது..." : "Modifying..."}
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3.5 w-3.5" />
                          {isTa ? "செப்பனிடு" : "Refine"}
                        </>
                      )}
                    </button>
                  </div>

                  {refineError && (
                    <p className="text-xs text-red-400 mt-2 font-mono">
                      {refineError}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center p-10 text-slate-500 font-mono text-center">
                <p className="text-xs italic">{isTa ? "தொடங்குவதற்கு ஸ்லைடைத் தேர்ந்தெடுக்கவும் அல்லது புதியதைச் சேர்க்கவும்." : "Please select or add a slide map to begin customizing."}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Metadata: Learning objectives and vocabulary glossary */
        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Learning Objectives Editor */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-violet-950/40 pb-2">
                <BookOpen className="h-5 w-5 text-violet-400 shrink-0" />
                <h4 className="font-bold text-slate-200 text-xs tracking-wider uppercase font-mono">
                  {isTa ? "கற்றல் நோக்கங்கள்" : "Review Learning Objectives"}
                </h4>
              </div>

              {/* Add Input */}
              <div className="flex gap-2">
                <input
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  type="text"
                  placeholder={isTa ? "எ.கா. இயந்திர கற்றலின் வகைகளைப் புரிந்துகொள்ளுதல்" : "e.g. Master the derivation of MSE loss optimization"}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-violet-950/40 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-800 transition"
                />
                <button
                  onClick={handleAddObjective}
                  className="bg-violet-950 border border-violet-805/35 text-violet-300 hover:text-white rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider shrink-0 cursor-pointer transition shadow-sm font-mono"
                >
                  {isTa ? "சேர்" : "Add Goal"}
                </button>
              </div>

              {/* List */}
              <div className="space-y-1.5">
                {packageData.learningObjectives.map((obj, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-950/30 py-2.5 px-4 border border-violet-950/20 rounded-xl text-xs text-slate-300">
                    <span className="flex-1 leading-relaxed font-sans">
                      {i + 1}. {obj}
                    </span>
                    <button
                      onClick={() => handleRemoveObjective(i)}
                      className="p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {packageData.learningObjectives.length === 0 && (
                  <p className="text-xs text-slate-500 italic font-mono">{isTa ? "இலக்குகள் எதுவும் சேர்க்கப்படவில்லை." : "No learning objectives drafted yet."}</p>
                )}
              </div>
            </div>

            {/* Glossary Editor */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-violet-950/40 pb-2">
                <HelpCircle className="h-5 w-5 text-violet-400 shrink-0" />
                <h4 className="font-bold text-slate-200 text-xs tracking-wider uppercase font-mono">
                  {isTa ? "கலைச்சொற்கள் அகராதி" : "Glossary & Key Vocabulary Glossary"}
                </h4>
              </div>

              {/* Add form */}
              <div className="bg-slate-950/40 border border-violet-950 p-3.5 rounded-2xl space-y-2.5">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <input
                      value={newVocabTerm}
                      onChange={(e) => setNewVocabTerm(e.target.value)}
                      placeholder={isTa ? "சொல்" : "Term"}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-violet-950/30 rounded-lg text-xs text-slate-200"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      value={newVocabDef}
                      onChange={(e) => setNewVocabDef(e.target.value)}
                      placeholder={isTa ? "சிறு விளக்கம்" : "Short Glossary Definition"}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-violet-950/30 rounded-lg text-xs text-slate-200"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddVocab}
                  disabled={!newVocabTerm.trim() || !newVocabDef.trim()}
                  className="w-full bg-violet-950 text-violet-300 hover:text-white rounded-xl py-2 text-xs font-bold uppercase tracking-wider cursor-pointer border border-violet-900/30 shadow-md transition"
                >
                  {isTa ? "கலைச்சொல்லைச் சேர்" : "Insert Concept Term"}
                </button>
              </div>

              {/* List */}
              <div className="space-y-1.5">
                {packageData.keyVocabulary.map((term, i) => (
                  <div key={i} className="flex gap-2 items-start justify-between bg-slate-950/30 py-2.5 px-3.5 border border-violet-950/20 rounded-xl text-xs text-slate-300">
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-violet-300 block">{term.term}</span>
                      <span className="text-slate-400 font-mono text-[10px] block mt-1 leading-relaxed">{term.definition}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveVocab(i)}
                      className="p-1 text-slate-500 hover:text-red-400 cursor-pointer self-start"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {packageData.keyVocabulary.length === 0 && (
                  <p className="text-xs text-slate-500 italic font-mono">{isTa ? "கலைச்சொற்கள் எதுவும் சேர்க்கப்படவில்லை." : "No glossary terms registered."}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
