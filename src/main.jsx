import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

/**
 * StrictMode is deliberately left off.
 *
 * In development it runs effects twice, which would double-fire the phone
 * timer's tick and post duplicate sync messages. Neither breaks anything, but
 * a quiz you are about to run live in front of a room should behave in dev
 * exactly as it does in the build.
 */
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
