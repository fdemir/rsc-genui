"use client";

import { CoinMarketChartResponse } from "coingecko-api-v3";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type ChartData = {
  data: CoinMarketChartResponse;
  name?: string;
  color?: string;
};

export function HistoricalChart({
  data,
  additionalData,
}: {
  data: ChartData;
  additionalData?: ChartData[];
}) {
  const processData = (chartData: CoinMarketChartResponse, name: string) => {
    return chartData.prices.map((price) => ({
      date: new Date(price[0]).toLocaleDateString(),
      [name]: price[1],
    }));
  };

  const primaryData = processData(data.data, data.name || "primary");
  let combinedData = primaryData;

  if (additionalData && additionalData.length > 0) {
    additionalData.forEach((chartData) => {
      const additionalChartData = processData(
        chartData.data,
        chartData.name || "additional"
      );

      combinedData = combinedData.map((primary) => {
        const additional = additionalChartData.find(
          (a) => a.date === primary.date
        );
        return {
          ...primary,
          ...(additional || {}),
        };
      });
    });
  }

  const defaultColors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={combinedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#71717a" />
        <XAxis dataKey="date" stroke="#71717a" />
        <YAxis stroke="#71717a" />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey={data.name || "primary"}
          stroke={data.color || defaultColors[0]}
          dot={false}
          name={data.name || "Primary Price"}
        />
        {additionalData?.map((chartData, index) => (
          <Line
            key={chartData.name || `additional-${index}`}
            type="monotone"
            dataKey={chartData.name || `additional-${index}`}
            stroke={
              chartData.color ||
              defaultColors[(index + 1) % defaultColors.length]
            }
            dot={false}
            name={chartData.name || `Additional Price ${index + 1}`}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
