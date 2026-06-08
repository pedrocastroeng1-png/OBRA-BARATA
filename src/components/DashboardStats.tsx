import React from 'react';
import { Stats } from '../types';
import { TrendingDown, CheckCircle, XCircle, Search } from 'lucide-react';

interface DashboardStatsProps {
  stats: Stats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const cards = [
    {
      title: 'Ofertas Encontradas (Hoje)',
      value: stats.foundToday,
      icon: Search,
      color: 'text-blue-500',
      bg: 'bg-blue-100',
    },
    {
      title: 'Ofertas Aprovadas',
      value: stats.approved,
      icon: CheckCircle,
      color: 'text-emerald-500',
      bg: 'bg-emerald-100',
    },
    {
      title: 'Ofertas Rejeitadas',
      value: stats.rejected,
      icon: XCircle,
      color: 'text-rose-500',
      bg: 'bg-rose-100',
    },
    {
      title: 'Média de Desconto',
      value: '22%', // Placeholder for now
      icon: TrendingDown,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
    },
  ];

  const formatDate = (isoString: string | null) => {
    if (!isoString) return 'Nunca';
    const date = new Date(isoString);
    return date.toLocaleString('pt-BR');
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Visão Geral</h2>
          <p className="text-gray-500 text-sm mt-1">
            Última atualização: {formatDate(stats.lastUpdate)}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`p-3 rounded-full ${card.bg} ${card.color}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
