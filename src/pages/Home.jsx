import { Link } from 'react-router-dom'
import Card from '../components/Card'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <div className="hero-section">
        <h2>Welcome to Khurana Enterprise</h2>
        <p>Manage your biscuit business with our comprehensive management system</p>
      </div>
      
      <div className="features-grid">
        <Link to="/stock" className="feature-link">
          <Card title="Stock Management">
            <p>Add and manage products, track inventory levels, and monitor stock quantities.</p>
            <div className="feature-stats">
              <span>🏷️ Product Management</span>
              <span>📦 Inventory Tracking</span>
            </div>
          </Card>
        </Link>

        <Link to="/billing" className="feature-link">
          <Card title="Billing System">
            <p>Create invoices, manage customer details, and handle GST calculations.</p>
            <div className="feature-stats">
              <span>🧾 Invoice Creation</span>
              <span>💰 GST Management</span>
            </div>
          </Card>
        </Link>

        <Link to="/sales" className="feature-link">
          <Card title="Sales Reports">
            <p>View sales analytics, track performance, and generate detailed reports.</p>
            <div className="feature-stats">
              <span>📊 Daily Reports</span>
              <span>📈 Sales Analytics</span>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  )
}

export default Home