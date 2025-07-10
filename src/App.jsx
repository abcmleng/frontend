import React from 'react';
import { KYCFlow } from './components/KYCFlow';
import './styles/App.css';

function App() {
  return (
    <div className="app-container">
      <main className="app-content">
        <div className="kyc-flow-wrapper">
          <KYCFlow userId="test-user" />
        </div>
      </main>
    </div>
  );
}

export default App;