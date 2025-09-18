// components/Co2Equivalents.js
import { useState } from "react";

const equivalences = [
  { label: "fully charging your phone", grams: 30, icon: "📱", type: "count", unit: "times" },
  { label: "driving 1 mile in an average car", grams: 404, icon: "🚗", type: "count", unit: "miles" },
  { label: "running a LED light bulb for 1 hour", grams: 15, icon: "💡", type: "time", unit: "hours" },
  { label: "streaming music for 1 hour", grams: 55, icon: "🎶", type: "time", unit: "hours" },
  { label: "taking a 1-minute hot shower", grams: 50, icon: "🚿", type: "time", unit: "minutes" },
  { label: "producing a plastic bottle", grams: 100, icon: "🥤", type: "count", unit: "bottles" },
  { label: "watching Netflix for 1 hour", grams: 55, icon: "📺", type: "time", unit: "hours" },
  { label: "boiling a kettle", grams: 70, icon: "☕", type: "count", unit: "times" },
  { label: "making a slice of toast", grams: 20, icon: "🍞", type: "count", unit: "slices" },
  { label: "sending 100 emails", grams: 26, icon: "📧", type: "count", unit: "emails", base: 100 },
  { label: "running your fridge for 1 day", grams: 250, icon: "🧊", type: "time", unit: "days" },
];

export default function Co2Equivalents({ co2Saved }) {
  const [showModal, setShowModal] = useState(false);

  const examples = equivalences
    .map((eq) => {
      let amount = Math.round(co2Saved / eq.grams);
      return { ...eq, amount };
    })
    .filter((eq) => eq.amount >= 1);

  const shuffled = [...examples].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);

  const formatExample = (eq) => {
    // Special case: emails with base 100 → multiply
    if (eq.base) {
      return `Sending ${eq.base * eq.amount} emails`;
    }

    if (eq.type === "time") {
      return eq.amount === 1
        ? eq.label
        : eq.label.replace(/1 (hour|minute|day)/, `${eq.amount} $1s`);
    }

    if (eq.type === "count") {
      return eq.amount === 1
        ? eq.label
        : eq.label.replace(/1 [a-zA-Z]+/, `${eq.amount} ${eq.unit}`);
    }

    return eq.label;
  };

  return (
    <>
      <div
        className="co2-saved-text text-pink-700 font-medium mt-2 cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        🌍 You’ve saved <strong>{co2Saved}g CO₂</strong> — tap to learn more.
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center relative">
            <button
              className="absolute top-3 right-3 text-gray-500 text-lg"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-700">
              Your Impact 🌱
            </h2>
            <p className="mb-4 text-gray-700">
              By bringing your reusable cup, you’ve saved{" "}
              <strong className="text-pink-700">{co2Saved}g CO₂</strong> — that’s equivalent to:
            </p>

            <ul className="space-y-3 mb-4">
              {selected.map((eq, idx) => (
                <li key={idx} className="flex items-center justify-center text-gray-500">
                  <span className="text-2xl mr-2">{eq.icon}</span>
                  <span>{formatExample(eq)}</span>
                </li>
              ))}
            </ul>

            <p className="text-sm text-gray-500">
              Every cup makes a difference. Keep it up! 🌍
            </p>
          </div>
        </div>
      )}
    </>
  );
}
