import { Car, Battery, Zap, Leaf } from "lucide-react";

export default function SummaryCards({ data }) {
  if (!data) return null;

  const cards = [
    {
      title: "Total Vehicles",
      value: data.total_vehicles?.toLocaleString() || 0,
      icon: Car,
      color: "bg-blue-500",
    },
    {
      title: "BEV Count",
      value:
        data.ev_type_counts
          ?.find((e) => e._id?.includes("BEV"))
          ?.count?.toLocaleString() || 0,
      icon: Battery,
      color: "bg-green-500",
    },
    {
      title: "PHEV Count",
      value:
        data.ev_type_counts
          ?.find((e) => e._id?.includes("PHEV"))
          ?.count?.toLocaleString() || 0,
      icon: Zap,
      color: "bg-yellow-500",
    },
    {
      title: "Avg Electric Range",
      value: `${Math.round(data.average_electric_range || 0)} mi`,
      icon: Leaf,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-xl shadow-md p-6 flex items-center gap-4"
        >
          <div className={`${card.color} p-3 rounded-lg`}>
            <card.icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">{card.title}</p>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
