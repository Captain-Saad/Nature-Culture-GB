"use client";

import SingleMediaPicker from "@/components/admin/shared/SingleMediaPicker";
import type { ExploreTile } from "@/lib/exploreTiles";

interface ExploreSectionEditorProps {
  title: string;
  subtitle: string;
  tiles: ExploreTile[];
  onTitleChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
  onTilesChange: (tiles: ExploreTile[]) => void;
}

const INPUT =
  "mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500";

/**
 * The home page's "Explore Gilgit-Baltistan" grid: section heading plus one
 * row per region, in display order. Part of SiteSettingsForm, saved with it.
 */
export default function ExploreSectionEditor({
  title,
  subtitle,
  tiles,
  onTitleChange,
  onSubtitleChange,
  onTilesChange,
}: ExploreSectionEditorProps) {
  function update(index: number, patch: Partial<ExploreTile>) {
    onTilesChange(tiles.map((tile, i) => (i === index ? { ...tile, ...patch } : tile)));
  }

  function move(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= tiles.length) return;
    const next = [...tiles];
    [next[index], next[target]] = [next[target], next[index]];
    onTilesChange(next);
  }

  const shownCount = tiles.filter((t) => t.visible).length;

  return (
    <div className="rounded-card bg-white p-6 shadow-card">
      <h2 className="font-display text-lg font-bold text-forest-900">Explore Gilgit-Baltistan Section</h2>
      <p className="mt-1 text-xs text-forest-500">
        The region grid below the hero. Each tile opens the destinations page filtered to its region.
        Leave the heading fields empty to keep the built-in wording.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-forest-800">Section Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Explore Gilgit-Baltistan"
            className={INPUT}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-forest-800">Section Subtitle</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => onSubtitleChange(e.target.value)}
            placeholder="Ten regions, one extraordinary land."
            className={INPUT}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-forest-800">Region Tiles</h3>
        <p className="text-xs text-forest-500">
          {shownCount} of {tiles.length} shown · Tiles without a photo use the first photo of a
          destination in that region.
        </p>
      </div>

      <ol className="mt-3 divide-y divide-cream-200 rounded-lg border border-cream-200">
        {tiles.map((tile, index) => (
          <li
            key={tile.region}
            className={`flex flex-wrap items-center gap-4 p-4 ${tile.visible ? "" : "bg-cream-50 opacity-70"}`}
          >
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={`Move ${tile.region} up`}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-cream-300 text-forest-700 hover:bg-cream-100 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === tiles.length - 1}
                aria-label={`Move ${tile.region} down`}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-cream-300 text-forest-700 hover:bg-cream-100 disabled:opacity-30"
              >
                ↓
              </button>
            </div>

            <div className="min-w-[12rem] flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="font-display text-base font-bold text-forest-900">
                  <span className="mr-2 text-xs font-semibold text-forest-400">{index + 1}.</span>
                  {tile.region}
                </p>
                <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-forest-700">
                  <input
                    type="checkbox"
                    checked={tile.visible}
                    onChange={(e) => update(index, { visible: e.target.checked })}
                    className="h-4 w-4 accent-forest-600"
                  />
                  Show on home page
                </label>
              </div>
              <label className="mt-3 block text-xs font-semibold text-forest-700">Display Label</label>
              <input
                type="text"
                value={tile.label}
                maxLength={60}
                onChange={(e) => update(index, { label: e.target.value })}
                placeholder={tile.region}
                className={INPUT}
              />
            </div>

            <SingleMediaPicker
              label=""
              kind="image"
              value={tile.image}
              onChange={(url) => update(index, { image: url })}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
