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

// Assigned to labels in order, cycling when there are more labels than icons.
const ICONS = [FaMountain, FaWater, FaMonument, FaCampground, FaTree, FaHiking, FaCompass, FaMapMarkedAlt];

/** The scrolling highlights strip; labels are edited in Site Settings. */
export default function LogoLoop({ labels }: { labels: string[] }) {
  if (labels.length === 0) return null;
  const items = labels.map((label, i) => ({ label, Icon: ICONS[i % ICONS.length] }));
  const loopItems = [...items, ...items];

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
