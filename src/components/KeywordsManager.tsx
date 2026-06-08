import React, { useState } from 'react';
import { Plus, X, Search, Loader2 } from 'lucide-react';

interface KeywordsManagerProps {
  keywords: string[];
  onAddKeyword: (kw: string) => void;
  onRemoveKeyword: (kw: string) => void;
  onSearchAll: () => void;
  isFetching: boolean;
  loadingText: string;
}

export function KeywordsManager({ 
  keywords, onAddKeyword, onRemoveKeyword, onSearchAll, isFetching, loadingText 
}: KeywordsManagerProps) {
  const [newKw, setNewKw] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKw.trim() && !keywords.includes(newKw.trim())) {
      onAddKeyword(newKw.trim());
      setNewKw('');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Termos Monitorados</h2>
          <p className="text-sm text-gray-500">Gerencie as palavras-chave usadas nas bucas automáticas.</p>
        </div>
        <button
          onClick={onSearchAll}
          disabled={isFetching}
          className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 shadow-lg shadow-black/10 w-full sm:w-auto shrink-0"
        >
          {isFetching ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {loadingText}
            </>
          ) : (
            <>
              <Search size={18} className="text-yellow-400" />
              Buscar Todas
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 mb-6 max-w-md">
        <input 
          type="text" 
          placeholder="Adicionar novo termo..."
          className="flex-1 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          value={newKw}
          onChange={(e) => setNewKw(e.target.value)}
        />
        <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors">
          <Plus size={18} />
          Adicionar
        </button>
      </form>

      <div className="flex flex-wrap gap-2 pt-2">
        {keywords.map(kw => (
          <span key={kw} className="flex items-center gap-2 bg-gray-100 border border-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-sm font-medium">
            {kw}
            <button 
              onClick={() => onRemoveKeyword(kw)} 
              className="text-gray-400 hover:text-rose-500 transition-colors ml-1 p-0.5 rounded-sm hover:bg-rose-50"
              title="Remover"
            >
              <X size={14} />
            </button>
          </span>
        ))}
        {keywords.length === 0 && (
          <p className="text-sm text-gray-500 italic">Nenhum termo monitorado.</p>
        )}
      </div>
    </div>
  );
}
