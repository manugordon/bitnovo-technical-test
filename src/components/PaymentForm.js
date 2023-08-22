import React, { useState, useEffect } from "react";
import api from "../services/api";

function PaymentForm() {
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState("");
  const [cryptoCurrencies, setCryptoCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [filteredCryptoCurrencies, setFilteredCryptoCurrencies] = useState([]); //

  useEffect(() => {
    fetchCryptoCurrencies();
  }, []);

  useEffect(() => {
    const filteredCurrencies = cryptoCurrencies.filter(
      (currency) => parseFloat(amount) >= parseFloat(currency.min_amount)
    );
    setFilteredCryptoCurrencies(filteredCurrencies);
  }, [amount, cryptoCurrencies]);

  const fetchCryptoCurrencies = async () => {
    try {
      const response = await api.get("/currencies");
      setCryptoCurrencies(response.data);
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  };

  const handleCreatePayment = async () => {
    try {
      const formData = new FormData();
      formData.append("expected_output_amount", amount); // Cambiar el valor según el monto deseado
      formData.append("input_currency", selectedCurrency); // Cambiar a la criptomoneda deseada
      const myHeaders = new Headers();
      myHeaders.append("X-Device-Id", "551a269b-ca34-42ef-bc3c-2f0d869e103b");
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formData,
        redirect: "follow",
      };

      const response = await fetch(
        "https://payments.pre-bnvo.com/api/v1/orders/",
        requestOptions
      );
      const result = await response.text();
      console.log(result);
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <div className="payment-form">
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <input
        type="text"
        placeholder="Concept"
        value={concept}
        onChange={(e) => setConcept(e.target.value)}
      />
      <select
        value={selectedCurrency}
        onChange={(e) => setSelectedCurrency(e.target.value)}
      >
        <option value="">Select Currency</option>
        {filteredCryptoCurrencies.map((currency) => (
          <option key={currency.symbol} value={currency.blockchain}>
            {currency.name}
          </option>
        ))}
      </select>
      <button onClick={handleCreatePayment}>Create Payment</button>
    </div>
  );
}

export default PaymentForm;
