// components/Co2Equivalents.js
import { useState } from "react";

// ✅ Expanded equivalences list with UK-relevant examples
const equivalences = [
  { label: "fully charging your phone", grams: 30, icon: "📱" },
  { label: "driving 1 mile in an average car", grams: 404, icon: "🚗" },
  { label: "running a LED light bulb for 1 hour", grams: 15, icon: "💡" },
  { label: "streaming music for 1 hour", grams: 55, icon: "🎶" },
  { label: "taking a 1-minute hot shower", grams: 50, icon: "🚿" },
  { label: "producing a plastic bottle", grams: 100, icon: "🥤" },
  { label: "watching Netflix for 1 hour", grams: 55, icon: "📺" },
  { label: "boiling a kettle", grams: 70, icon: "☕" },
  { label: "making a slice of toast", grams: 20, icon: "🍞" },
  { label: "sending 100 emails", grams: 26, icon: "📧" },
  { label: "running your fridge for 1 day", grams: 250, icon: "🧊" },
];

export default function Co2Equivalents({ co2Saved }) {
  const [showModal, setShowModal] = useState(false);

  // pick examples dynamically and shuffle
  const examples = equivalences
    .map((eq) => ({
      ...eq,
      amount: Math.round(co2Saved / eq.grams),
    }))
    .filter((eq) => eq.amount >= 1);

  // shuffle to keep it fresh
  const shuffled = [...examples].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);

  return (
    <>
      {/* Summary line under stars */}
      <div
        className="co2-saved-text text-pink-700 font-medium mt-2 cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        🌍 You’ve saved <strong>{co2Saved}g CO₂</strong>. Tap to learn more.
      </div>

      {/* Modal */}
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
              By bringing your reusable cup, you’ve saved <br />
              <strong className="text-pink-700">{co2Saved}g CO₂</strong>
              <br />— that’s equivalent to:
            </p>

            <ul className="space-y-3 mb-4">
              {selected.map((eq, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-center text-gray-500"
                >
                  <span className="text-2xl mr-2">{eq.icon}</span>
                  <span>
                    {eq.amount} × {eq.label}
                  </span>
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
