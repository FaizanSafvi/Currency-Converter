import React, { useState } from "react";

const currencies = ["USD", "INR", "EUR", "GBP"];

function App() {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");
  const [resultText, setResultText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleConvert() {
    const numericAmount = Number(amount);

    if (!amount || numericAmount <= 0) {
      setResultText("Please enter a valid amount");
      return;
    }

    if (fromCurrency === toCurrency) {
      setResultText(`${numericAmount} ${fromCurrency} = ${numericAmount} ${toCurrency}`);
      return;
    }

    setIsLoading(true);
    setResultText("Converting...");

    try {
      const url = `https://api.frankfurter.app/latest?amount=${numericAmount}&from=${fromCurrency}&to=${toCurrency}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      const convertedValue = data.rates[toCurrency];

      setResultText(`${numericAmount} ${fromCurrency} = ${convertedValue} ${toCurrency}`);
    } catch {
      setResultText("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="container">
        <h2>Currency Converter</h2>

        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />

        <div className="select-box">
          <select value={fromCurrency} onChange={(event) => setFromCurrency(event.target.value)}>
            {currencies.map((currency) => (
              <option key={`from-${currency}`} value={currency}>
                {currency}
              </option>
            ))}
          </select>

          <select value={toCurrency} onChange={(event) => setToCurrency(event.target.value)}>
            {currencies.map((currency) => (
              <option key={`to-${currency}`} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>

        <button onClick={handleConvert} disabled={isLoading}>
          {isLoading ? "Converting..." : "Convert"}
        </button>

        <p id="result">{resultText}</p>
      </div>
    </div>
  );
}

export default App;
