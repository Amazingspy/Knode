/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, FileText, ArrowRight, Layers, Eye, Loader2, Globe } from "lucide-react";
import { motion } from "motion/react";

const PRESETS = [
  {
    name: "Deep Learning Explained",
    title: "Understanding Deep Learning Nodes",
    audience: "Technical but beginner-friendly",
    slides: "8-12 Slides (Standard)",
    targetLang: "en",
    script: `So, welcome everyone to this session on how deep learning networks actually build internal representations of data. I want to break this down. It sounds complex but it's really beautiful. 

Let's start from the bottom. We have artificial neural networks, or ANNs. Think of them as inspired by the human brain, although they're really just some pretty heavy linear algebra and calculus under the hood. The fundamental building block is the artificial neuron, or the node (sometimes called a perceptron). 

What does a single node do? It takes some input numbers, let's call them x1, x2, and x3. It multiplies each input by a specific value called a 'weight' - w1, w2, w3. It sums them all up, adds a little calibration number called the 'bias', and then passes that sum through an 'activation function' like ReLU or Sigmoid. The activation function decides if and how much to fire that node's signal forward. That's a single neuron.

But one neuron isn't smart. It can only classify linear borders. To get deep learning, we stack thousands of these. We arrange them in layers. You have the Input Layer, then multiple Hidden Layers (that's why it's called 'deep' because of these hidden tiers), and finally the Output Layer.

As data passes through, the initial layers detect very simple things, like borders, lines, or circles. The middle layers combine those lines into shapes, like eyes, noses, or corners. The final layers combine those shapes into highly conceptual components: faces, cats, cars. This is hierarchical feature extraction.

Now, how does it learn? It's all about backpropagation and gradient descent. On the forward pass, it makes a guess. The error is computed using a loss function (how far off was the guess?). Then, using calculus (specifically the Chain Rule), we compute the gradient and pass that error backward through the network, constantly nudging weights and biases to reduce future errors. That's backpropagation. 

Today we'll outline:
- History & Core Concept of Neurons
- Mathematics of a Node (Inputs, Weights, Biases, Activation Functions)
- Network Architecture (Input, Hidden layers, Hierarchy)
- Forward Propagation Sequence
- Error analysis & Loss Functions
- Backward Propagation & Gradient Descent optimization`
  },
  {
    name: "Developer Microservice Strategy",
    title: "Migrating Monoliths to Event-Driven Microservices",
    audience: "Software Engineers and Architects",
    slides: "5-7 Slides (Summary)",
    targetLang: "en",
    script: `Team, the goal for our next major milestone is decoupling our core checkout service from the legacy Rails monolith. Our Rails database is heavily locked and checkout requests occasionally block inventory checks, slowing down users.

Let's discuss why we are doing this. First, Scalability. The monolith has to scale up as a single unit which is expensive; isolated microservices write databases independently. Second, Fault Tolerance. If inventory checks fail in the monolith, the whole process crashes. Under microservices, checkout can queue orders regardless of inventory engine uptime. Third, Team Speed. Developers can ship checkout updates without waiting to deploy the whole portal.

Our architecture is Event-Driven. Instead of services calling each other via synchronous REST APIs which creates tight coupling, we will use Apache Kafka as our central event platform.
Here's the pattern:
When a customer clicks checkout, the Checkout Service commits an 'Order Created' event to the checkout topic. The Inventory Service subscribes to this topic, reads the event, and decreases stock asynchronously. If stock is available, it emits an 'Inventory Reserved' event. If not, it emits 'OutOfStock'.

There are crucial risks we must handle.
First, Distributed Transactions. We don't have SQL joins anymore, so we must use the Saga Pattern.
Second, Event Delivery guarantees. We must configure idempotent consumers so random retries don't charge users twice or deduct double stock.
Third, Eventual Consistency. We need to educate our product managers that the screen won't reflect 100% real-time data immediately, but will settle within seconds.

Let's cover:
1. Identifying Bottlenecks: Legacy Monolithic checkout analysis
2. The Event-driven microservice solution (Coupled vs Decoupled)
3. Event Pipeline: Kafka broker, Order Creation, and Inventory Reservation topics
4. Mitigating Failure: Sagas, Idempotent Subscribers, and Eventual consistency.`
  },
  {
    name: "இயந்திர கற்றல் அறிமுகம் (Tamil Deep Learning)",
    title: "இயந்திர கற்றலின் அடிப்படை கோட்பாடுகள்",
    audience: "கற்றல் ஆர்வலர்கள் மற்றும் மாணவர்கள்",
    slides: "5-7 Slides (Summary)",
    targetLang: "ta",
    script: `வணக்கம் நண்பர்களே! இன்று நாம் இயந்திர கற்றல் (Machine Learning) பற்றி மிக எளிமையாகப் பார்க்கப்போகிறோம். இயந்திர கற்றல் என்பது கணினிகளுக்கு நாமே நேரடியாக நிரல் (coding) எழுதாமல், தரவுகளின் (data) மூலம் தானாகவே கற்றுக்கொள்ளும் திறனை வழங்குவதாகும்.

இதில் மூன்று முக்கிய வகைகள் உள்ளன. முதலாவது, 'Supervised Learning' எனப்படும் மேற்பார்வை கற்றல். இதில் நாம் கணினிக்கு லேபிள் செய்யப்பட்ட வெளியீடுகளை (labeled data) முன்கூட்டியே வழங்குவோம். உதாரணத்திற்கு, பூனை மற்றும் நாயின் படங்களை அவற்றின் பெயர்களுடன் சேர்த்து கணினிக்குக் கொடுப்பது.

இரண்டாவது, 'Unsupervised Learning' எனப்படும் மேற்பார்வையற்ற கற்றல். இதில் லேபிள்கள் எதுவும் இருக்காது. கணினி தானாகவே தரவுகளில் உள்ள ஒத்த தன்மைகளை அறிந்து அவற்றை வகைகளாகப் பிரிக்கும்.

மூன்றாவது, 'Reinforcement Learning' எனப்படும் வலுவூட்டல் கற்றல். இது ஒரு விளையாட்டுப் போன்றது. கணினி ஒரு செயலைச் செய்து, அதன் முடிவில் கிடைக்கும் வெகுமதி (reward) அல்லது தண்டனை (penalty) மூலம் எது சரியான வழி என்று கற்றுக் கொள்ளும்.

இயந்திர கற்றல் இன்று நமது அன்றாட வாழ்க்கையில் பல இடங்களில் பயன்படுகிறது:
1. கூகுள் வரைபடங்கள் (Google Maps) போக்குவரத்து கணிப்பு
2. யூடியூப் மற்றும் நெட்ஃபிலிக்ஸ் பரிந்துரைகள் (Recommendation engines)
3. மொழிபெயர்ப்பு கருவிகள் (Google Translate)
4. மின்னஞ்சல் ஸ்பேம் ஃபில்டர்கள் (Email filtering)

இன்று நாம் பார்க்கப்போகும் முக்கிய பகுதிகள்:
- இயந்திர கற்றலின் வரலாறு மற்றும் தேவை
- அதன் மூன்று முக்கிய வகைகள் (Supervised, Unsupervised, Reinforcement)
- நிஜ உலகப் பயன்பாடுகள் மற்றும் உதாரணங்கள்
- எதிர்காலத்தில் இதற்கான வேலைவாய்ப்புகள் மற்றும் சவால்கள்`
  }
];

export function IngestionPanel({ onIngest, isLoading, language = "en", onLanguageChange }) {
  const isTa = language === "ta";

  const [script, setScript] = useState("");
  const [title, setTitle] = useState("");
  const [slideCount, setSlideCount] = useState("Automatic");
  const [audience, setAudience] = useState("Professional & Formal");
  const [targetLang, setTargetLang] = useState(language);

  const [loadingStep, setLoadingStep] = useState(0);

  // Sync component internal targetLang when global language toggles
  React.useEffect(() => {
    setTargetLang(language);
  }, [language]);

  // Animated progress messages
  React.useEffect(() => {
    if (!isLoading) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % 4);
    }, 3200);
    return () => clearInterval(interval);
  }, [isLoading]);

  const loadingMessages = isTa ? [
    "உங்கள் மூல ஸ்கிரிப்ட் மற்றும் குறிப்புகளை பகுப்பாய்வு செய்கிறது...",
    "முக்கிய கல்வி சார்ந்த கற்றல் நோக்கங்களை பிரித்தெடுக்கிறது...",
    "கருத்துக்கள் மற்றும் முக்கிய கலைச்சொல் அகராதியைத் தயாரிக்கிறது...",
    "ஸ்லைடு வாரியாக அழகிய தமிழ் வழிகாட்டுதல்களை வடிவமைக்கிறது..."
  ] : [
    "Reading and parsing your raw manuscript...",
    "Extracting key educational learning objectives...",
    "Identifying core terminology glossary definitions...",
    "Decomposing script and drafting visual cues slide-by-slide..."
  ];

  const handleApplyPreset = (preset) => {
    setScript(preset.script);
    setTitle(preset.title);
    setSlideCount(preset.slides);
    setAudience(preset.audience);
    setTargetLang(preset.targetLang);
    if (preset.targetLang !== language) {
      onLanguageChange?.(preset.targetLang);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!script.trim()) return;
    onIngest({
      script,
      title,
      slideCountPreference: slideCount,
      audiencePreference: audience,
      targetLang
    });
  };

  return (
    <div id="ingestion_panel" className="bg-slate-900 border border-violet-950/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Absolute faint purple glow background */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-violet-600/10 blur-3xl pointer-events-none"></div>
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-3 bg-violet-950/80 border border-violet-900/30 text-violet-400 rounded-xl shadow-inner">
          <Layers className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100 uppercase tracking-tight">
            {isTa ? "1. மூலக் குறிப்புகள் & ஸ்கிரிப்ட் உள்ளடக்கம்" : "1. Script & Material Ingestion"}
          </h2>
          <p className="text-xs text-slate-400">
            {isTa ? "உங்களின் விரிவான விவரங்கள் அல்லது சிறு குறிப்புகளை இங்கு சமர்ப்பிக்கவும்" : "Paste your disorganized transcript, guidelines or raw thoughts"}
          </p>
        </div>
      </div>

      {/* Preset Badges */}
      <div className="mb-6 relative z-10">
        <label className="block text-[10px] font-bold text-violet-400 font-mono uppercase tracking-wider mb-2">
          {isTa ? "வலை மாதிரி குறிப்புகள் (Presets):" : "Or Load Sample Scripts:"}
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset, index) => (
            <button
              key={index}
              onClick={() => handleApplyPreset(preset)}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-950/80 hover:bg-violet-950/60 text-slate-300 hover:text-violet-300 border border-violet-950/30 rounded-xl text-xs font-semibold cursor-pointer transition shadow-sm font-sans"
            >
              <FileText className="h-3.5 w-3.5 text-violet-500" />
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-5 relative z-10">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="input_title" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
              {isTa ? "பிரசன்டேஷன் தலைப்பு (விருப்பத்தேர்வு)" : "Document Title (Optional)"}
            </label>
            <input
              id="input_title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              placeholder={isTa ? "உதாரணமாக: இயந்திர கற்றல் பாடக்குறிப்பு" : "e.g. Backpropagation Optimization Deep-Dive"}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-slate-950 border border-violet-950/40 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-800 transition font-sans"
            />
          </div>

          <div>
            <label htmlFor="target_lang" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono flex items-center gap-1">
              <Globe className="h-3 w-3 text-violet-400" />
              {isTa ? "வெளியீட்டு மொழி" : "Output Language"}
            </label>
            <select
              id="target_lang"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 bg-slate-950 border border-violet-950/40 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-800 cursor-pointer font-sans"
            >
              <option value="en">English (ஆங்கிலம்)</option>
              <option value="ta">Tamil (தமிழ்)</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="input_script" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              {isTa ? "உரை ஸ்கிரிப்ட், பாட விவரங்கள் அல்லது வாய்மொழி உரையாடல்" : "Source script, transcript, or document content"}
            </label>
            <span className="text-[10px] text-slate-500 font-mono">
              {script.length} {isTa ? "எழுத்துக்கள்" : "chars"}
            </span>
          </div>
          <textarea
            id="input_script"
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder={isTa 
              ? "உங்கள் மூல உரையாடல், வீடியோ ஸ்கிரிப்ட் அல்லது கூட்ட குறிப்புகளை இங்கே ஒட்டவும். ஜெமினி ஏஐ இதை அழகான மார்க் டவுன் ஸ்லைடு கட்டமைப்பாக மாற்றும்..." 
              : "Paste your raw script, disorganized outline, developer transcript, video voiceovers, or meeting minutes here..."
            }
            disabled={isLoading}
            required
            rows={10}
            className="w-full px-4 py-3 bg-slate-950 border border-violet-950/40 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-800 placeholder:text-slate-600 transition font-sans leading-relaxed resize-none"
          ></textarea>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="input_slides" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
              {isTa ? "சுமார் ஸ்லைடுகளின் எண்ணிக்கை" : "Target Slides Count"}
            </label>
            <select
              id="input_slides"
              value={slideCount}
              onChange={(e) => setSlideCount(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 bg-slate-950 border border-violet-950/40 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-800 cursor-pointer font-sans"
            >
              <option value="Automatic">{isTa ? "தானியங்கி (தானாக முடிவு செய்ய)" : "Automatic (Let Gemini Decide)"}</option>
              <option value="5-7 Slides (Summary)">{isTa ? "5-7 ஸ்லைடுகள் (குறுகிய சுருக்கம்)" : "5-7 Slides (Short Overview)"}</option>
              <option value="8-12 Slides (Standard)">{isTa ? "8-12 ஸ்லைடுகள் (சாதாரண அளவு)" : "8-12 Slides (Standard Deck)"}</option>
              <option value="13-18 Slides (Comprehensive)">{isTa ? "13-18 ஸ்லைடுகள் (முழு வழிகாட்டி)" : "13-18 Slides (Comprehensive Guide)"}</option>
            </select>
          </div>

          <div>
            <label htmlFor="input_audience" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
              {isTa ? "கேட்போரின் பாணி விருப்பம்" : "Audience & Style Vibe"}
            </label>
            <select
              id="input_audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 bg-slate-950 border border-violet-950/40 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-800 cursor-pointer font-sans"
            >
              <option value="Professional & Formal">{isTa ? "வணிக முறை & தொழில்முறை" : "Professional & Formal"}</option>
              <option value="Technical & Detailed">{isTa ? "தொழில்நுட்பம் & மிகத் துல்லியமானது" : "Technical & Detailed (Highly Educational)"}</option>
              <option value="Casual & Engaging">{isTa ? "சாதாரண & சுவாரஸ்யமான வடிவம்" : "Casual & Story-focused"}</option>
              <option value="Academic & Rigorous">{isTa ? "கல்விசார் & அறிவியல் பூர்வமானது" : "Academic & Scientific Rigor"}</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          {isLoading ? (
            <div className="bg-slate-950 border border-violet-950/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Loader2 className="h-5 w-5 text-violet-400 animate-spin" />
                <span className="font-bold text-xs font-mono uppercase tracking-wider text-slate-200">
                  {isTa ? "ஜெமினி AI பகுப்பாய்வு செய்கிறது" : "Structuring with Gemini AI"}
                </span>
              </div>
              <motion.p
                key={loadingStep}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-xs text-violet-400 font-mono tracking-wide"
              >
                {loadingMessages[loadingStep]}
              </motion.p>
            </div>
          ) : (
            <button
              id="btn_ingest"
              type="submit"
              disabled={!script.trim()}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-violet-900/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles className="h-4 w-4" />
              {isTa ? "ஸ்கிரிப்டை அலசி ஸ்லைடு வடிவமைப்பை உருவாக்கு" : "Ingest & Build Presentation structure"}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
