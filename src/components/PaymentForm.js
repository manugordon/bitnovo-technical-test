import React, { useState, useEffect } from "react";
import api from "../services/api";

function PaymentForm({ handleCreatePayment }) {
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState("");
  const [cryptoCurrencies, setCryptoCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [filteredCryptoCurrencies, setFilteredCryptoCurrencies] = useState([]);

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

  const createPayment = async () => {
    try {
      const formData = new FormData();
      formData.append("expected_output_amount", amount);
      formData.append("input_currency", selectedCurrency);
      formData.append("notes", concept);

      const response = await api.post("/orders/", formData);
      const result = response.data;
      handleCreatePayment(result, selectedCurrency);
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
        onChange={(e) => {
          setSelectedCurrency(e.target.value);
        }}
      >
        <option value="">Select Currency</option>
        {filteredCryptoCurrencies.map((currency) => (
          <option key={currency.symbol} value={currency.blockchain}>
            {currency.name}
          </option>
        ))}
      </select>
      <button onClick={createPayment}>Create Payment</button>
    </div>
  );
}

export default PaymentForm;
