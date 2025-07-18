import React, { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Plus, Edit, Trash2, Search, Package, BarChart3, AlertTriangle } from 'lucide-react'
import { productsAPI, categoriesAPI } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import BarcodeGenerator from '../components/BarcodeGenerator'
import toast from 'react-hot-toast'

interface Product {
  id: number
  name: string
  description: string
  sku: string
  barcode: string
  category: {
    id: number
    name: string
  }
  price: number
  cost: number
  stock_quantity: number
  min_stock_level: number
  image_url: string
  is_active: boolean
  created_at: string
}

interface Category {
  id: number
  name: string
}

const ProductsPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false)
  const [showBarcodeModal, setShowBarcodeModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    barcode: '',
    category_id: '',
    price: '',
    cost: '',
    stock_quantity: '',
    min_stock_level: '',
    image_url: ''
  })

  const queryClient = useQueryClient()

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useQuery(
    ['products', searchTerm, categoryFilter],
    () => productsAPI.getAll({ 
      search: searchTerm,
      category_id: categoryFilter || undefined
    }),
    { keepPreviousData: true }
  )

  // Fetch categories
  const { data: categoriesData } = useQuery('categories', () => categoriesAPI.getAll())

  // Create product mutation
  const createProductMutation = useMutation(productsAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('products')
      toast.success('Product created successfully!')
      handleCloseModal()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create product')
    }
  })

  // Update product mutation
  const updateProductMutation = useMutation(
    ({ id, data }: { id: number; data: any }) => productsAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products')
        toast.success('Product updated successfully!')
        handleCloseModal()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update product')
      }
    }
  )

  // Delete product mutation
  const deleteProductMutation = useMutation(productsAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('products')
      toast.success('Product deactivated successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to deactivate product')
    }
  })

  const products: Product[] = productsData?.data?.data || []
  const categories: Category[] = categoriesData?.data?.data || []

  const generateSKU = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    return `CHC${timestamp}${random}`
  }

  const generateBarcode = () => {
    return Date.now().toString() + Math.random().toString().slice(2, 8)
  }

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        description: product.description,
        sku: product.sku,
        barcode: product.barcode,
        category_id: product.category.id.toString(),
        price: product.price.toString(),
        cost: product.cost.toString(),
        stock_quantity: product.stock_quantity.toString(),
        min_stock_level: product.min_stock_level.toString(),
        image_url: product.image_url
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        sku: generateSKU(),
        barcode: generateBarcode(),
        category_id: '',
        price: '',
        cost: '',
        stock_quantity: '',
        min_stock_level: '10',
        image_url: ''
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingProduct(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost),
      stock_quantity: parseInt(formData.stock_quantity),
      min_stock_level: parseInt(formData.min_stock_level),
      category_id: parseInt(formData.category_id)
    }

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: submitData })
    } else {
      createProductMutation.mutate(submitData)
    }
  }

  const handleDelete = (product: Product) => {
    if (window.confirm(`Are you sure you want to deactivate "${product.name}"?`)) {
      deleteProductMutation.mutate(product.id)
    }
  }

  const handleShowBarcode = (product: Product) => {
    setSelectedProduct(product)
    setShowBarcodeModal(true)
  }

  const isLoading = createProductMutation.isLoading || updateProductMutation.isLoading

  return (
    <div className="products-page fade-in">
      {/* Header */}
      <div className="page-header flex-between mb-4">
        <div>
          <h1>Products Management</h1>
          <p className="text-muted">Manage beauty products and inventory</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => handleOpenModal()}
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section mb-4">
        <div className="card">
          <div className="card-body">
            <div className="grid-2">
              <div style={{ position: 'relative' }}>
                <Search 
                  size={16} 
                  style={{ 
                    position: 'absolute', 
                    left: '0.75rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#666'
                  }} 
                />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="form-select"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="card-header">
          <h3>Products ({products.length})</h3>
        </div>
        <div className="card-body p-0">
          {productsLoading ? (
            <div className="text-center p-4">
              <LoadingSpinner />
              <p className="mt-2">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-muted">No products found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU/Barcode</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="flex" style={{ alignItems: 'center', gap: '1rem' }}>
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              style={{ 
                                width: '50px', 
                                height: '50px', 
                                objectFit: 'cover',
                                borderRadius: '8px'
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '50px',
                              height: '50px',
                              background: '#f0f0f0',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Package size={20} color="#999" />
                            </div>
                          )}
                          <div>
                            <strong>{product.name}</strong>
                            <br />
                            <small className="text-muted">{product.description}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{product.sku}</strong>
                          <br />
                          <small className="text-muted">{product.barcode}</small>
                        </div>
                      </td>
                      <td>{product.category.name}</td>
                      <td>
                        <div>
                          <strong>₱{product.price.toFixed(2)}</strong>
                          <br />
                          <small className="text-muted">Cost: ₱{product.cost.toFixed(2)}</small>
                        </div>
                      </td>
                      <td>
                        <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                          <span>{product.stock_quantity}</span>
                          {product.stock_quantity <= product.min_stock_level && (
                            <AlertTriangle size={16} color="var(--warning-color)" />
                          )}
                        </div>
                        <small className="text-muted">Min: {product.min_stock_level}</small>
                      </td>
                      <td>
                        <span className={`badge ${product.is_active ? 'badge-success' : 'badge-danger'}`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="flex" style={{ gap: '0.5rem' }}>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleShowBarcode(product)}
                            title="View Barcode"
                          >
                            <BarChart3 size={14} />
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleOpenModal(product)}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(product)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">SKU *</label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Barcode *</label>
                    <input
                      type="text"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="form-input"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cost *</label>
                    <input
                      type="number"
                      name="cost"
                      value={formData.cost}
                      onChange={handleInputChange}
                      className="form-input"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Quantity *</label>
                    <input
                      type="number"
                      name="stock_quantity"
                      value={formData.stock_quantity}
                      onChange={handleInputChange}
                      className="form-input"
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Min Stock Level *</label>
                    <input
                      type="number"
                      name="min_stock_level"
                      value={formData.min_stock_level}
                      onChange={handleInputChange}
                      className="form-input"
                      min="0"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      {editingProduct ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingProduct ? 'Update Product' : 'Create Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Modal */}
      {showBarcodeModal && selectedProduct && (
        <BarcodeGenerator
          product={selectedProduct}
          onClose={() => setShowBarcodeModal(false)}
        />
      )}
    </div>
  )
}

export default ProductsPage