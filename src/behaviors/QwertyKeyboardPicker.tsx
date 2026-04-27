import { useMemo } from "react";
import {
  hid_usage_from_page_and_id,
  hid_usage_get_label,
  hid_usage_page_and_id_from_usage,
} from "../hid-usages";

interface QwertySpacer {
  spacer: true;
  w: number;
}

interface QwertyKeyDef {
  id: number;
  w?: number;
  label?: string;
}

type QwertyEntry = QwertySpacer | QwertyKeyDef;

const HID_PAGE = 7;
const L_SHIFT = 0x02;

// Shifted characters shown as secondary labels on symbol/number keys
const SHIFTED_LABELS: Record<number, string> = {
  53: "~",
  30: "!", 31: "@", 32: "#", 33: "$", 34: "%",
  35: "^", 36: "&", 37: "*", 38: "(", 39: ")",
  45: "_", 46: "+",
  47: "{", 48: "}", 49: "|",
  51: ":", 52: '"',
  54: "<", 55: ">", 56: "?",
};

// ── Main keyboard ────────────────────────────────────────────────────────────

const MAIN_ROWS: QwertyEntry[][] = [
  // Function row: Esc | F1-F4 | F5-F8 | F9-F12
  [
    { id: 41 },
    { spacer: true, w: 0.5 },
    { id: 58 }, { id: 59 }, { id: 60 }, { id: 61 },
    { spacer: true, w: 0.25 },
    { id: 62 }, { id: 63 }, { id: 64 }, { id: 65 },
    { spacer: true, w: 0.25 },
    { id: 66 }, { id: 67 }, { id: 68 }, { id: 69 },
  ],
  // Number row
  [
    { id: 53 },
    { id: 30 }, { id: 31 }, { id: 32 }, { id: 33 }, { id: 34 },
    { id: 35 }, { id: 36 }, { id: 37 }, { id: 38 }, { id: 39 },
    { id: 45 }, { id: 46 },
    { id: 42, w: 2 },
  ],
  // QWERTY row
  [
    { id: 43, w: 1.5 },
    { id: 20 }, { id: 26 }, { id: 8  }, { id: 21 },
    { id: 23 }, { id: 28 }, { id: 24 }, { id: 12 },
    { id: 18 }, { id: 19 },
    { id: 47 }, { id: 48 },
    { id: 49, w: 1.5 },
  ],
  // Home row
  [
    { id: 57, w: 1.75 },
    { id: 4  }, { id: 22 }, { id: 7  }, { id: 9  },
    { id: 10 }, { id: 11 }, { id: 13 }, { id: 14 }, { id: 15 },
    { id: 51 }, { id: 52 },
    { id: 40, w: 2.25 },
  ],
  // Bottom alpha row
  [
    { id: 225, w: 2.25 },
    { id: 29 }, { id: 27 }, { id: 6  }, { id: 25 },
    { id: 5  }, { id: 17 }, { id: 16 },
    { id: 54 }, { id: 55 }, { id: 56 },
    { id: 229, w: 2.75 },
  ],
  // Modifier / space row
  [
    { id: 224, w: 1.25 }, { id: 227, w: 1.25 }, { id: 226, w: 1.25 },
    { id: 44, w: 6.25 },
    { id: 230, w: 1.25 }, { id: 231, w: 1.25 }, { id: 101, w: 1.25 }, { id: 228, w: 1.25 },
  ],
];

// ── Navigation cluster ───────────────────────────────────────────────────────

// Top row (aligns with fn row)
const NAV_TOP: QwertyEntry[] = [
  { id: 70 }, { id: 71 }, { id: 72 }, // PrtSc, ScLk, Pause
];

// Five rows that align with main rows 1-5
const NAV_ROWS: QwertyEntry[][] = [
  [{ id: 73 }, { id: 74 }, { id: 75 }],                                 // Ins, Home, PgUp
  [{ id: 76 }, { id: 77 }, { id: 78 }],                                 // Del, End, PgDn
  [],                                                                     // empty (home row level)
  [{ spacer: true, w: 1 }, { id: 82 }, { spacer: true, w: 1 }],        // Up (centred)
  [{ id: 80 }, { id: 81 }, { id: 79 }],                                 // Left, Down, Right
];

// ── Numpad ───────────────────────────────────────────────────────────────────

// Five rows that align with main rows 1-5 (fn row level = empty h-8 spacer)
const NUM_ROWS: QwertyEntry[][] = [
  [{ id: 83 }, { id: 84 }, { id: 85 }, { id: 86 }],                    // NumLk, /, *, -
  [{ id: 95 }, { id: 96 }, { id: 97 }, { id: 87 }],                    // 7, 8, 9, +
  [{ id: 92 }, { id: 93 }, { id: 94 }, { spacer: true, w: 1 }],        // 4, 5, 6
  [{ id: 89 }, { id: 90 }, { id: 91 }, { id: 88 }],                    // 1, 2, 3, Enter
  [{ id: 98, w: 2 }, { id: 99 }, { spacer: true, w: 1 }],              // 0 (2U), .
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function keycap_label(id: number): string {
  return (hid_usage_get_label(HID_PAGE, id) ?? id.toString()).replace(
    /^Keyboard /,
    ""
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export interface QwertyKeyboardPickerProps {
  value?: number;
  onKeySelected: (usage: number) => void;
}

export const QwertyKeyboardPicker = ({
  value,
  onKeySelected,
}: QwertyKeyboardPickerProps) => {
  const selectedId = useMemo<number | null>(() => {
    if (!value) return null;
    const [page, id] = hid_usage_page_and_id_from_usage(value & 0x00ffffff);
    return page === HID_PAGE ? id : null;
  }, [value]);

  const selectedShifted = useMemo(
    () => (value ? !!((value >> 24) & L_SHIFT) : false),
    [value]
  );

  const renderEntry = (entry: QwertyEntry, i: number) => {
    if ("spacer" in entry) {
      return <div key={`s${i}`} style={{ width: `${entry.w * 32}px` }} />;
    }

    const { id, w = 1 } = entry;
    const isSelected = selectedId === id;
    const isShiftedSelected = isSelected && selectedShifted;
    const shifted = SHIFTED_LABELS[id];
    const primaryLabel = entry.label ?? keycap_label(id);

    return (
      <button
        key={id}
        style={{ width: `${w * 32 - 2}px` }}
        className={`h-8 rounded text-xs flex items-center justify-center relative
          cursor-pointer transition-colors shrink-0
          ${isSelected
            ? "bg-primary text-primary-content"
            : "bg-base-100 text-base-content hover:bg-base-200"
          }`}
        onClick={() => onKeySelected(hid_usage_from_page_and_id(HID_PAGE, id))}
        aria-pressed={isSelected && !selectedShifted}
      >
        {shifted && (
          <span
            className={`absolute top-0.5 left-1 text-[8px] leading-none font-medium select-none ${
              isShiftedSelected
                ? "text-primary-content"
                : isSelected
                ? "text-primary-content/70"
                : "text-base-content/50"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onKeySelected(
                hid_usage_from_page_and_id(HID_PAGE, id) | (L_SHIFT << 24)
              );
            }}
          >
            {shifted}
          </span>
        )}
        {primaryLabel}
      </button>
    );
  };

  const renderRow = (row: QwertyEntry[], rowIdx: number) => (
    <div key={rowIdx} className="flex gap-px h-8">
      {row.map(renderEntry)}
    </div>
  );

  return (
    <div className="bg-base-300 rounded-lg p-2 overflow-x-auto select-none">
      <div className="flex gap-3 items-start">

        {/* ── Main keyboard ── */}
        <div className="flex flex-col gap-px">
          {renderRow(MAIN_ROWS[0], 0)}
          <div className="h-2" />
          {MAIN_ROWS.slice(1).map((row, i) => renderRow(row, i + 1))}
        </div>

        {/* ── Navigation cluster ── */}
        <div className="flex flex-col gap-px">
          {renderRow(NAV_TOP, 0)}
          <div className="h-2" />
          {NAV_ROWS.map(renderRow)}
        </div>

        {/* ── Numpad ── */}
        <div className="flex flex-col gap-px">
          <div className="h-8" />
          <div className="h-2" />
          {NUM_ROWS.map(renderRow)}
        </div>

      </div>
    </div>
  );
};
