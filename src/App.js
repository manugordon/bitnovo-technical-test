import React, { useState } from "react";
import "./App.css";
import PaymentForm from "./components/PaymentForm/PaymentForm";
import PaymentDetails from "./components/PaymentDetails/PaymentDetails";
import api from "./services/api";
import { CircularProgress } from "@mui/material";

function App() {
  const [paymentData, setPaymentData] = useState(null);
  const [currency, setCurrency] = useState(null);
  const [state, setState] = useState("form");

  const handleCreatePayment = async (formData, currency) => {
    setState("loading");
    const response = await api.post("/orders/", formData);
    const data = response.data;
    setPaymentData(data);
    setCurrency(currency);
    setState("details");
  };

  const pageStates = {
    ["form"]: <PaymentForm handleCreatePayment={handleCreatePayment} />,
    ["details"]: paymentData && (
      <PaymentDetails paymentData={paymentData} currency={currency} />
    ),
    ["loading"]: <CircularProgress size={50} />,
  };

  return (
    <div className="App">
      <main>{pageStates[state]}</main>
    </div>
  );
}

export default App;
