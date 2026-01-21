import { useState } from "react";
import { Search, Car } from "lucide-react";
import { getModelsByMake } from "../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function MakeModels() {
  const [make, setMake] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!make.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getModelsByMake(make.trim());
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to fetch data");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const chartData =
    results?.models?.slice(0, 10).map((m) => ({
      name: m._id,
      count: m.count,
      avgRange: Math.round(m.avg_electric_range || 0),
    })) || [];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Car className="w-5 h-5" />
        Models by Make
      </h3>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Enter make (e.g., Tesla, BMW)"
          value={make}
          onChange={(e) => setMake(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !make.trim()}
          className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
          {results.most_popular && (
            <div className="bg-indigo-50 p-3 rounded-lg mb-4">
              <span className="text-indigo-700">
                Most Popular Model: <strong>{results.most_popular}</strong>
              </span>
            </div>
          )}

          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  tick={{ fontSize: 11 }}
                  interval={0}
                />
                <YAxis tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip
                  formatter={(value, name) => [
                    name === "count" ? value.toLocaleString() : `${value} mi`,
                    name === "count" ? "Count" : "Avg Range",
                  ]}
                />
                <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          <div className="mt-4 max-h-60 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Model</th>
                  <th className="px-4 py-2 text-right">Count</th>
                  <th className="px-4 py-2 text-right">Avg Range (mi)</th>
                </tr>
              </thead>
              <tbody>
                {results.models.map((m, i) => (
                  <tr key={m._id || i} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{m._id}</td>
                    <td className="px-4 py-2 text-right">
                      {m.count.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {Math.round(m.avg_electric_range || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
