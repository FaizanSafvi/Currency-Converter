import { createServer, IncomingMessage, ServerResponse } from "node:http";

const HOST = "0.0.0.0";
const PORT = Number(process.env.PORT ?? 4000);
const allowedCurrencies = new Set(["USD", "INR", "EUR", "GBP"]);

interface ConvertResponse {
  amount: number;
  from: string;
  to: string;
  convertedAmount: number;
  rate: number;
  date: string;
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });

  response.end(JSON.stringify(payload));
}

function parseConvertParams(requestUrl: URL): { amount: number; from: string; to: string } | { error: string } {
  const amountText = requestUrl.searchParams.get("amount") ?? "";
  const from = (requestUrl.searchParams.get("from") ?? "").toUpperCase();
  const to = (requestUrl.searchParams.get("to") ?? "").toUpperCase();

  const amount = Number(amountText);

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Query param 'amount' must be a number greater than zero." };
  }

  if (!allowedCurrencies.has(from)) {
    return { error: "Query param 'from' must be one of: USD, INR, EUR, GBP." };
  }

  if (!allowedCurrencies.has(to)) {
    return { error: "Query param 'to' must be one of: USD, INR, EUR, GBP." };
  }

  return { amount, from, to };
}

async function handleConvert(request: IncomingMessage, response: ServerResponse, requestUrl: URL): Promise<void> {
  const parsed = parseConvertParams(requestUrl);

  if ("error" in parsed) {
    sendJson(response, 400, { error: parsed.error });
    return;
  }

  const { amount, from, to } = parsed;

  if (from === to) {
    const sameCurrencyResponse: ConvertResponse = {
      amount,
      from,
      to,
      convertedAmount: amount,
      rate: 1,
      date: new Date().toISOString().slice(0, 10)
    };

    sendJson(response, 200, sameCurrencyResponse);
    return;
  }

  const frankfurterUrl = new URL("https://api.frankfurter.app/latest");
  frankfurterUrl.searchParams.set("amount", amount.toString());
  frankfurterUrl.searchParams.set("from", from);
  frankfurterUrl.searchParams.set("to", to);

  try {
    const apiResponse = await fetch(frankfurterUrl);

    if (!apiResponse.ok) {
      sendJson(response, 502, { error: "Upstream exchange-rate API failed." });
      return;
    }

    const apiData = (await apiResponse.json()) as {
      amount: number;
      base: string;
      date: string;
      rates: Record<string, number>;
    };

    const convertedAmount = apiData.rates[to];

    if (typeof convertedAmount !== "number") {
      sendJson(response, 502, { error: "Upstream API did not return a valid conversion result." });
      return;
    }

    const payload: ConvertResponse = {
      amount,
      from,
      to,
      convertedAmount,
      rate: convertedAmount / amount,
      date: apiData.date
    };

    sendJson(response, 200, payload);
  } catch {
    sendJson(response, 502, { error: "Failed to reach exchange-rate API." });
  }
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    response.end();
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/health") {
    sendJson(response, 200, { status: "ok" });
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/convert") {
    await handleConvert(request, response, requestUrl);
    return;
  }

  sendJson(response, 404, { error: "Route not found." });
});

server.listen(PORT, HOST, () => {
  console.log(`TypeScript API server running at http://${HOST}:${PORT}`);
});