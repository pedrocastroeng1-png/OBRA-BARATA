import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardStats } from './components/DashboardStats';
import { OfferCard } from './components/OfferCard';
import { HistoryTable } from './components/HistoryTable';
import { KeywordsManager } from './components/KeywordsManager';
import { DiagnosticPage } from './components/DiagnosticPage';
import { fetchMercadoLivreOffers } from './services/mercadoLivreService';
import { 
  getStoredOffers, 
  saveStoredOffers, 
  getLastUpdate, 
  setLastUpdate, 
  mergeNewOffers,
  getStoredKeywords,
  saveStoredKeywords
} from './lib/storage';
import { Offer, Stats } from './types';
import { Loader2, Search } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'history' | 'keywords' | 'settings' | 'diagnostic'>('dashboard');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [lastUpdate, setLastUpdateState] = useState<string | null>(null);
  
  const [isFetching, setIsFetching] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  // Initial load
  useEffect(() => {
    setOffers(getStoredOffers());
    setKeywords(getStoredKeywords());
    setLastUpdateState(getLastUpdate());
  }, []);

  // Sync to storage
  useEffect(() => {
    saveStoredOffers(offers);
  }, [offers]);

  useEffect(() => {
    saveStoredKeywords(keywords);
  }, [keywords]);

  const handleFetchOffers = async (fetchAll: boolean = false) => {
    setIsFetching(true);
    setLoadingText('Buscando...');
    
    try {
      // If not fetchAll, search a random subset of 5 terms. Otherwise search all.
      const termsToSearch = fetchAll 
        ? keywords 
        : [...keywords].sort(() => 0.5 - Math.random()).slice(0, Math.min(5, keywords.length));

      const fetchedOffers = await fetchMercadoLivreOffers(termsToSearch, (keyword) => {
        setLoadingText(`Buscando: ${keyword}`);
      });
      
      const combined = mergeNewOffers(offers, fetchedOffers);
      setOffers(combined);
      
      const now = new Date().toISOString();
      setLastUpdate(now);
      setLastUpdateState(now);
      
      if (fetchAll && currentTab !== 'dashboard') {
        setCurrentTab('dashboard');
      }
    } catch (error) {
      console.error("Fetch failed", error);
    } finally {
      setIsFetching(false);
      setLoadingText('');
    }
  };

  const handleStatusChange = (id: string, status: 'approved' | 'rejected') => {
    setOffers(prev => prev.map(o => 
      o.id === id 
        ? { ...o, status, dateProcessed: new Date().toISOString() } 
        : o
    ));
  };

  const pendingOffers = offers
    .filter(o => o.status === 'pending')
    .sort((a, b) => b.discountPercentage - a.discountPercentage); // Ordenadas por maior desconto
    
  const historyOffers = offers.filter(o => o.status !== 'pending')
    .sort((a, b) => new Date(b.dateProcessed || 0).getTime() - new Date(a.dateProcessed || 0).getTime());

  const stats: Stats = {
    foundToday: offers.filter(o => new Date(o.dateAdded).toDateString() === new Date().toDateString()).length,
    approved: offers.filter(o => o.status === 'approved').length,
    rejected: offers.filter(o => o.status === 'rejected').length,
    lastUpdate
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />

      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {currentTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <DashboardStats stats={stats} />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-12 mb-6 border-b border-gray-200 pb-4 gap-4">
                <h2 className="text-xl font-bold gap-2 flex items-center text-gray-900">
                  Ofertas Pendentes
                  <span className="bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full font-bold">
                    {pendingOffers.length}
                  </span>
                </h2>
                
                <button
                  onClick={() => handleFetchOffers(true)}
                  disabled={isFetching}
                  className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 shadow-lg shadow-black/10"
                >
                  {isFetching ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      {loadingText}
                    </>
                  ) : (
                    <>
                      <Search size={18} className="text-yellow-400" />
                      Buscar Melhores Ofertas do Dia
                    </>
                  )}
                </button>
              </div>

              {pendingOffers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {pendingOffers.map(offer => (
                    <OfferCard 
                      key={offer.id} 
                      offer={offer} 
                      onApprove={(id) => handleStatusChange(id, 'approved')}
                      onReject={(id) => handleStatusChange(id, 'rejected')}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Nenhuma oferta pendente</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    Clique em "Buscar Melhores Ofertas do Dia" para varrer as marcas de construção civil.
                  </p>
                </div>
              )}
            </div>
          )}

          {currentTab === 'history' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-6 border-b border-gray-200 pb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                  Histórico de Ofertas
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">
                    {historyOffers.length}
                  </span>
                </h2>
              </div>
              <HistoryTable offers={historyOffers} />
            </div>
          )}

          {currentTab === 'keywords' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-6 border-b border-gray-200 pb-4">
                <h2 className="text-xl font-bold text-gray-900">Palavras-Chave</h2>
              </div>
              <KeywordsManager 
                keywords={keywords}
                onAddKeyword={(kw) => setKeywords([...keywords, kw])}
                onRemoveKeyword={(kw) => setKeywords(keywords.filter(k => k !== kw))}
                onSearchAll={() => handleFetchOffers(true)}
                isFetching={isFetching}
                loadingText={loadingText}
              />
            </div>
          )}

          {currentTab === 'diagnostic' && (
            <div className="animate-in fade-in duration-300">
              <DiagnosticPage />
            </div>
          )}

          {currentTab === 'settings' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-6 border-b border-gray-200 pb-4">
                <h2 className="text-xl font-bold text-gray-900">Configurações (Em Breve)</h2>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Integração Supabase</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    O projeto está estruturado para receber as credenciais do Supabase. Edite <code>src/lib/storage.ts</code> para injetar a conexão real.
                  </p>
                  <div className="flex gap-4">
                    <input type="text" placeholder="SUPABASE_URL" className="flex-1 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-sm" disabled />
                    <input type="password" placeholder="SUPABASE_ANON_KEY" className="flex-1 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-sm" disabled />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Canais de Distribuição</h3>
                  <div className="space-y-3 mt-4">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" checked readOnly className="w-4 h-4 text-yellow-500 rounded border-gray-300" />
                      <span className="text-sm font-medium text-gray-700">WhatsApp (Gerador de Texto)</span>
                    </label>
                    <label className="flex items-center gap-3 opacity-50">
                      <input type="checkbox" disabled className="w-4 h-4 text-yellow-500 rounded border-gray-300" />
                      <span className="text-sm font-medium text-gray-700">Telegram Bot (API) <span className="text-xs bg-gray-100 px-1 rounded ml-1">Futuro</span></span>
                    </label>
                    <label className="flex items-center gap-3 opacity-50">
                      <input type="checkbox" disabled className="w-4 h-4 text-yellow-500 rounded border-gray-300" />
                      <span className="text-sm font-medium text-gray-700">Instagram Carousel (Auto) <span className="text-xs bg-gray-100 px-1 rounded ml-1">Futuro</span></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Ensure lucide icon 'Search' is available since it's used in empty state
import { Search } from 'lucide-react';
