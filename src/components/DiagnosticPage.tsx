import React, { useEffect, useState } from 'react';
import { Activity, Server, Code, CheckCircle, XCircle } from 'lucide-react';

export function DiagnosticPage() {
  const [healthStatus, setHealthStatus] = useState<{status: string, data?: string}>({ status: 'testing' });
  const [mlApiStatus, setMlApiStatus] = useState<{status: string, data?: string}>({ status: 'testing' });

  useEffect(() => {
    // Check /api/health
    fetch('/api/health')
      .then(async (res) => {
        const text = await res.text();
        if (res.ok) {
          setHealthStatus({ status: 'success', data: `HTTP 200 - ${text}` });
        } else {
          setHealthStatus({ status: 'error', data: `HTTP ${res.status}: ${text}` });
        }
      })
      .catch((err) => setHealthStatus({ status: 'error', data: `Network Error: ${err.message}` }));

    // Check /api/mercadolivre/search
    fetch('/api/mercadolivre/search?q=bosch')
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          const items = data.results?.length || 0;
          setMlApiStatus({ status: 'success', data: `HTTP ${res.status} - ${items} itens retornados` });
        } else {
          const text = await res.text();
          setMlApiStatus({ status: 'error', data: `HTTP ${res.status}: ${text}` });
        }
      })
      .catch((err) => setMlApiStatus({ status: 'error', data: `Network Error: ${err.message}` }));
  }, []);

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'testing') return <span className="text-gray-500 font-medium text-sm animate-pulse">Testando...</span>;
    if (status === 'success') return <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm"><CheckCircle size={16} /> OK</div>;
    return <div className="flex items-center gap-1.5 text-rose-600 font-bold text-sm"><XCircle size={16} /> Erro</div>;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-4xl">
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-gray-900">Diagnóstico de Implantação</h2>
        <p className="text-sm text-gray-500 mt-1">Verificação em tempo real do ambiente e das Serverless Functions.</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-3 text-gray-900 font-bold">
              <Server size={18} /> Ambiente Atual
            </div>
            <ul className="text-sm font-mono text-gray-600 space-y-2 bg-white p-3 rounded border border-gray-200">
              <li><span className="font-semibold text-gray-800">Host:</span> {window.location.hostname}</li>
              <li><span className="font-semibold text-gray-800">Protocolo:</span> {window.location.protocol}</li>
              <li className="break-all"><span className="font-semibold text-gray-800">User Agent:</span> {navigator.userAgent}</li>
            </ul>
          </div>

          <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-3 text-gray-900 font-bold">
              <Code size={18} /> Framework e Estrutura
            </div>
            <ul className="text-sm font-mono text-gray-600 space-y-2 bg-white p-3 rounded border border-gray-200">
              <li><span className="font-semibold text-gray-800">Frontend:</span> React + Vite</li>
              <li><span className="font-semibold text-gray-800">Dev Server:</span> Express (server.ts)</li>
              <li><span className="font-semibold text-gray-800">Vercel:</span> Serverless API Functions</li>
            </ul>
          </div>
        </div>

        <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
           <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold">
              <Activity size={18} /> Rotas Registradas (API Status)
            </div>
            
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <code className="text-sm font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">GET /api/health</code>
                  <p className="text-xs text-gray-500 mt-2 font-mono">{healthStatus.data || 'Aguardando resposta...'}</p>
                </div>
                <div className="shrink-0 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  <StatusIcon status={healthStatus.status} />
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <code className="text-sm font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">GET /api/mercadolivre/search</code>
                  <p className="text-xs text-gray-500 mt-2 font-mono">{mlApiStatus.data || 'Aguardando resposta...'}</p>
                </div>
                <div className="shrink-0 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  <StatusIcon status={mlApiStatus.status} />
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
