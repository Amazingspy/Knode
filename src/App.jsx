/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sparkles, Layers, Sliders, FileDown, BookOpen, 
  HelpCircle, Check, Play, RefreshCw, LogOut, ArrowLeft, Loader2, Globe, Lock, ShieldCheck, User,
  ShieldAlert, ExternalLink, X
} from "lucide-react";
import { IngestionPanel } from "./components/IngestionPanel";
import { EditorPanel } from "./components/EditorPanel";
import { ExportPanel } from "./components/ExportPanel";
import { PackageLibrary } from "./components/PackageLibrary";

// Firebase imports
import { auth, db, firebaseEnabled, signInWithGoogle, logoutUser, handleFirestoreError, OperationType, firebaseConfig } from "./utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, where } from "firebase/firestore";

export default function App() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("knode_lang") || "en";
  });
  
  const isTa = language === "ta";

  // Library list
  const [library, setLibrary] = useState([]);
  const [activePackageId, setActivePackageId] = useState(null);
  
  // App views: "edit" | "export"
  const [viewMode, setViewMode] = useState("edit");
  
  // Loading & Error states
  const [isIngesting, setIsIngesting] = useState(false);
  const [errorText, setErrorText] = useState(null);

  // User state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Persist language picker selection
  useEffect(() => {
    localStorage.setItem("knode_lang", language);
  }, [language]);

  // Auth monitoring & Firestore subscriptions (Phase 1 & Phase 8 of skill)
  useEffect(() => {
    if (!firebaseEnabled || !auth) {
      setAuthLoading(false);
      // Fallback localstorage database loading
      loadLocalLibrary();
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        // Subscribe to user specific packages
        const q = query(
          collection(db, "packages"), 
          where("userId", "==", currentUser.uid)
        );
        
        const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
          const pkgs = [];
          snapshot.forEach((d) => {
            pkgs.push({ id: d.id, ...d.data() });
          });
          // Sort descending by creation date
          pkgs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setLibrary(pkgs);
          
          // Auto select first item if present and none active
          if (pkgs.length > 0 && !activePackageId) {
            setActivePackageId(pkgs[0].id);
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, "packages");
        });

        return () => unsubscribeFirestore();
      } else {
        // User logged out, load local storage database
        loadLocalLibrary();
      }
    });

    return () => unsubscribeAuth();
  }, [activePackageId]);

  const loadLocalLibrary = () => {
    try {
      const stored = localStorage.getItem("knode_library");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setLibrary(parsed);
          if (parsed.length > 0 && !activePackageId) {
            setActivePackageId(parsed[0].id);
          }
        }
      } else {
        setLibrary([]);
      }
    } catch (e) {
      console.error("Local Storage library load failed:", e);
    }
  };

  // Helper to persist library to whichever database is active
  const savePackageData = async (pkg) => {
    if (user && firebaseEnabled && db) {
      try {
        await setDoc(doc(db, "packages", pkg.id), {
          ...pkg,
          userId: user.uid,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        setErrorText("Failed to sync changes to the cloud.");
        handleFirestoreError(err, OperationType.WRITE, `packages/${pkg.id}`);
      }
    } else {
      // Offline Local Storage sync
      const updatedLib = [pkg, ...library.filter(p => p.id !== pkg.id)];
      setLibrary(updatedLib);
      localStorage.setItem("knode_library", JSON.stringify(updatedLib));
    }
  };

  const handleIngest = async (params) => {
    setIsIngesting(true);
    setErrorText(null);

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const errObj = await res.json();
        throw new Error(errObj.error || "Failed to structure slide package.");
      }

      const newPackage = await res.json();
      
      // Save data
      await savePackageData(newPackage);
      setActivePackageId(newPackage.id);
      setViewMode("edit");
    } catch (err) {
      console.error("Ingestion error:", err);
      setErrorText(err.message || "An issue occurred connecting to the Gemini server engine.");
    } finally {
      setIsIngesting(false);
    }
  };

  const handleUpdatePackage = async (updatedPackage) => {
    // Update local lists immediately for fast response
    setLibrary(prev => prev.map(p => p.id === updatedPackage.id ? updatedPackage : p));
    await savePackageData(updatedPackage);
  };

  const handleDeletePackage = async (pkgId) => {
    if (user && firebaseEnabled && db) {
      try {
        await deleteDoc(doc(db, "packages", pkgId));
      } catch (err) {
         handleFirestoreError(err, OperationType.DELETE, `packages/${pkgId}`);
      }
    } else {
      const updatedLib = library.filter(pkg => pkg.id !== pkgId);
      setLibrary(updatedLib);
      localStorage.setItem("knode_library", JSON.stringify(updatedLib));
    }

    if (activePackageId === pkgId) {
      const nextId = library.filter(p => p.id !== pkgId)?.[0]?.id || null;
      setActivePackageId(nextId);
    }
  };

  const handleSelectPackage = (pkgId) => {
    setActivePackageId(pkgId);
    setViewMode("edit");
  };

  const handleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Auth login failure:", err);
      const errStr = String(err);
      if (
        err.code === "auth/popup-closed-by-user" || 
        errStr.includes("popup-closed-by-user") || 
        errStr.includes("popup closed") || 
        errStr.includes("cancelled-by-user")
      ) {
        setAuthError({
          title: isTa ? "பாப்-அப் பூட்டப்பட்டது அல்லது மூடப்பட்டது" : "Sign-In Popup Blocked/Closed",
          desc: isTa 
            ? "கூகுள் கணக்கு உள்நுழைவு பாப்-அப் விண்டோ தடுக்கப்பட்டது அல்லது மூடப்பட்டது. நீங்கள் கூகுள் ஏஐ ஸ்டுடியோ ஐபிரேம் (iframe) உள்ளே இயங்குவதால் இருக்கலாம். கீழே உள்ள ‘புதிய தாவலில் திற’ பொத்தானை சொடுக்கி தனிப் பக்கத்தில் வெற்றிகரமாக உள்நுழையவும்!" 
            : "The Sign-In popup window was closed, cancelled, or blocked by your browser. Because the application is running inside a Google AI Studio sandbox iframe, secure popups are heavily restricted. Open the app in a new tab to complete Google login!",
          isIframeIssue: true
        });
      } else if (
        err.code === "auth/unauthorized-domain" || 
        errStr.includes("unauthorized-domain") || 
        errStr.includes("auth/unauthorized-domain")
      ) {
        setAuthError({
          title: isTa ? "டொமைன் அனுமதிக்கப்படவில்லை (Unauthorized Domain)" : "Domain Not Authorized in Firebase",
          desc: isTa
            ? "தீர்வு: உங்கள் கூகுள் ஃபயர்பேஸ் கன்சோல் (Firebase Console) அமைப்பில் இந்த அப்ளிகேஷன் டொமைன் அங்கீகரிக்கப்படவில்லை. கீழே உள்ள ‘ஃபயர்பேஸ் கன்சோலைத் திற’ பட்டனை சொடுக்கி, பின்வரும் டொமைன்களை அங்கீகரிக்கப்பட்ட டொமைன்களில் சேர்க்கவும்:"
            : "The domain of this application is not authorized in your Google Firebase project configuration yet. To fix this, click the button below to open your Firebase Console Security Settings, and add the domains listed below under the 'Authorized domains' section:",
          isUnauthorizedDomain: true,
          projectId: firebaseConfig?.projectId || "knode-ac693",
          domains: [
            "localhost",
            window.location.hostname
          ]
        });
      } else {
        setAuthError({
          title: isTa ? "உள்நுழைவுப் பிழை" : "Authentication Failure",
          desc: err.message || errStr,
          isIframeIssue: false
        });
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setActivePackageId(null);
      loadLocalLibrary();
    } catch (err) {
      console.error("Auth logout failure:", err);
    }
  };

  const activePackage = library.find(p => p.id === activePackageId);

  // Localization resources
  const strings = {
    tag: isTa ? "மதிப்பீடு v2.0" : "v2.0 Beta",
    openNotebook: isTa ? "நோட்புக்எல்எம் திற" : "Open NotebookLM",
    whyKnodeHeader: isTa ? "க்னோடு எதற்காக?" : "What does Knode do?",
    whyKnodeP1: isTa 
      ? "க்னோடு (Knode) என்பது நோட்புக்எல்எம் (NotebookLM)க்கு ஏற்றவாறு உயர்தர ஆவணங்களை வடிவமைக்கும் கருவியாகும். நோட்புக்எல்எம் சிறந்த ஸ்லைடுகளை உருவாக்க வல்லது, ஆனால் அதற்கு ஒழுங்கற்ற உரைகளை விட மிக ஒழுங்கான வழிகாட்டல் மூலங்கள் தேவை."
      : "Knode is a premium blueprint tool designed to feed NotebookLM. NotebookLM creates outstanding slides, but fails when ingested with messy transcript blobs.",
    whyKnodeP2: isTa
      ? "குழப்பமான கூட்ட குறிப்புகள், கருத்துக்களைக் கொண்டு நோட்புக்எல்எம்-க்கு உகந்த வடிவில் கீழ்கண்டவாறு ஸ்லைடு ஆவணத்தை இது உருவாக்கும்:"
      : "Knode turns chaotic raw transcripts or outlines into a structured Markdown slide document specifying:",
    fe1: isTa ? "திட்டவட்டமான கற்றல் நோக்கங்கள்" : "Defined learning objectives",
    fe2: isTa ? "முழுமையான கலைச்சொற்கள் அகராதி" : "Comprehensive glossary vocab list",
    fe3: isTa ? "ஸ்லைடு வாரியான திட்டவரைபடம்" : "Cohesive sequential slide outlines",
    fe4: isTa ? "பேச்சாளர் விளக்க உரை குறிப்புகள்" : "Fleshed-out speaker talking scripts",
    fe5: isTa ? "காட்சி வரைபட விளக்கங்கள்" : "Precise visuals and diagram description prompts",
    structError: isTa ? "ஏற்பட்ட கோளாறு:" : "Structuring Problem:",
    noPackageActive: isTa ? "ஸ்லைடு வரைபடங்கள்" : "Slides Map",
    sidebarTitle: isTa ? "வடிவமைப்பு மையம்" : "Interactive Workspace",
    exportTab: isTa ? "ஏற்றுமதி வரிசை" : "Export Pipeline",
    footerCopy: isTa 
      ? "© 2026 க்னோடு மென்பொருள் • கூகுள் நோட்புக்எல்எம் இன்ஜெஷனுக்காக வடிவமைக்கப்பட்டது." 
      : "© 2026 Knode System • Optimized for Google NotebookLM Ingestion.",
    footerNode: isTa ? "இயங்கும் முகவரி: கிளவுட் ரன் போர்ட் 3000" : "Server node: Cloud Run Port 3000",
    cloudConnected: isTa ? "மேகம் ஒத்திசைக்கப்பட்டது" : "Cloud Sync Active",
    localConnected: isTa ? "உள்ளூர் சேமிப்பு ஆக்டிவ்" : "Local Database Mode",
    signinGoogle: isTa ? "கூகுள் கணக்குடன் உள்நுழையவும்" : "Sign in with Google",
    guestGreeting: isTa ? "வரவேற்கிறோம் விருந்தினரே!" : "Welcome Guest!",
    helloUser: isTa ? "வணக்கம்" : "Hello",
    logoutBtn: isTa ? "வெளியேறு" : "Logout"
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans flex flex-col antialiased">
      {/* Top Banner Branding Header: Full Width Layout with Purple glowing elements */}
      <header className="bg-slate-950/90 border-b border-violet-950/60 sticky top-0 z-50 backdrop-blur-md px-4 sm:px-8 xl:px-12 py-4">
        <div className="w-full h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-violet-900/30">
              K
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base tracking-tight text-white">Knode</h1>
                <span className="bg-violet-950 border border-violet-800 text-violet-350 text-[9px] font-bold font-mono px-2 py-0.5 rounded-full uppercase">
                  {strings.tag}
                </span>
                {firebaseEnabled && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-900 text-emerald-400 text-[9px] font-bold font-mono">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    {user ? strings.cloudConnected : strings.localConnected}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">NotebookLM Slides Source Structurer & Copilot</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="flex bg-slate-900 border border-violet-950/40 p-0.5 rounded-xl">
              <button 
                onClick={() => setLanguage("en")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${language === "en" ? "bg-violet-950 text-white" : "text-slate-500 hover:text-slate-300"}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage("ta")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition cursor-pointer ${language === "ta" ? "bg-violet-950 text-white" : "text-slate-500 hover:text-slate-300"}`}
              >
                தமிழ்
              </button>
            </div>

            {/* NotebookLM External Launcher Link */}
            <a 
              href="https://notebooklm.google" 
              target="_blank" 
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white border border-violet-950/40 hover:border-violet-900 bg-slate-950 px-4 py-2 rounded-xl transition shadow-inner font-mono"
            >
              {strings.openNotebook}
            </a>

            {/* Auth panel */}
            {authLoading ? (
              <Loader2 className="h-4 w-4 text-violet-400 animate-spin" />
            ) : firebaseEnabled ? (
              user ? (
                <div className="flex items-center gap-3 bg-slate-900/80 border border-violet-950 p-1.5 pr-3 rounded-2xl shadow-sm">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} referrerPolicy="no-referrer" className="w-7 h-7 rounded-lg" />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-violet-950 text-violet-300 flex items-center justify-center font-bold text-xs">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div className="hidden md:block text-left">
                    <p className="text-[10px] font-bold text-slate-200 leading-tight block max-w-24 truncate">{user.displayName || strings.helloUser}</p>
                    <p className="text-[9px] text-slate-500 font-mono block max-w-24 truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    title={strings.logoutBtn}
                    className="p-1 hover:bg-red-950/50 text-slate-450 hover:text-red-400 rounded-md cursor-pointer transition ml-1"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-violet-600 hover:bg-violet-750 text-white px-4 py-2 rounded-xl cursor-pointer shadow-md transition"
                >
                  <Lock className="h-3.5 w-3.5" />
                  {strings.signinGoogle}
                </button>
              )
            ) : (
              <span className="hidden md:inline-flex px-3 py-1.5 rounded-lg bg-slate-900 text-slate-500 font-mono text-xs border border-violet-950/20">
                {strings.guestGreeting}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Container Workspace layout: full width to fill up spaces */}
      <main className="flex-grow w-full px-4 sm:px-8 xl:px-12 py-8 relative">
        {authError && (
          <div id="auth_error_banner" className="mb-8 bg-red-950/20 border border-red-900/30 rounded-2xl p-5 md:p-6 shadow-2xl flex flex-col md:flex-row items-start justify-between gap-5 relative overflow-hidden backdrop-blur-sm animate-fadeIn">
            {/* Ambient Red glow background decorator */}
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex gap-4 items-start relative z-10">
              <div className="p-3 bg-red-950/60 border border-red-900/30 text-red-400 rounded-xl shrink-0">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-red-200 tracking-tight">
                  {authError.title}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
                  {authError.desc}
                </p>
                {authError.isIframeIssue && (
                  <div className="mt-3 flex items-center gap-3">
                    <a
                      href={window.location.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-violet-650 hover:bg-violet-750 border border-violet-800 text-white rounded-lg text-xs font-bold transition shadow cursor-pointer uppercase tracking-wider font-mono"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {isTa ? "புதிய தாவலில் திற" : "Open App in New Tab"}
                    </a>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {isTa ? "பாதுகாப்பான அடுக்கில் இயங்கும்" : "Escapes Iframe Sandbox"}
                    </span>
                  </div>
                )}

                {authError.isUnauthorizedDomain && (
                  <div className="mt-4 space-y-3.5">
                    <div className="bg-slate-950/80 rounded-xl p-4 border border-red-900/40 max-w-xl shadow-inner">
                      <div className="text-[10px] text-slate-400 font-bold font-mono mb-2 uppercase tracking-wider">
                        {isTa ? "அங்கீகரிக்கப்பட வேண்டிய டொமைன்கள்:" : "Domains to whitelist in Firebase Console:"}
                      </div>
                      <div className="space-y-2">
                        {authError.domains.map((domain, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs font-mono bg-red-950/20 px-3 py-1.5 rounded-lg text-red-200 border border-red-900/25">
                            <span className="select-all">{domain}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(domain);
                              }}
                              className="text-[10px] bg-violet-950 hover:bg-violet-900 active:bg-violet-850 text-violet-300 font-bold px-2.5 py-1 rounded cursor-pointer transition select-none font-mono uppercase tracking-wider"
                              title="Copy to clipboard"
                            >
                              Copy
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <a
                        href={`https://console.firebase.google.com/project/${authError.projectId}/authentication/settings`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-750 border border-violet-700 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer uppercase tracking-wider font-mono"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {isTa ? "ஃபயர்பேஸ் கன்சோல் திற" : "Open Firebase console settings"}
                      </a>
                      <span className="text-[10px] text-slate-500 font-sans">
                        {isTa ? "உள்நுழைவுப் பக்கத்திற்கு அங்கீகாரத்தைத் தருங்கள்" : "Go to Authentication > Settings > Authorized domains"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setAuthError(null)}
              className="p-1.5 hover:bg-red-950 text-red-450 hover:text-red-300 rounded-lg transition shrink-0 relative z-10 cursor-pointer self-start md:self-center"
              title={isTa ? "மூடு" : "Dismiss Warning"}
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel Sidebar Directory (4 Cols) */}
          <section className="lg:col-span-4 space-y-6">
            <PackageLibrary
              library={library}
              activePackageId={activePackageId}
              onSelect={handleSelectPackage}
              onDelete={handleDeletePackage}
              onStartNew={() => setActivePackageId(null)}
              language={language}
            />

            {/* Application Info Guide Card */}
            <div className="bg-slate-900/40 border border-violet-950/30 rounded-2xl p-5 shadow-lg space-y-3.5">
              <h4 className="font-extrabold text-violet-400 text-xs font-mono uppercase tracking-wider">
                {strings.whyKnodeHeader}
              </h4>
              <p className="text-xs text-slate-350 leading-relaxed font-sans">
                {strings.whyKnodeP1}
              </p>
              <p className="text-xs text-slate-350 leading-relaxed font-sans">
                {strings.whyKnodeP2}
              </p>
              <ul className="text-xs text-slate-400 list-disc pl-4 space-y-1.5 font-sans">
                <li>{strings.fe1}</li>
                <li>{strings.fe2}</li>
                <li>{strings.fe3}</li>
                <li>{strings.fe4}</li>
                <li>{strings.fe5}</li>
              </ul>
            </div>
          </section>

          {/* Right Panel Main Canvas (8 Cols) */}
          <section className="lg:col-span-8">
            {/* If Ingestion mode (no active package selected) */}
            {!activePackageId ? (
              <div className="space-y-6">
                {errorText && (
                  <div className="bg-red-950/40 border border-red-900/30 text-red-300 rounded-xl p-4 text-xs font-semibold leading-relaxed">
                    <p className="font-bold font-mono text-[10px] uppercase tracking-wider">{strings.structError}</p>
                    <p className="mt-1">{errorText}</p>
                  </div>
                )}
                <IngestionPanel 
                  onIngest={handleIngest} 
                  isLoading={isIngesting} 
                  language={language}
                  onLanguageChange={setLanguage}
                />
              </div>
            ) : (
              /* Core Customize workspace active */
              activePackage && (
                <div className="space-y-6">
                  {/* Workspace Status Segment Controller */}
                  <div className="bg-slate-900 border border-violet-950/40 rounded-2xl p-4 shadow-xl flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActivePackageId(null)}
                        className="p-2 bg-slate-950 hover:bg-slate-850 rounded-xl border border-violet-950 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                        title={isTa ? "துவக்கப் புள்ளிக்குத் திரும்பு" : "Back to start"}
                      >
                        <ArrowLeft className="h-4.5 w-4.5" />
                      </button>
                      <div>
                        <h2 className="font-extrabold text-slate-200 text-xs sm:text-sm tracking-tight">{activePackage.title}</h2>
                        <span className="text-[10px] text-violet-400 font-mono">
                          {activePackage.slides?.length || 0} {strings.noPackageActive}
                        </span>
                      </div>
                    </div>

                    {/* Editor View Tab Selector */}
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-violet-950/30">
                      <button
                        onClick={() => setViewMode("edit")}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bolder cursor-pointer transition ${
                          viewMode === "edit"
                            ? "bg-violet-950 text-violet-100 border border-violet-850"
                            : "text-slate-500 hover:text-slate-350"
                        }`}
                      >
                        <Sliders className="h-3.5 w-3.5" />
                        {strings.sidebarTitle}
                      </button>
                      <button
                        onClick={() => setViewMode("export")}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bolder cursor-pointer transition ${
                          viewMode === "export"
                            ? "bg-violet-950 text-violet-100 border border-violet-850"
                            : "text-slate-500 hover:text-slate-350"
                        }`}
                      >
                        <FileDown className="h-3.5 w-3.5" />
                        {strings.exportTab}
                      </button>
                    </div>
                  </div>

                  {/* Render Tab Contents */}
                  {viewMode === "edit" ? (
                    <EditorPanel 
                      packageData={activePackage} 
                      onUpdatePackage={handleUpdatePackage}
                      language={language}
                    />
                  ) : (
                    <ExportPanel 
                      packageData={activePackage} 
                      language={language}
                    />
                  )}
                </div>
              )
            )}
          </section>
        </div>
      </main>

      {/* Footer Branding: full width stretch */}
      <footer className="bg-slate-950 border-t border-violet-950/40 mt-16 py-8 px-4 sm:px-8 xl:px-12 font-mono">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed">
          <p>{strings.footerCopy}</p>
          <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
            <span>{strings.footerNode}</span>
            <span>•</span>
            <span className="text-violet-400">Gemini 3.5 AI Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
