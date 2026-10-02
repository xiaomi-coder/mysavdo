import React from 'react';
import ReactDOM from 'react-dom/client';
import '@phosphor-icons/web/regular';
import '@phosphor-icons/web/fill';
import './index.css';
import App from './App';
import { initErrorReport } from './utils/errorReport';

// Xato yig'ish: DSN sozlanmagan bo'lsa o'zi o'chiq turadi
initErrorReport();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
