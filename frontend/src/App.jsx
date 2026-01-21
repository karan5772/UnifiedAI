import { useState, useEffect } from "react";
import { Zap, RefreshCw } from "lucide-react";
import { getSummary } from "./api";
import SummaryCards from "./components/SummaryCards";
import EVTypeChart from "./components/EVTypeChart";
import TopMakesChart from "./components/TopMakesChart";
import CAFVChart from "./components/CAFVChart";
import CountySearch from "./components/CountySearch";
import MakeModels from "./components/MakeModels";
import AnalyzePanel from "./components/AnalyzePanel";

function App() {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSummary();
      setSummaryData(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to fetch summary data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">EV Data Dashboard</h1>
                <p className="text-blue-100 text-sm">
                  Electric Vehicle Population Analytics
                </p>
              </div>
            </div>
            <button
              onClick={fetchSummary}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading && !summaryData ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Loading dashboard...
            </div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <SummaryCards data={summaryData} />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <EVTypeChart data={summaryData} />
              <TopMakesChart data={summaryData} />
            </div>

            {/* CAFV Chart */}
            <div className="mb-6">
              <CAFVChart data={summaryData} />
            </div>

            {/* Search Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <CountySearch />
              <MakeModels />
            </div>

            {/* Analyze Panel */}
            <div className="mb-6">
              <AnalyzePanel />
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          EV Data API Dashboard • Built with React + FastAPI + MongoDB
        </div>
      </footer>
    </div>
  );
}

export default App;
