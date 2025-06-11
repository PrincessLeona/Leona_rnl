import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { Calendar, TrendingUp, DollarSign, ShoppingCart, Users, Package, Download, Filter } from 'lucide-react'
import { transactionsAPI, productsAPI, usersAPI } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const ReportsPage: React.FC = () => {
  const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0])
  const [reportType, setReportType] = useState('daily')

  // Fetch daily sales data
  const { data: dailySalesData, isLoading: dailySalesLoading } = useQuery(
    ['daily-sales', dateTo],
    () => transactionsAPI.getDailySales(dateTo),
    { refetchInterval: 30000 }
  )

  // Fetch monthly sales data
  const { data: monthlySalesData, isLoading: monthlySalesLoading } = useQuery(
    ['monthly-sales', new Date().getMonth() + 1, new Date().getFullYear()],
    () => transactionsAPI.getMonthlySales(new Date().getMonth() + 1, new Date().getFullYear())
  )

  // Fetch transactions for period
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery(
    ['transactions-report', dateFrom, dateTo],
    () => transactionsAPI.getAll({ 
      date_from: dateFrom,
      date_to: dateTo,
      per_page: 1000
    })
  )

  // Fetch low stock products
  const { data: lowStockData } = useQuery(
    'low-stock-report',
    () => productsAPI.getLowStock()
  )

  const dailySales = dailySalesData?.data?.sales_summary || {}
  const topProducts = dailySalesData?.data?.top_products || []
  const monthlySales = monthlySalesData?.data?.daily_sales || []
  const transactions = transactionsData?.data?.data || []
  const lowStockProducts = lowStockData?.data?.products || []

  // Chart configurations
  const salesTrendData = {
    labels: monthlySales.map((day: any) => new Date(day.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Daily Sales',
        data: monthlySales.map((day: any) => day.sales),
        borderColor: 'var(--primary-color)',
        backgroundColor: 'rgba(233, 30, 99, 0.1)',
        tension: 0.4,
      },
    ],
  }

  const topProductsData = {
    labels: topProducts.map((product: any) => product.name),
    datasets: [
      {
        label: 'Quantity Sold',
        data: topProducts.map((product: any) => product.total_quantity),
        backgroundColor: [
          'var(--primary-color)',
          'var(--secondary-color)',
          'var(--success-color)',
          'var(--warning-color)',
          'var(--info-color)',
        ],
      },
    ],
  }

  const paymentMethodData = {
    labels: ['Cash', 'Card', 'Digital Wallet'],
    datasets: [
      {
        data: [
          transactions.filter((t: any) => t.payment_method === 'cash').length,
          transactions.filter((t: any) => t.payment_method === 'card').length,
          transactions.filter((t: any) => t.payment_method === 'digital_wallet').length,
        ],
        backgroundColor: [
          'var(--success-color)',
          'var(--primary-color)',
          'var(--info-color)',
        ],
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  }

  const exportReport = () => {
    const reportData = {
      period: { from: dateFrom, to: dateTo },
      summary: {
        totalSales: dailySales.total_sales || 0,
        totalTransactions: dailySales.total_transactions || 0,
        averageSale: dailySales.average_sale || 0,
        totalDiscounts: dailySales.total_discounts || 0,
      },
      topProducts,
      lowStockProducts,
      transactions: transactions.slice(0, 100), // Limit for export
    }

    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `chiccheckout-report-${dateFrom}-to-${dateTo}.json`
    link.click()
  }

  const isLoading = dailySalesLoading || monthlySalesLoading || transactionsLoading

  return (
    <div className="reports-page fade-in">
      {/* Header */}
      <div className="page-header flex-between mb-4">
        <div>
          <h1>Reports & Analytics</h1>
          <p className="text-muted">View sales reports and business analytics</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={exportReport}
        >
          <Download size={16} />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section mb-4">
        <div className="card">
          <div className="card-body">
            <div className="grid-4">
              <div>
                <label className="form-label">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="form-select"
                >
                  <option value="daily">Daily Report</option>
                  <option value="weekly">Weekly Report</option>
                  <option value="monthly">Monthly Report</option>
                  <option value="custom">Custom Period</option>
                </select>
              </div>
              <div>
                <label className="form-label">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="flex" style={{ alignItems: 'end' }}>
                <button className="btn btn-outline">
                  <Filter size={16} />
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-4">
          <LoadingSpinner size="lg" />
          <p className="mt-2">Loading reports...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="summary-cards grid-4 mb-4">
            <div className="card">
              <div className="card-body">
                <div className="flex-between">
                  <div>
                    <h3>₱{(dailySales.total_sales || 0).toLocaleString()}</h3>
                    <p className="text-muted">Today's Sales</p>
                  </div>
                  <div className="summary-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary-color)' }}>
                    <DollarSign size={24} />
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex-between">
                  <div>
                    <h3>{dailySales.total_transactions || 0}</h3>
                    <p className="text-muted">Transactions</p>
                  </div>
                  <div className="summary-icon" style={{ background: '#e1bee7', color: 'var(--secondary-color)' }}>
                    <ShoppingCart size={24} />
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex-between">
                  <div>
                    <h3>₱{(dailySales.average_sale || 0).toLocaleString()}</h3>
                    <p className="text-muted">Average Sale</p>
                  </div>
                  <div className="summary-icon" style={{ background: '#c8e6c9', color: 'var(--success-color)' }}>
                    <TrendingUp size={24} />
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex-between">
                  <div>
                    <h3>{lowStockProducts.length}</h3>
                    <p className="text-muted">Low Stock Items</p>
                  </div>
                  <div className="summary-icon" style={{ background: '#ffe0b2', color: 'var(--warning-color)' }}>
                    <Package size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-section grid-2 mb-4">
            {/* Sales Trend */}
            <div className="card">
              <div className="card-header">
                <h3>Sales Trend (Last 30 Days)</h3>
              </div>
              <div className="card-body">
                {monthlySales.length > 0 ? (
                  <Line data={salesTrendData} options={chartOptions} />
                ) : (
                  <div className="text-center text-muted p-4">
                    <Calendar size={48} style={{ opacity: 0.3 }} />
                    <p>No sales data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Products */}
            <div className="card">
              <div className="card-header">
                <h3>Top Products (Today)</h3>
              </div>
              <div className="card-body">
                {topProducts.length > 0 ? (
                  <Bar data={topProductsData} options={chartOptions} />
                ) : (
                  <div className="text-center text-muted p-4">
                    <Package size={48} style={{ opacity: 0.3 }} />
                    <p>No product data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Charts */}
          <div className="charts-section grid-2 mb-4">
            {/* Payment Methods */}
            <div className="card">
              <div className="card-header">
                <h3>Payment Methods Distribution</h3>
              </div>
              <div className="card-body">
                {transactions.length > 0 ? (
                  <Doughnut data={paymentMethodData} options={chartOptions} />
                ) : (
                  <div className="text-center text-muted p-4">
                    <DollarSign size={48} style={{ opacity: 0.3 }} />
                    <p>No payment data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className="card">
              <div className="card-header">
                <h3>Low Stock Alert</h3>
              </div>
              <div className="card-body">
                {lowStockProducts.length > 0 ? (
                  <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                    {lowStockProducts.map((product: any) => (
                      <div key={product.id} className="alert alert-warning" style={{ marginBottom: '0.5rem' }}>
                        <div className="flex-between">
                          <div>
                            <strong>{product.name}</strong>
                            <br />
                            <small>SKU: {product.sku}</small>
                          </div>
                          <div className="text-right">
                            <strong>{product.stock_quantity}</strong>
                            <br />
                            <small>Min: {product.min_stock_level}</small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-success p-4">
                    <Package size={48} style={{ opacity: 0.3 }} />
                    <p>All products are well stocked!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="card">
            <div className="card-header">
              <h3>Recent Transactions</h3>
            </div>
            <div className="card-body p-0">
              {transactions.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Transaction #</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 10).map((transaction: any) => (
                        <tr key={transaction.id}>
                          <td><strong>{transaction.transaction_number}</strong></td>
                          <td>{transaction.customer_name || 'Walk-in Customer'}</td>
                          <td>{transaction.items?.length || 0} item(s)</td>
                          <td><strong>₱{transaction.total_amount.toFixed(2)}</strong></td>
                          <td style={{ textTransform: 'capitalize' }}>
                            {transaction.payment_method.replace('_', ' ')}
                          </td>
                          <td>{new Date(transaction.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-muted p-4">
                  <ShoppingCart size={48} style={{ opacity: 0.3 }} />
                  <p>No transactions found</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        .summary-cards .card {
          transition: var(--transition);
        }
        
        .summary-cards .card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-hover);
        }
        
        .summary-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .charts-section .card {
          height: 400px;
        }
        
        .charts-section .card-body {
          height: calc(100% - 60px);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        @media (max-width: 768px) {
          .summary-cards {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .charts-section {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default ReportsPage