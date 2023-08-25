import React, { useState, useEffect } from "react";
import "./PaymentForm.css";
import api from "../../services/api";
import {
  TextField,
  Typography,
  InputAdornment,
  MenuItem,
  FormControl,
  Select,
  Button,
} from "@mui/material";

function PaymentForm({ handleCreatePayment, loading }) {
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState("");
  const [cryptoCurrencies, setCryptoCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [filteredCryptoCurrencies, setFilteredCryptoCurrencies] = useState([]);

  useEffect(() => {
    fetchCryptoCurrencies();
  }, []);

  useEffect(() => {
    setSelectedCurrency("");
    if (amount !== "") {
      const filteredCurrencies = cryptoCurrencies.filter(
        (currency) => parseFloat(amount) >= parseFloat(currency.min_amount)
      );
      setFilteredCryptoCurrencies(filteredCurrencies);
    }
  }, [amount, cryptoCurrencies]);

  const fetchCryptoCurrencies = async () => {
    try {
      const response = await api.get("/currencies");
      setCryptoCurrencies(response.data);
      setFilteredCryptoCurrencies(response.data);
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  };

  const createPayment = async () => {
    try {
      const formData = new FormData();
      formData.append("expected_output_amount", amount);
      formData.append("input_currency", selectedCurrency.blockchain);
      formData.append("notes", concept);
      await handleCreatePayment(formData, selectedCurrency);
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <div className="payment-form">
      <Typography
        variant="h5"
        display="block"
        mb={5}
        fontWeight="bold"
        gutterBottom
      >
        Crear pago
      </Typography>
      <FormControl fullWidth sx={{ m: 1 }}>
        <Typography variant="caption" display="block" gutterBottom>
          Importe a pagar
        </Typography>
        <TextField
          variant="outlined"
          id="outlined-basic"
          type="number"
          value={amount}
          InputProps={{
            endAdornment: <InputAdornment position="end">EUR</InputAdornment>,
          }}
          onChange={(e) => setAmount(e.target.value)}
        />
      </FormControl>
      <FormControl fullWidth sx={{ m: 1 }}>
        <Typography variant="caption" display="block" gutterBottom>
          Concepto
        </Typography>
        <TextField
          variant="outlined"
          id="outlined-basic"
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
        />
      </FormControl>
      <FormControl variant="outlined" sx={{ m: 1 }}>
        <Typography variant="caption" display="block" gutterBottom>
          Seleccionar moneda
        </Typography>
        <Select
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
        >
          {filteredCryptoCurrencies.map((currency) => (
            <MenuItem key={currency.symbol} value={currency}>
              {currency.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="contained" sx={{ m: 1 }} onClick={createPayment}>
        Crear Pago
      </Button>
    </div>
  );
}

export default PaymentForm;
