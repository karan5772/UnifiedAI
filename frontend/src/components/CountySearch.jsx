import { useState } from "react";
import { Search, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { getVehiclesByCounty } from "../api";

export default function CountySearch() {
  const [county, setCounty] = useState("");
  const [modelYear, setModelYear] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 20;

  const handleSearch = async (newPage = 1) => {
    if (!county.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getVehiclesByCounty(
        county.trim(),
        newPage,
        perPage,
        modelYear ? parseInt(modelYear) : null,
      );
      setResults(data);
      setPage(newPage);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to fetch data");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = results ? Math.ceil(results.total / perPage) : 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5" />
        Search by County
      </h3>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Enter county name (e.g., King)"
          value={county}
          onChange={(e) => setCounty(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 min-w-50 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Model Year"
          value={modelYear}
          onChange={(e) => setModelYear(e.target.value)}
          className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => handleSearch()}
          disabled={loading || !county.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>

      {error && (
        <div className="text-red-500 bg-red-50 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      )}

      {results && !loading && (
        <>
          <div className="text-sm text-gray-600 mb-3">
            Found {results.total.toLocaleString()} vehicles
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Make</th>
                  <th className="px-4 py-2 text-left">Model</th>
                  <th className="px-4 py-2 text-left">Year</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">City</th>
                  <th className="px-4 py-2 text-right">Range (mi)</th>
                </tr>
              </thead>
              <tbody>
                {results.vehicles.map((v, i) => (
                  <tr key={v._id || i} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{v.vehicle?.make}</td>
                    <td className="px-4 py-2">{v.vehicle?.model}</td>
                    <td className="px-4 py-2">{v.vehicle?.model_year}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          v.vehicle?.ev_type?.includes("BEV")
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {v.vehicle?.ev_type?.includes("BEV") ? "BEV" : "PHEV"}
                      </span>
                    </td>
                    <td className="px-4 py-2">{v.location?.city}</td>
                    <td className="px-4 py-2 text-right">
                      {v.vehicle?.electric_range || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                onClick={() => handleSearch(page - 1)}
                disabled={page <= 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handleSearch(page + 1)}
                disabled={page >= totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
