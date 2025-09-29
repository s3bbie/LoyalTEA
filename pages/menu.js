import React, { useEffect, useState } from "react";
import { supabase } from "../utils/authClient";

const Menu = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchMenu = async () => {
      const { data, error } = await supabase.from("reward_prices").select("*");
      if (error) {
        console.error("Error fetching menu:", error.message);
      } else {
        setItems(data);
      }
    };

    fetchMenu();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Pink header like Rewards */}
      <div className="bg-brandPink text-white text-center py-8 rounded-b-3xl shadow-md">
        <h1 className="text-3xl font-extrabold tracking-wide">OUR MENU</h1>
        <p className="text-sm mt-2 opacity-90">Freshly Made Drinks</p>
        <p className="text-base mt-1 font-medium">Choose your favourite</p>
      </div>

      {/* Grid of menu items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto px-4 py-8 pb-24">
        {items.map((item) => {
  const normalPrice = parseFloat(item.price).toFixed(2);
  const discountedPrice = (parseFloat(item.price) - 0.1).toFixed(2);

  return (
    <div
      key={item.id}
      className="bg-white rounded-xl shadow-md flex items-center p-4"
    >
      {/* Circle image */}
      {item.image_url && (
        <img
          src={item.image_url}
          alt={item.reward_name}
          className="w-16 h-16 object-cover rounded-full mr-4"
        />
      )}

      {/* Text info */}
      <div className="flex flex-col">
        <h2 className="text-base font-semibold text-gray-800">
          {item.reward_name}
        </h2>
        {item.category && (
          <p className="text-xs text-gray-500">{item.category}</p>
        )}

        {/* Normal price */}
        <p className="text-sm font-bold text-pink-700 mt-1">£{normalPrice}</p>

        {/* ♻️ Discount badge */}
        <span className="mt-1 inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
          ♻️ Bring your own cup: £{discountedPrice}
        </span>

        {/* Screen reader text for accessibility */}
        <p className="sr-only">
          Save ten pence if you bring your own cup. Normal price {normalPrice} pounds. Discounted price {discountedPrice} pounds.
        </p>
      </div>
    </div>
  );
})}

      </div>
    </div>
  );
};

export default Menu;
