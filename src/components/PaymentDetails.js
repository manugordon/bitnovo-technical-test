import React, { useState, useEffect } from "react";
import api from "../services/api";
import QRCode from "qrcode.react";
const ethers = require("ethers");

function PaymentDetails({ paymentData, currency }) {
  const [orderInfo, setOrderInfo] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(
    (currency) => {
      if (paymentData && paymentData.identifier) {
        fetchOrderInfo(paymentData.identifier);
      }
    },
    [paymentData]
  );

  useEffect(() => {
    if (orderInfo && orderInfo.expired_time) {
      calculateTimeLeft(orderInfo.expired_time);
      const interval = setInterval(() => {
        calculateTimeLeft(orderInfo.expired_time);
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [orderInfo]);

  const fetchOrderInfo = async (identifier) => {
    try {
      const response = await api.get(`/orders/info/${identifier}`);
      const orderInfoData = await response.data;
      setOrderInfo(orderInfoData[0]);
    } catch (error) {
      console.error("Error fetching payment info:", error);
    }
  };
  const calculateTimeLeft = (expiredTime) => {
    const now = new Date();
    const expirationTime = new Date(expiredTime);
    const difference = expirationTime - now;

    if (difference > 0) {
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    } else {
      setTimeLeft("Expired");
    }
  };
  const generatePaymentLink = () => {
    const paymentLink = paymentData.payment_uri;
    return paymentLink;
  };

  const startPayment = async (event) => {
    console.log(orderInfo.crypto_amount);
    console.log(paymentData.address);

    event.preventDefault();

    try {
      if (!window.ethereum) {
        throw new Error("No crypto wallet found. Please install it.");
      }

      await window.ethereum.send("eth_requestAccounts");

      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const signer = provider.getSigner();

      ethers.utils.getAddress(paymentData.address);

      const transactionResponse = await signer.sendTransaction({
        to: paymentData.address,

        value: ethers.utils.parseEther(orderInfo.crypto_amount.toString()),
      });

      console.log({ transactionResponse });
    } catch (error) {
      console.log({ error });
    }
  };

  if (!orderInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {timeLeft !== null && <p>Time Left: {timeLeft}</p>}
      <h2>Payment Details</h2>
      <p>
        Importe: {orderInfo.fiat}
        {orderInfo.fiat_amount}
      </p>
      <p>Moneda seleccionada: {currency.symbol}</p>
      <p>Crypto amount: {orderInfo.crypto_amount}</p>
      <p>Comercio: Manuel test store</p>
      <p>Fecha: {orderInfo.created_at}</p>
      <p>Payment URI: {orderInfo.address}</p>
      <p>Concepto: {orderInfo.notes}</p>
      <QRCode value={generatePaymentLink()} />
      <button onClick={startPayment}>metamask</button>
    </div>
  );
}

export default PaymentDetails;
