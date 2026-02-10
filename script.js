async function convert() {
  const amount = document.getElementById("amount").value;
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;
  const result = document.getElementById("result");

  if (amount === "" || amount <= 0) {
    result.innerText = "Please enter a valid amount";
    return;
  }

  try {
    const response = await fetch(
      `https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`
    );
    const data = await response.json();

    result.innerText = `${amount} ${from} = ${data.rates[to]} ${to}`;
  } catch (error) {
    result.innerText = "Something went wrong!";
  }
}
