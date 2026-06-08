import React from 'react';
import { Offer } from '../types';
import { ExternalLink, Check, Copy, MessageCircle } from 'lucide-react';
import clsx from 'clsx';

interface HistoryTableProps {
  offers: Offer[];
}

export function HistoryTable({ offers }: HistoryTableProps) {
  const formatCurrency = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;
  
  const generatePostText = (offer: Offer) => {
    return `🔥 *OFERTA DA OBRA* 🔥\n\n🔨 *${offer.title}*\n\n💰 De: ${formatCurrency(offer.originalPrice)}\n✅ Por: ${formatCurrency(offer.price)}\n📉 Desconto: ${offer.discountPercentage}%\n\n🔗 Compre aqui: ${offer.link}\n\n#Construção #Ferramentas #Promoção #ObraBarataBrasil`;
  };

  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (offer: Offer) => {
    navigator.clipboard.writeText(generatePostText(offer));
    setCopiedId(offer.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (offers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        Nenhum item no histórico.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold">Produto</th>
              <th className="px-6 py-4 font-semibold text-center">Desconto</th>
              <th className="px-6 py-4 font-semibold text-center">Status</th>
              <th className="px-6 py-4 font-semibold text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {offers.map((offer) => (
              <tr key={offer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-md shrink-0 flex items-center justify-center overflow-hidden">
                      <img src={offer.imageUrl} alt="" className="w-full h-full object-cover mix-blend-multiply" loading="lazy" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1" title={offer.title}>
                        {offer.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(offer.dateProcessed || offer.dateAdded).toLocaleString('pt-BR')} • {offer.keyword}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex text-green-700 bg-green-100 px-2 py-1 rounded font-bold text-xs">
                    -{offer.discountPercentage}%
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={clsx(
                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                    offer.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  )}>
                    {offer.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    {offer.status === 'approved' && (
                      <button 
                        onClick={() => handleCopy(offer)}
                        className={clsx(
                          "p-1.5 rounded-md transition-colors",
                          copiedId === offer.id ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black"
                        )}
                        title="Copiar Texto WhatsApp"
                      >
                        {copiedId === offer.id ? <Check size={16} /> : <MessageCircle size={16} />}
                      </button>
                    )}
                    <a 
                      href={offer.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black rounded-md transition-colors"
                      title="Abrir no Mercado Livre"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
