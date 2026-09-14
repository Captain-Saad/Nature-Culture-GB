import {
  FaMountain,
  FaCampground,
  FaWater,
  FaTree,
  FaCompass,
  FaMonument,
  FaHiking,
  FaMapMarkedAlt,
} from "react-icons/fa";

const ITEMS = [
  { Icon: FaMountain, label: "Karakoram" },
  { Icon: FaWater, label: "Attabad Lake" },
  { Icon: FaMonument, label: "Baltit Fort" },
  { Icon: FaCampground, label: "Deosai" },
  { Icon: FaTree, label: "Hunza Orchards" },
  { Icon: FaHiking, label: "Trekking GB" },
  { Icon: FaCompass, label: "Explore GB" },
  { Icon: FaMapMarkedAlt, label: "10 Regions" },
];

export default function LogoLoop() {
  const loopItems = [...ITEMS, ...ITEMS];

  return (
    <div className="overflow-hidden border-y border-cream-200 bg-cream-100 py-8">
      <div className="animate-logo-loop flex w-max items-center gap-14">
        {loopItems.map((item, i) => (
          <div
            key={`${item.label}-${i}`}
            className="flex items-center gap-2 whitespace-nowrap text-forest-500 opacity-80 transition-opacity hover:opacity-100"
          >
            <item.Icon className="h-6 w-6" aria-hidden />
            <span className="font-display text-sm font-semibold uppercase tracking-wide">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
