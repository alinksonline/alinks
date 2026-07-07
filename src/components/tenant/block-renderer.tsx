import React from "react";
import type { PageBlock } from "@/core/types/page";

export function BlockRenderer({ block, primaryColor }: { block: PageBlock; primaryColor: string }) {
  // If data exists, use it, else fallback to empty
  const data = block.data || {};

  switch (block.type) {
    case "services":
      return (
        <section className="py-12 bg-white rounded-xl shadow-sm border border-slate-100 px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{block.title}</h2>
            {block.body && <p className="mt-4 text-slate-600 max-w-2xl mx-auto">{block.body}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Hardcoded placeholders for now since editor list editing is pending */}
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
                <div 
                  className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  {item}
                </div>
                <h3 className="font-bold text-lg text-slate-900">Service {item}</h3>
                <p className="text-slate-600 mt-2 text-sm">Description of this service offering goes here. This will be customizable soon.</p>
              </div>
            ))}
          </div>
        </section>
      );

    case "features":
      return (
        <section className="py-12">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">{block.title}</h2>
              <p className="text-slate-600 whitespace-pre-wrap text-lg leading-relaxed">{block.body}</p>
            </div>
            <div className="flex-1 bg-slate-100 rounded-3xl min-h-[300px] w-full flex items-center justify-center text-slate-400 border border-slate-200">
              Image Placeholder
            </div>
          </div>
        </section>
      );

    default:
      // Fallback for "text", "legal", "contact", etc.
      return (
        <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="font-bold text-2xl text-slate-900 mb-4">{block.title}</h2>
          <div className="prose prose-slate max-w-none">
            <p className="whitespace-pre-wrap text-slate-600 leading-relaxed">{block.body}</p>
          </div>
        </section>
      );
  }
}
