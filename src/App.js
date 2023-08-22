import React from 'react';
import './App.css';
import PaymentForm from './components/PaymentForm';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Payment Gateway with Cryptocurrencies</h1>
      </header>
      <main>
        <PaymentForm />
      </main>
    </div>
  );
}

export default App;
