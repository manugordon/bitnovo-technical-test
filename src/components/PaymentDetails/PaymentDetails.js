import React, { useState, useEffect } from "react";
import "./PaymentDetails.css";
import {
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Button,
  CardActions,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import api from "../../services/api";
import QRCode from "qrcode.react";
import Web3 from "web3";

function PaymentDetails({ paymentData, currency }) {
  const [orderInfo, setOrderInfo] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [socket, setSocket] = useState(null);
  const [paymentOption, setPaymentOption] = useState("SMART_QR");

  useEffect(() => {
    if (paymentData && paymentData.identifier) {
      fetchOrderInfo(paymentData.identifier);

      const newSocket = new WebSocket(
        `wss://payments.pre-bnvo.com/ws/${paymentData.identifier}`
      );
      setSocket(newSocket);

      newSocket.addEventListener("open", () => {
        console.log("WebSocket connected");
      });

      newSocket.addEventListener("message", (event) => {
        console.log("Message received");
        const updatedOrderInfo = JSON.parse(event.data);
        setOrderInfo(updatedOrderInfo);
      });

      newSocket.addEventListener("close", () => {
        console.log("WebSocket closed");
      });

      return () => {
        newSocket.close();
      };
    }
  }, [paymentData]);

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

  const transformDateFormat = (inputDate) => {
    const date = new Date(inputDate);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;

    return formattedDate;
  };

  const fetchOrderInfo = async (identifier) => {
    try {
      const response = await api.get(`/orders/info/${identifier}`);
      const orderInfoData = await response.data;
      setOrderInfo(orderInfoData[0]);
      console.log(orderInfo);
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
      setTimeLeft("Expirado");
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

      const web3 = new Web3(window.ethereum);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0];

      const transactionParameters = {
        from: account,
        to: paymentData.address,
        value: web3.utils.toWei(orderInfo.crypto_amount.toString(), "ether"),
      };

      const transactionResponse = await web3.eth.sendTransaction(
        transactionParameters
      );

      fetchOrderInfo(paymentData.identifier);
      // Esta linea de codigo esta puesta para chequear si el esatado del pago se actualiza
      console.log({ transactionResponse });
    } catch (error) {
      console.log({ error });
    }
  };

  if (!orderInfo) {
    return <CircularProgress size={50} />;
  }

  const paymentStatus = orderInfo.status;

  if (paymentStatus === "EX" || paymentStatus === "OC") {
    alert("Pago caducado o cancelado");
  }

  if (paymentStatus === "CO" || paymentStatus === "AC") {
    alert("Pago realizado");
  }

  return (
    <div className="payment-details">
      <Grid container spacing={2}>
        <Grid md={6} item>
          <Typography
            variant="h5"
            display="block"
            mb={5}
            fontWeight="bold"
            gutterBottom
          >
            Resumen del pedido
          </Typography>
          <Card className="payment-details-card" p={5}>
            <CardContent className="payment-details-card-content">
              <Table aria-label="simple table">
                <TableBody>
                  <TableRow>
                    <TableCell align="left">Importe:</TableCell>
                    <TableCell align="right">
                      {orderInfo.fiat_amount} {orderInfo.fiat}{" "}
                      {orderInfo.status}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left">Moneda seleccionada:</TableCell>
                    <TableCell align="right">{currency.symbol}</TableCell>
                  </TableRow>
                  <TableRow sx={{ "& td": { border: 0 } }}>
                    <TableCell align="left">Comercio:</TableCell>
                    <TableCell align="right">Manuel Test Store</TableCell>
                  </TableRow>
                  <TableRow sx={{ "& td": { borderTop: 0 } }}>
                    <TableCell align="left">Fecha:</TableCell>
                    <TableCell align="right">
                      {transformDateFormat(orderInfo.created_at)}
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ "&:last-child td": { border: 0 } }}>
                    <TableCell align="left">Concepto:</TableCell>
                    <TableCell align="right">{orderInfo.notes}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
        <Grid md={6} item>
          <Typography
            variant="h5"
            display="block"
            mb={5}
            fontWeight="bold"
            gutterBottom
          >
            Realiza el pago
          </Typography>
          <Card className="payment-details-card payment-details-card-pay center">
            {timeLeft !== null && (
              <Grid
                display="flex"
                justifyContent="center"
                alignItems="center"
                mb={1}
              >
                <AccessTimeIcon fontSize="small" />
                &nbsp;
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  mb={0}
                  gutterBottom
                >
                  {timeLeft}
                </Typography>
              </Grid>
            )}
            <CardActions className="payment-details-card-actions">
              <Button
                className={paymentOption === "SMART_QR" ? "active" : ""}
                onClick={() => setPaymentOption("SMART_QR")}
              >
                SMART QR
              </Button>
              <span className="payment-details-card-actions-divider"></span>
              <Button
                className={paymentOption === "WALLET" ? "active" : ""}
                onClick={() => setPaymentOption("WALLET")}
              >
                WALLET
              </Button>
              <span className="payment-details-card-actions-divider"></span>
              <Button
                className={paymentOption === "METAMASK" ? "active" : ""}
                onClick={() => setPaymentOption("METAMASK")}
              >
                Web3
              </Button>
            </CardActions>
            {paymentOption !== "METAMASK" && (
              <Card className="payment-details-card-qr">
                <CardContent>
                  {paymentOption === "SMART_QR" && (
                    <QRCode value={generatePaymentLink()} />
                  )}
                  {paymentOption === "WALLET" && (
                    <QRCode value={paymentData.address} />
                  )}
                </CardContent>
              </Card>
            )}
            {paymentOption === "METAMASK" && (
              <Grid className="payment-details-metamask" m={5}>
                <Button
                  className="payment-details-metamask-button"
                  variant="contained"
                  onClick={startPayment}
                >
                  Metamask
                </Button>
              </Grid>
            )}
            <Typography>Enviar: {orderInfo.crypto_amount}</Typography>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}

export default PaymentDetails;
