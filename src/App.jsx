import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Stock from './pages/Stock'
import Billing from './pages/Billing'
import Sales from './pages/Sales'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/sales" element={<Sales />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
