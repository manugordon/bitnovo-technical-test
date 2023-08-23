import React, { useState } from "react";
import "./App.css";
import PaymentForm from "./components/PaymentForm";
import PaymentDetails from "./components/PaymentDetails";

function App() {
  const [paymentData, setPaymentData] = useState(null);
  const [currency, setCurrency] = useState(null);

  const handleCreatePayment = (data, currency) => {
    setPaymentData(data);
    setCurrency(currency);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Payment Gateway with Cryptocurrencies</h1>
      </header>
      <main>
        <PaymentForm handleCreatePayment={handleCreatePayment} />
        <PaymentDetails paymentData={paymentData} currency={currency} />
      </main>
    </div>
  );
}

export default App;
