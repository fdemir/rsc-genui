"use client";

import { motion } from "framer-motion";

type OverviewProps = {
  name?: string;
  symbol?: string;
  current_price?: number;
  price_change_percentage_24h?: number;
  high_24h?: number;
  low_24h?: number;
  market_cap?: number;
  total_volume?: number;
  image?: string;
};

export const Overview = ({
  name,
  symbol,
  current_price,
  price_change_percentage_24h,
  high_24h,
  low_24h,
  market_cap,
  total_volume,
  image,
}: OverviewProps) => {
  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800"
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="col-span-2 md:col-span-3 flex items-center gap-3">
        {image && (
          <img src={image} alt={name} className="w-10 h-10 rounded-full" />
        )}
        <div>
          <h2 className="text-xl font-semibold">{name}</h2>
          <p className="text-zinc-500 uppercase">{symbol}</p>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-zinc-500">Current Price</p>
        <p className="text-2xl font-bold text-emerald-500">
          ${current_price?.toLocaleString() ?? "-"}
        </p>
        {price_change_percentage_24h != null && (
          <p
            className={`text-sm ${
              price_change_percentage_24h >= 0
                ? "text-emerald-500"
                : "text-red-500"
            }`}
          >
            {price_change_percentage_24h >= 0 ? "↑" : "↓"}{" "}
            {Math.abs(price_change_percentage_24h).toFixed(2)}%
          </p>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm text-zinc-500">24h Range</p>
        <div className="space-y-1">
          <p className="text-emerald-500">
            H: ${high_24h?.toLocaleString() ?? "-"}
          </p>
          <p className="text-red-500">L: ${low_24h?.toLocaleString() ?? "-"}</p>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-zinc-500">Market Stats</p>
        <div className="space-y-1">
          <p>Cap: ${market_cap ? `${(market_cap / 1e9).toFixed(2)}B` : "-"}</p>
          <p>
            Vol: ${total_volume ? `${(total_volume / 1e9).toFixed(2)}B` : "-"}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
