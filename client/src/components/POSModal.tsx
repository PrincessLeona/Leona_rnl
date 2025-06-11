import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'react-query'
import { X, Plus, Minus, Trash2, ShoppingCart, Calculator } from 'lucide-react'
import { productsAPI, transactionsAPI, discountsAPI } from '../services/api'
import LoadingSpinner from './ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface Product {
  id: number
  name: string
  sku: string
  barcode: string
  price: number
  stock_quantity: number
  image_url: string
}

interface CartItem {
  product: Product
  quantity: number
  total: number
}

interface Discount {
  id: number
  name: string
  type: string
  value: number
  minimum_amount: number
}

interface POSModalProps {
  onClose: () => void
  onTransactionComplete: () => void
}

const POSModal: React.FC<POSModalProps> = ({ onClose, onTransactionComplete }) => {
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [amountPaid, setAmountPaid] = useState('')
  const [selectedDiscount, setSelectedDiscount] = useState('')
  const [showPayment, setShowPayment] = useState(false)

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useQuery(
    ['products', searchTerm],
    () => productsAPI.getAll({ 
      search: searchTerm,
      active_only: true
    }),
    { keepPreviousData: true }
  )

  // Fetch active discounts
  const { data: discountsData } = useQuery(
    'active-discounts',
    () => discountsAPI.getActive()
  )

  // Create transaction mutation
  const createTransactionMutation = useMutation(transactionsAPI.create, {
    onSuccess: (response) => {
      toast.success('Transaction completed successfully!')
      onTransactionComplete()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Transaction failed')
    }
  })

  const products: Product[] = productsData?.data?.data || []
  const discounts: Discount[] = discountsData?.data?.discounts || []

  const addToCart = (product: Product) => {
    if (product.stock_quantity <= 0) {
      toast.error('Product is out of stock')
      return
    }

    const existingItem = cart.find(item => item.product.id === product.id)
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock_quantity) {
        toast.error('Insufficient stock')
        return
      }
      updateQuantity(product.id, existingItem.quantity + 1)
    } else {
      setCart(prev => [...prev, {
        product,
        quantity: 1,
        total: product.price
      }])
    }
  }

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const maxQuantity = item.product.stock_quantity
        const quantity = Math.min(newQuantity, maxQuantity)
        return {
          ...item,
          quantity,
          total: item.product.price * quantity
        }
      }
      return item
    }))
  }

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId))
  }

  const clearCart = () => {
    setCart([])
  }

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateDiscount = () => {
    if (!selectedDiscount) return 0
    
    const discount = discounts.find(d => d.id.toString() === selectedDiscount)
    if (!discount) return 0

    const subtotal = calculateSubtotal()
    if (discount.minimum_amount && subtotal < discount.minimum_amount) return 0

    if (discount.type === 'percentage') {
      return (subtotal * discount.value) / 100
    } else {
      return discount.value
    }
  }

  const calculateTax = () => {
    const subtotal = calculateSubtotal()
    const discount = calculateDiscount()
    return (subtotal - discount) * 0.08 // 8% tax
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discount = calculateDiscount()
    const tax = calculateTax()
    return subtotal - discount + tax
  }

  const calculateChange = () => {
    const total = calculateTotal()
    const paid = parseFloat(amountPaid) || 0
    return Math.max(0, paid - total)
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }
    setShowPayment(true)
  }

  const handlePayment = () => {
    const total = calculateTotal()
    const paid = parseFloat(amountPaid) || 0

    if (paid < total) {
      toast.error('Insufficient payment amount')
      return
    }

    const transactionData = {
      customer_name: customerName || null,
      customer_email: customerEmail || null,
      items: cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
      })),
      payment_method: paymentMethod,
      amount_paid: paid,
      discount_id: selectedDiscount ? parseInt(selectedDiscount) : null
    }

    createTransactionMutation.mutate(transactionData)
  }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '1200px', height: '90vh' }}>
        <div className="modal-header">
          <h3 className="modal-title">Point of Sale</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body" style={{ height: 'calc(90vh - 120px)', overflow: 'hidden' }}>
          <div className="grid-2" style={{ height: '100%', gap: '1rem' }}>
            {/* Products Section */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                />
              </div>
              
              <div style={{ flex: 1, overflow: 'auto', border: '1px solid #ddd', borderRadius: '8px' }}>
                {productsLoading ? (
                  <div className="text-center p-4">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <div className="grid-3" style={{ padding: '1rem', gap: '1rem' }}>
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="product-card"
                        onClick={() => addToCart(product)}
                        style={{
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          padding: '1rem',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          background: product.stock_quantity <= 0 ? '#f5f5f5' : 'white'
                        }}
                      >
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            style={{ 
                              width: '100%', 
                              height: '80px', 
                              objectFit: 'cover',
                              borderRadius: '4px',
                              marginBottom: '0.5rem'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '80px',
                            background: '#f0f0f0',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '0.5rem'
                          }}>
                            <ShoppingCart size={24} color="#999" />
                          </div>
                        )}
                        <h4 style={{ fontSize: '0.875rem', margin: '0 0 0.25rem 0' }}>
                          {product.name}
                        </h4>
                        <p style={{ fontSize: '0.75rem', color: '#666', margin: '0 0 0.5rem 0' }}>
                          {product.sku}
                        </p>
                        <div className="flex-between">
                          <strong>₱{product.price.toFixed(2)}</strong>
                          <small className={product.stock_quantity <= 0 ? 'text-danger' : 'text-muted'}>
                            Stock: {product.stock_quantity}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cart Section */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="flex-between mb-3">
                <h4>Cart ({cart.length})</h4>
                {cart.length > 0 && (
                  <button className="btn btn-sm btn-danger" onClick={clearCart}>
                    Clear Cart
                  </button>
                )}
              </div>

              <div style={{ flex: 1, overflow: 'auto', border: '1px solid #ddd', borderRadius: '8px', padding: '1rem' }}>
                {cart.length === 0 ? (
                  <div className="text-center text-muted">
                    <ShoppingCart size={48} style={{ opacity: 0.3 }} />
                    <p>Cart is empty</p>
                  </div>
                ) : (
                  <div>
                    {cart.map((item) => (
                      <div key={item.product.id} className="cart-item" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 0',
                        borderBottom: '1px solid #eee'
                      }}>
                        <div style={{ flex: 1 }}>
                          <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem' }}>
                            {item.product.name}
                          </h5>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#666' }}>
                            ₱{item.product.price.toFixed(2)} each
                          </p>
                        </div>
                        <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ minWidth: '2rem', textAlign: 'center' }}>
                            {item.quantity}
                          </span>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <div style={{ minWidth: '4rem', textAlign: 'right' }}>
                          <strong>₱{item.total.toFixed(2)}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Summary */}
              {cart.length > 0 && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                  {!showPayment ? (
                    <>
                      {/* Customer Info */}
                      <div className="mb-3">
                        <input
                          type="text"
                          placeholder="Customer Name (Optional)"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="form-input mb-2"
                        />
                        <input
                          type="email"
                          placeholder="Customer Email (Optional)"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="form-input"
                        />
                      </div>

                      {/* Discount */}
                      {discounts.length > 0 && (
                        <div className="mb-3">
                          <select
                            value={selectedDiscount}
                            onChange={(e) => setSelectedDiscount(e.target.value)}
                            className="form-select"
                          >
                            <option value="">No Discount</option>
                            {discounts.map((discount) => (
                              <option key={discount.id} value={discount.id}>
                                {discount.name} - {discount.type === 'percentage' ? `${discount.value}%` : `₱${discount.value}`}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Summary */}
                      <div className="summary">
                        <div className="flex-between">
                          <span>Subtotal:</span>
                          <span>₱{calculateSubtotal().toFixed(2)}</span>
                        </div>
                        {calculateDiscount() > 0 && (
                          <div className="flex-between text-success">
                            <span>Discount:</span>
                            <span>-₱{calculateDiscount().toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex-between">
                          <span>Tax (8%):</span>
                          <span>₱{calculateTax().toFixed(2)}</span>
                        </div>
                        <hr />
                        <div className="flex-between">
                          <strong>Total:</strong>
                          <strong>₱{calculateTotal().toFixed(2)}</strong>
                        </div>
                      </div>

                      <button
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '1rem' }}
                        onClick={handleCheckout}
                      >
                        <Calculator size={16} />
                        Proceed to Payment
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Payment Section */}
                      <div className="mb-3">
                        <label className="form-label">Payment Method</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="form-select"
                        >
                          <option value="cash">Cash</option>
                          <option value="card">Card</option>
                          <option value="digital_wallet">Digital Wallet</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Amount Paid</label>
                        <input
                          type="number"
                          value={amountPaid}
                          onChange={(e) => setAmountPaid(e.target.value)}
                          className="form-input"
                          step="0.01"
                          min={calculateTotal()}
                          placeholder={`Minimum: ₱${calculateTotal().toFixed(2)}`}
                        />
                      </div>

                      {parseFloat(amountPaid) >= calculateTotal() && (
                        <div className="alert alert-success">
                          <strong>Change: ₱{calculateChange().toFixed(2)}</strong>
                        </div>
                      )}

                      <div className="flex" style={{ gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setShowPayment(false)}
                          style={{ flex: 1 }}
                        >
                          Back
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={handlePayment}
                          disabled={createTransactionMutation.isLoading || parseFloat(amountPaid) < calculateTotal()}
                          style={{ flex: 1 }}
                        >
                          {createTransactionMutation.isLoading ? (
                            <>
                              <LoadingSpinner size="sm" />
                              Processing...
                            </>
                          ) : (
                            'Complete Transaction'
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .product-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .grid-3 {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        }
        
        @media (max-width: 768px) {
          .grid-3 {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          }
        }
      `}</style>
    </div>
  )
}

export default POSModal