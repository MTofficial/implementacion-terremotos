import { useEffect, useState } from 'react';
import axios from 'axios';
import SismoMapa from './components/SismoMapa';

// 1. Interfaces
interface Sismo {
  id: number;
  externalId: string;
  title: string;
  magnitude: number;
  location: string;
  date: string;
  latitude: number;
  longitude: number;
}

interface Stats {
  totalSismos: number;
  promedioMagnitud: number;
  magnitudMaxima: number;
  sismoMasFuerte: string;
}

function App() {
  // 2. Estados
  const [sismos, setSismos] = useState<Sismo[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  //Estado para el filtro de magnitud
  const [filtroMag, setFiltroMag] = useState<number>(0);

  // 3. Función centralizada 
  const fetchData = async (magnitudMinima: number) => {
    try {
      setErrorMsg(null); // Limpiamos errores previos
      const [sismosRes, statsRes] = await Promise.all([
        axios.get<Sismo[]>(`https://sismos-backend.onrender.com/api/sismos?minMag=${magnitudMinima}`),
        axios.get<Stats>('https://sismos-backend.onrender.com/api/stats')
      ]);
      setSismos(sismosRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setErrorMsg("No se pudo conectar con el servidor para cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  // 4. useEffect: Se ejecuta al inicio y CADA VEZ que cambia el filtro
  useEffect(() => {
    fetchData(filtroMag);
  }, [filtroMag]);

  // Lógica de Sincronización
  const handleSync = async () => {
    setIsSyncing(true);
    setErrorMsg(null);
    try {
      await axios.get('https://sismos-backend.onrender.com/api/sync');
      await fetchData(filtroMag);
    } catch (err) {
      console.error("Error al sincronizar:", err);
      setErrorMsg("Ocurrió un error al intentar sincronizar con la API de Boostr.");
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <p className="text-xl font-semibold text-blue-600 animate-pulse">Cargando Sismología Chile...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-800">
      <div className="mx-auto max-w-6xl">

        {/* Cabecera */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Sismología Local</h1>
            <p className="mt-2 text-slate-500">Monitoreo y estadísticas de la actividad sísmica reciente</p>
            <a 
              href="/Sismos_En_Vivo.xlsx" 
              download 
              className="inline-flex items-center justify-center gap-2 mt-4 px-6 py-3 bg-green-600 text-white rounded-lg font-bold shadow-md hover:bg-green-700 hover:shadow-lg transition-all active:scale-95 w-fit"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Descargar Excel Dinámico
            </a>
          </div>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className={`px-6 py-3 rounded-lg font-bold text-white shadow-md transition-all 
              ${isSyncing ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-95'}`}
          >
            {isSyncing ? '↻ Sincronizando API...' : '↻ Sincronizar Ahora'}
          </button>
        </header>
        {errorMsg && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border-l-4 border-red-500 flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-red-600 font-bold mr-2">⚠️ Error:</span>
              <span className="text-red-700">{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
          </div>
        )}
        {/* Tarjetas de Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Registros</h3>
              <p className="text-3xl font-black text-blue-600 mt-2">{stats.totalSismos}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Promedio Mag</h3>
              <p className="text-3xl font-black text-amber-500 mt-2">{stats.promedioMagnitud}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Mag Máxima</h3>
              <p className="text-3xl font-black text-red-500 mt-2">{stats.magnitudMaxima}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Mayor Sismo</h3>
              <p className="text-lg font-bold text-slate-700 mt-2 truncate" title={stats.sismoMasFuerte}>
                {stats.sismoMasFuerte}
              </p>
            </div>
          </div>
        )}

        {/* Barra de Filtros */}
        <div className="mb-8 flex items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <label htmlFor="magFilter" className="font-semibold text-slate-700 mr-4">
            Filtrar por Magnitud Mínima:
          </label>
          <select
            id="magFilter"
            value={filtroMag}
            onChange={(e) => setFiltroMag(Number(e.target.value))}
            className="border border-slate-300 rounded-lg p-2 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value={0}>Todos los sismos</option>
            <option value={3}>Mayores a 3.0 Richter</option>
            <option value={4}>Mayores a 4.0 Richter</option>
            <option value={5}>Mayores a 5.0 Richter</option>
          </select>
        </div>

        {/* Mapa Interactivo */}
        <SismoMapa sismos={sismos} />

        {/* Tabla de Datos */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">
              Resultados ({sismos.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Ubicación</th>
                  <th className="px-6 py-4">Magnitud</th>
                  <th className="px-6 py-4">Fecha y Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sismos.map(s => (
                  <tr key={s.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700">{s.location}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${s.magnitude >= 4 ? 'bg-red-100 text-red-700' :
                        s.magnitude >= 3 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                        }`}>
                        {s.magnitude} Richter
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(s.date).toLocaleString('es-CL', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
                {sismos.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                      No se encontraron sismos con esta magnitud.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;