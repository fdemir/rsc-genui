import { Message, TextStreamMessage } from "@/components/message";
import { openai } from "@ai-sdk/openai";
import { CoreMessage, generateId } from "ai";
import {
  createAI,
  createStreamableValue,
  getMutableAIState,
  streamUI,
} from "ai/rsc";
import { ReactNode } from "react";
import { z } from "zod";
import { client } from "./client";
import { HistoricalChart } from "@/components/historical-chart";
import { SimplePrice } from "@/components/simple-price";
import { Overview } from "@/components/overview";

export interface Hub {
  climate: Record<"low" | "high", number>;
  lights: Array<{ name: string; status: boolean }>;
  locks: Array<{ name: string; isLocked: boolean }>;
}

const sendMessage = async (message: string) => {
  "use server";

  const messages = getMutableAIState<typeof AI>("messages");

  messages.update([
    ...(messages.get() as CoreMessage[]),
    { role: "user", content: message },
  ]);

  const contentStream = createStreamableValue("");
  const textComponent = <TextStreamMessage content={contentStream.value} />;

  const { value: stream } = await streamUI({
    model: openai("gpt-4o-mini"),
    system: `\
      - you are a friendly trading researcher assistant
      - reply in lower case
    `,
    messages: messages.get() as CoreMessage[],
    text: async function* ({ content, done }) {
      if (done) {
        messages.done([
          ...(messages.get() as CoreMessage[]),
          { role: "assistant", content },
        ]);

        contentStream.done();
      } else {
        contentStream.update(content);
      }

      return textComponent;
    },
    tools: {
      historicalChart: {
        description: "view historical chart for a given coin",
        parameters: z.object({
          coinId: z.string(),
          days: z.number().optional().describe("number of days to display"),
        }),
        generate: async function* ({ coinId, days = 7 }) {
          const toolCallId = generateId();

          messages.done([
            ...(messages.get() as CoreMessage[]),
            {
              role: "assistant",
              content: [
                {
                  type: "tool-call",
                  toolCallId,
                  toolName: "historicalChart",
                  args: { coinId, days },
                },
              ],
            },
            {
              role: "tool",
              content: [
                {
                  type: "tool-result",
                  toolName: "historicalChart",
                  toolCallId,
                  result: `The historical chart for ${coinId} is currently displayed on the screen`,
                },
              ],
            },
          ]);
          const chart = await client.coinIdMarketChart({
            id: coinId,
            vs_currency: "usd",
            days,
          });

          return (
            <Message
              role="assistant"
              content={<HistoricalChart data={{ data: chart, name: coinId }} />}
            />
          );
        },
      },
      comparePrices: {
        description: "compare prices of two coins",
        parameters: z.object({
          coinId1: z.string(),
          coinId2: z.string(),
        }),
        generate: async function* ({ coinId1, coinId2 }) {
          const chart1 = await client.coinIdMarketChart({
            id: coinId1,
            vs_currency: "usd",
            days: 7,
          });

          const chart2 = await client.coinIdMarketChart({
            id: coinId2,
            vs_currency: "usd",
            days: 7,
          });

          return (
            <Message
              role="assistant"
              content={
                <HistoricalChart
                  data={{ data: chart1, name: coinId1 }}
                  additionalData={[{ data: chart2, name: coinId2 }]}
                />
              }
            />
          );
        },
      },
      getPrice: {
        description: "get the price of a coin",
        parameters: z.object({
          coinId: z.string(),
        }),
        generate: async function* ({ coinId }) {
          const list = await client.coinMarket({
            ids: coinId,
            vs_currency: "usd",
          });

          const data = list[0];

          if (!data) {
            return (
              <Message role="assistant" content={<div>Coin not found</div>} />
            );
          }

          return (
            <Message
              role="assistant"
              content={
                <SimplePrice
                  price={data.current_price}
                  symbol={coinId}
                  thumb={data.image}
                />
              }
            />
          );
        },
      },
      overview: {
        description: "get an overview of a coin",
        parameters: z.object({
          coinId: z.string(),
        }),
        generate: async function* ({ coinId }) {
          const list = await client.coinMarket({
            ids: coinId,
            vs_currency: "usd",
          });

          const data = list[0];

          if (!data) {
            return (
              <Message role="assistant" content={<div>Coin not found</div>} />
            );
          }

          return <Message role="assistant" content={<Overview {...data} />} />;
        },
      },
    },
  });

  return stream;
};

export type UIState = Array<ReactNode>;

export type AIState = {
  chatId: string;
  messages: Array<CoreMessage>;
};

export const AI = createAI<AIState, UIState>({
  initialAIState: {
    chatId: generateId(),
    messages: [],
  },
  initialUIState: [],
  actions: {
    sendMessage,
  },
  onSetAIState: async ({ state, done }) => {
    "use server";

    if (done) {
      // save to database
    }
  },
});
