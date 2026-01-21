import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = {
  "Clean Alternative Fuel Vehicle Eligible": "#10B981",
  "Not eligible due to low battery range": "#EF4444",
  "Eligibility unknown as battery range has not been researched": "#F59E0B",
};

export default function CAFVChart({ data }) {
  if (!data?.cafv_counts?.length) return null;

  const chartData = data.cafv_counts.map((item) => ({
    name: item._id?.split(" ").slice(0, 3).join(" ") || "Unknown",
    fullName: item._id,
    count: item.count,
    fill: COLORS[item._id] || "#6B7280",
  }));

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        CAFV Eligibility
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-20}
            textAnchor="end"
            tick={{ fontSize: 11 }}
            interval={0}
          />
          <YAxis tickFormatter={(v) => v.toLocaleString()} />
          <Tooltip
            formatter={(value) => value.toLocaleString()}
            labelFormatter={(label, payload) =>
              payload[0]?.payload?.fullName || label
            }
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <rect key={`bar-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
