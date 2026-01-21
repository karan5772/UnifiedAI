import { useState } from "react";
import { BarChart2, Play } from "lucide-react";
import { analyzeVehicles } from "../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AnalyzePanel() {
  const [groupBy, setGroupBy] = useState("make");
  const [filters, setFilters] = useState({
    makes: "",
    yearStart: "",
    yearEnd: "",
    minRange: "",
    vehicleType: "",
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const filterPayload = {};

      if (filters.makes.trim()) {
        filterPayload.makes = filters.makes
          .split(",")
          .map((m) => m.trim().toUpperCase());
      }
      if (filters.yearStart || filters.yearEnd) {
        filterPayload.model_years = {
          start: parseInt(filters.yearStart) || 2010,
          end: parseInt(filters.yearEnd) || 2025,
        };
      }
      if (filters.minRange) {
        filterPayload.min_electric_range = parseInt(filters.minRange);
      }
      if (filters.vehicleType) {
        filterPayload.vehicle_type = filters.vehicleType;
      }

      const data = await analyzeVehicles(
        Object.keys(filterPayload).length > 0 ? filterPayload : null,
        groupBy,
      );
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to analyze data");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const chartData =
    results?.slice(0, 15).map((r) => ({
      name: r._id || "Unknown",
      count: r.count,
      avgRange: Math.round(r.avg_electric_range || 0),
    })) || [];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <BarChart2 className="w-5 h-5" />
        Analyze Vehicles
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Group By</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="make">Make</option>
            <option value="model_year">Model Year</option>
            <option value="county">County</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Makes (comma-separated)
          </label>
          <input
            type="text"
            placeholder="e.g., Tesla, BMW"
            value={filters.makes}
            onChange={(e) => setFilters({ ...filters, makes: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Vehicle Type
          </label>
          <select
            value={filters.vehicleType}
            onChange={(e) =>
              setFilters({ ...filters, vehicleType: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="Battery Electric Vehicle (BEV)">BEV</option>
            <option value="Plug-in Hybrid Electric Vehicle (PHEV)">PHEV</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Year Start</label>
          <input
            type="number"
            placeholder="2010"
            value={filters.yearStart}
            onChange={(e) =>
              setFilters({ ...filters, yearStart: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Year End</label>
          <input
            type="number"
            placeholder="2025"
            value={filters.yearEnd}
            onChange={(e) =>
              setFilters({ ...filters, yearEnd: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Min Range (mi)
          </label>
          <input
            type="number"
            placeholder="50"
            value={filters.minRange}
            onChange={(e) =>
              setFilters({ ...filters, minRange: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full md:w-auto px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Play className="w-4 h-4" />
        Run Analysis
      </button>

      {error && (
        <div className="text-red-500 bg-red-50 p-3 rounded-lg mt-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-8 text-gray-500">Analyzing...</div>
      )}

      {results && !loading && (
        <div className="mt-6">
          <div className="text-sm text-gray-600 mb-3">
            Found {results.length} groups
          </div>

          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  tick={{ fontSize: 10 }}
                  interval={0}
                />
                <YAxis tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip
                  formatter={(value, name) => [
                    name === "count" ? value.toLocaleString() : `${value} mi`,
                    name === "count" ? "Count" : "Avg Range",
                  ]}
                />
                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          <div className="mt-4 max-h-60 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">
                    {groupBy === "county"
                      ? "County"
                      : groupBy === "model_year"
                        ? "Year"
                        : "Make"}
                  </th>
                  <th className="px-4 py-2 text-right">Count</th>
                  <th className="px-4 py-2 text-right">Avg Range</th>
                  <th className="px-4 py-2 text-left">Top Model</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r._id || i} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">
                      {r._id || "Unknown"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {r.count.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {Math.round(r.avg_electric_range || 0)} mi
                    </td>
                    <td className="px-4 py-2">
                      {r.most_common_vehicle || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
