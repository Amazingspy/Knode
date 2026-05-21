/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { FolderHeart, Plus, Trash2, Calendar, FileText, ChevronRight } from "lucide-react";

export function PackageLibrary({
  library,
  activePackageId,
  onSelect,
  onDelete,
  onStartNew,
  language = "en"
}) {
  const isTa = language === "ta";

  return (
    <div id="package_library" className="bg-slate-900/60 border border-violet-950/40 rounded-2xl p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-violet-950/40 pb-3">
        <div className="flex items-center gap-2">
          <FolderHeart className="h-5 w-5 text-violet-400 shrink-0" />
          <h3 className="font-bold text-slate-100 text-xs tracking-wider uppercase font-mono">
            {isTa ? "பணி உறை அடைவு" : "Workspace Library"}
          </h3>
        </div>
        <button
          onClick={onStartNew}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-violet-300 hover:text-white bg-violet-950/60 hover:bg-violet-900 border border-violet-850/40 px-3 py-1.5 rounded-xl cursor-pointer transition shadow-sm font-mono uppercase"
        >
          <Plus className="h-3 w-3" />
          {isTa ? "புதிய வரைவு" : "New Outline"}
        </button>
      </div>

      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-violet-950/50">
        {library.map((pkg) => {
          const isActive = pkg.id === activePackageId;
          const pkgLang = pkg.lang || "en";
          return (
            <div
              key={pkg.id}
              onClick={() => onSelect(pkg.id)}
              className={`group flex items-center justify-between p-3 rounded-xl border select-none transition cursor-pointer ${
                isActive
                  ? "bg-violet-950/40 border-violet-800 text-violet-100 shadow-inner"
                  : "bg-slate-950/40 hover:bg-slate-900/60 border-violet-950/20 text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <FileText className={`h-4 w-4 shrink-0 ${isActive ? "text-violet-400" : "text-slate-500"}`} />
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-xs text-slate-200 block truncate group-hover:text-violet-200 transition">
                    {pkg.title}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1.5 font-mono mt-0.5">
                    <Calendar className="h-2.5 w-2.5" />
                    {new Date(pkg.createdAt).toLocaleDateString()} • {pkg.slides?.length || 0} {isTa ? "ஸ்லைடுகள்" : "slides"}
                    <span className="px-1.5 py-0.2 bg-violet-950/60 border border-violet-850/30 text-violet-400 rounded-md text-[8px] uppercase tracking-wider scale-90">
                      {pkgLang === "ta" ? "தமிழ்" : "EN"}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(pkg.id);
                  }}
                  title={isTa ? "நீக்கு" : "Delete Draft"}
                  className="p-1.5 hover:bg-red-950/50 text-slate-500 hover:text-red-400 rounded-lg transition opacity-0 group-hover:opacity-100 cursor-pointer shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <ChevronRight className="h-4 w-4 text-violet-900 shrink-0" />
              </div>
            </div>
          );
        })}

        {library.length === 0 && (
          <div className="text-center py-6 text-slate-400 space-y-1 bg-slate-950/30 border border-dashed border-violet-950/40 rounded-xl">
            <span className="text-xs font-semibold block">{isTa ? "உங்கள் பணி உறை காலியாக உள்ளது." : "Your workspace library is empty."}</span>
            <span className="text-[10px] font-mono text-slate-500 block">{isTa ? "தொடங்குவதற்கு மேலே உள்ள படிவத்தில் உரையைச் சேர்க்கவும்." : "Ingest a manuscript script above to populate."}</span>
          </div>
        )}
      </div>
    </div>
  );
}
