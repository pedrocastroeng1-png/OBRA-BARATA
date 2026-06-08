import React from 'react';
import { Offer } from '../types';
import { Check, X, Copy, ExternalLink, MessageCircle } from 'lucide-react';
import clsx from 'clsx';

interface OfferCardProps {
  offer: Offer;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function OfferCard({ offer, onApprove, onReject }: OfferCardProps) {
  const formatCurrency = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  const generatePostText = () => {
    return `🔥 *OFERTA DA OBRA* 🔥\n\n🔨 *${offer.title}*\n\n💰 De: ${formatCurrency(offer.originalPrice)}\n✅ Por: ${formatCurrency(offer.price)}\n📉 Desconto: ${offer.discountPercentage}%\n\n🔗 Compre aqui: ${offer.link}\n\n#Construção #Ferramentas #Promoção #ObraBarataBrasil`;
  };

  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatePostText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border text-left border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col relative h-full">
      {/* Image Section */}
      <div className="w-full h-48 bg-gray-100 relative shrink-0">
        {offer.imageUrl ? (
          <img 
            src={offer.imageUrl} 
            alt={offer.title} 
            className="w-full h-full object-contain p-2 mix-blend-multiply"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Sem Imagem
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <div className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded shadow-sm">
            -{offer.discountPercentage}%
          </div>
          {offer.ranking === 'Excelente' && (
            <div className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
              🔥 Excelente
            </div>
          )}
          {offer.ranking === 'Boa' && (
            <div className="bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
              👍 Boa
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <span className="bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full whitespace-nowrap mb-2 inline-block">
            {offer.keyword}
          </span>
          <h3 className="font-bold text-gray-900 text-sm line-clamp-2 min-h-[40px]" title={offer.title}>
            {offer.title}
          </h3>
        </div>

        <div className="mt-auto pt-2">
          <div className="flex items-end gap-2 mb-4">
            <span className="text-2xl font-bold text-green-600 leading-none">{formatCurrency(offer.price)}</span>
            <span className="text-xs font-medium text-gray-400 line-through mb-1">{formatCurrency(offer.originalPrice)}</span>
          </div>

          {/* Actions - Vertical Stack */}
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => {
                handleCopy();
                onApprove(offer.id); // implicitly approve when generated
              }}
              className={clsx(
                "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all",
                copied 
                  ? "bg-green-500 text-white shadow-md shadow-green-500/20" 
                  : "bg-yellow-400 hover:bg-yellow-500 text-black shadow-md shadow-yellow-400/20"
              )}
            >
              {copied ? <Check size={18} /> : <MessageCircle size={18} />}
              {copied ? "Post Copiado!" : "Gerar Post"}
            </button>
            
            <div className="flex gap-2">
              <a 
                href={offer.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
              >
                Ver no ML <ExternalLink size={14} />
              </a>
              <button 
                onClick={() => onReject(offer.id)}
                className="flex items-center justify-center bg-white border border-gray-300 hover:bg-rose-50 hover:text-rose-600 text-gray-500 px-3 py-2 rounded-lg transition-colors"
                title="Rejeitar"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
