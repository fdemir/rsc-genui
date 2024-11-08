/* eslint-disable @next/next/no-img-element */
"use client";

import { motion } from "framer-motion";

export const SimplePrice = ({
  price,
  symbol,
  thumb,
}: {
  price?: number | string;
  symbol: string;
  thumb?: string;
}) => {
  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      {thumb && (
        <img
          src={thumb}
          alt={`${symbol} icon`}
          className="w-6 h-6 rounded-full"
        />
      )}
      <div className="flex flex-col">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {symbol}
        </span>
        <span className="font-medium text-emerald-500">
          $
          {price?.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>
    </motion.div>
  );
};
