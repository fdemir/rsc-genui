import "server-only";

import { CoinGeckoClient } from "coingecko-api-v3";
export const client = new CoinGeckoClient({
  timeout: 10000,
  autoRetry: true,
});
