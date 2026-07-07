"use client";

import React from "react";
import type { PageBlock } from "@/core/types/page";

export function BlockEditorPanel({ 
  block, 
  onClose, 
  onChange 
}: { 
  block: PageBlock; 
  onClose: () => void; 
  onChange: (b: PageBlock) => void 
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl z-50 border-l flex flex-col animate-in slide-in-from-right">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-lg capitalize">Edit {block.type} Block</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-light">&times;</button>
        </div>
        
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Section Title</label>
            <input 
              className="w-full rounded-lg border px-3 py-2" 
              value={block.title} 
              onChange={(e) => onChange({...block, title: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Section Description</label>
            <textarea 
              className="w-full rounded-lg border px-3 py-2 text-sm" 
              value={block.body} 
              onChange={(e) => onChange({...block, body: e.target.value})} 
              rows={3}
            />
          </div>
          
          {/* Specific Block Editing Logic */}
          {block.type === 'services' && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Service Items</h3>
                <button className="text-sm text-[var(--theme-primary)] font-medium">
                  + Add Service
                </button>
              </div>
              <p className="text-xs text-gray-500">Service list editing coming soon!</p>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t bg-gray-50">
          <button 
            type="button" 
            onClick={onClose} 
            className="w-full bg-[var(--theme-primary)] text-white rounded-lg py-2 font-semibold hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}
