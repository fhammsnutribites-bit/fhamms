import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import { productsApi } from '../../services/productsApi.js';
import '../../styles/pages/admin-products.css';

const DEFAULT_WEIGHTS = [
  { weight: 250, price: '', stock: '', discountType: '', discountValue: '', isDiscountActive: false },
  { weight: 500, price: '', stock: '', discountType: '', discountValue: '', isDiscountActive: false },
  { weight: 1000, price: '', stock: '', discountType: '', discountValue: '', isDiscountActive: false },
];
const DEFAULT_PRODUCT = {
  name: '',
  description: '',
  basePrice: '',
  image: '',
  category: '',
  weightOptions: DEFAULT_WEIGHTS,
  discountType: '',
  discountValue: '',
  isDiscountActive: false,
  isBestseller: false,
};

function AdminProducts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editingProductName, setEditingProductName] = useState('');
  const [editingLoading, setEditingLoading] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_PRODUCT);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGoBack = () => {
    navigate(-1);
  };

 

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productsApi.getAll();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);
   useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Auto-clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  function handleWeightChange(idx, field, value) {
    setFormData(fd => {
      const updated = fd.weightOptions.map((w, i) => {
        if (i === idx) {
          const updatedWeight = { ...w, [field]: value };
          // If discount is being disabled, clear discount fields
          if (field === 'isDiscountActive' && !value) {
            updatedWeight.discountType = '';
            updatedWeight.discountValue = '';
          }
          return updatedWeight;
        }
        return w;
      });
      return { ...fd, weightOptions: updated };
    });
  }

  function handleFormChange(field, value) {
    setFormData(fd => ({ ...fd, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!formData.name.trim() || !formData.category.trim()) {
      setError('Name and category are required.');
      return;
    }
    if (!formData.weightOptions.some(w => w.price && w.stock)) {
      setError('Enter at least one weight/price/stock for the laddu.');
      return;
    }
    try {
      const submitData = {
        ...formData,
        basePrice: formData.weightOptions[0].price,
        weightOptions: formData.weightOptions.filter(w => w.price).map(w => ({
          weight: w.weight,
          price: Number(w.price),
          stock: Number(w.stock) || 0,
          discountType: w.isDiscountActive && w.discountType ? w.discountType : null,
          discountValue: w.isDiscountActive && w.discountValue ? Number(w.discountValue) : 0,
          isDiscountActive: w.isDiscountActive || false
        })),
        discountType: formData.isDiscountActive && formData.discountType ? formData.discountType : null,
        discountValue: formData.isDiscountActive && formData.discountValue ? Number(formData.discountValue) : 0,
        isDiscountActive: formData.isDiscountActive || false,
        isBestseller: formData.isBestseller || false
      };
      if (editing) {
        await productsApi.update(editing, submitData);
        setSuccess('Product updated!');
        // Scroll to top after successful edit with multiple methods
        setTimeout(() => {
          window.scrollTo(0, 0);
          document.body.scrollTop = 0;
          document.documentElement.scrollTop = 0;
        }, 100);
      } else {
        await productsApi.create(submitData);
        setSuccess('Product created!');
      }
      // Close modal and reset form
      setShowForm(false);
      setEditing(null);
      setEditingProductName('');
      setFormData(DEFAULT_PRODUCT);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    }
  }

  async function handleEdit(product) {
    setEditingLoading(true);

    setEditing(product._id);
    setEditingProductName(product.name);
    setShowForm(true);
    setError('');
    setSuccess('');
    setFormData({
      name: product.name,
      description: product.description,
      basePrice: product.basePrice,
      image: product.image || '',
      category: product.category || '',
      discountType: product.discountType || '',
      discountValue: product.discountValue || '',
      isDiscountActive: product.isDiscountActive || false,
      isBestseller: product.isBestseller || false,
      weightOptions: [250,500,1000].map(w => {
        const existing = (product.weightOptions || []).find(opt => opt.weight === w);
        return existing ? {
          weight: w,
          price: existing.price,
          stock: existing.stock || '',
          discountType: existing.discountType || '',
          discountValue: existing.discountValue || '',
          isDiscountActive: existing.isDiscountActive || false
        } : { weight: w, price: '', stock: '', discountType: '', discountValue: '', isDiscountActive: false };
      }),
    });

    setEditingLoading(false);
  }

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productsApi.delete(id);
      fetchProducts();
    } catch (err) {
      setError('Failed to delete product');
      console.error('Delete product error:', err);
    }
  }, [fetchProducts]);

  if (!user?.isAdmin) {
    return (
      <div>
        <Navbar />
        <div className="admin-products__message">Access Denied</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="admin-products">
      <Navbar />
      <div className="admin-products__container">
        <header className="admin-products__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button
              onClick={handleGoBack}
              className="admin-products__back-button"
            >
              ← Back
            </button>
            <h1 className="admin-products__title" style={{ margin: 0 }}>Manage Nutri Laddus</h1>
          </div>
          <button
            className="admin-products__add-btn"
            onClick={() => {
              setShowForm(true);
              setEditing(null);
              setEditingProductName('');
              setError('');
              setSuccess('');
              setFormData(DEFAULT_PRODUCT);
            }}
          >
            + Add Product
          </button>
        </header>

        {!!success && (
          <div className="admin-products__page-success">
            {success}
          </div>
        )}

        {/* Modal for Add/Edit Product */}
        {showForm && (
          <div className="admin-products__modal-overlay" onClick={() => setShowForm(false)}>
            <div className="admin-products__modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-products__modal-header">
                <h2 className="admin-products__modal-title">
                  {editing ? `Edit: ${editingProductName}` : 'Add Product'}
                </h2>
                <button
                  type="button"
                  className="admin-products__modal-close"
                  onClick={() => setShowForm(false)}
                >
                  ×
                </button>
              </div>
              <form className="admin-products__form" onSubmit={handleSubmit}>
                {!!error && <div className="admin-products__form-error">{error}</div>}
            <div className="admin-products__form-fields">
              <label>Name*
                <input value={formData.name} onChange={e => handleFormChange('name', e.target.value)} required className="admin-products__input" />
              </label>
              <label>Category*
                <input value={formData.category} onChange={e => handleFormChange('category', e.target.value)} required className="admin-products__input" placeholder="e.g. Dry Fruit Laddus" />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={formData.isBestseller}
                  onChange={e => handleFormChange('isBestseller', e.target.checked)}
                />
                Mark as Bestseller
              </label>
              <label>Description
                <textarea value={formData.description} onChange={e => handleFormChange('description', e.target.value)} rows={3} className="admin-products__input admin-products__input--textarea" />
              </label>
              <label>Image URL
                <input value={formData.image} onChange={e => handleFormChange('image', e.target.value)} className="admin-products__input" />
              </label>
            </div>
            
            {/* Product-level Discount */}
            <div className="admin-products__weights-section" style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h3 className="admin-products__weights-title">Product Discount (applies to all weights if not overridden)</h3>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={formData.isDiscountActive}
                    onChange={e => handleFormChange('isDiscountActive', e.target.checked)}
                  />
                  Enable Product Discount
                </label>
                {formData.isDiscountActive && (
                  <>
                    <select
                      value={formData.discountType}
                      onChange={e => handleFormChange('discountType', e.target.value)}
                      className="admin-products__input"
                      style={{ width: '150px' }}
                    >
                      <option value="">Select Type</option>
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed (₹)</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      max={formData.discountType === 'percentage' ? '100' : undefined}
                      step={formData.discountType === 'percentage' ? '1' : '0.01'}
                      value={formData.discountValue}
                      onChange={e => handleFormChange('discountValue', e.target.value)}
                      placeholder={formData.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 50'}
                      className="admin-products__input"
                      style={{ width: '120px' }}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="admin-products__weights-section">
              <h3 className="admin-products__weights-title">Weights & Pricing (g/₹/stock)</h3>
              <div className="admin-products__weights-row">
                {formData.weightOptions.map((w, i) => (
                  <div className="admin-products__weight-box" key={i} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <div className="admin-products__weight-label">{w.weight}g</div>
                    <input
                      className="admin-products__input"
                      type="number"
                      min="0"
                      max="99999"
                      value={w.price}
                      placeholder="Price (₹)"
                      onChange={e => handleWeightChange(i,'price',e.target.value)}
                    />
                    <input
                      className="admin-products__input"
                      type="number"
                      min="0"
                      max="9999"
                      value={w.stock}
                      placeholder="Stock"
                      onChange={e => handleWeightChange(i,'stock',e.target.value)}
                    />
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', marginBottom: '5px' }}>
                        <input
                          type="checkbox"
                          checked={w.isDiscountActive}
                          onChange={e => handleWeightChange(i, 'isDiscountActive', e.target.checked)}
                        />
                        Discount for {w.weight}g
                      </label>
                      {w.isDiscountActive && (
                        <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                          <select
                            value={w.discountType}
                            onChange={e => handleWeightChange(i, 'discountType', e.target.value)}
                            className="admin-products__input"
                            style={{ width: '100px', fontSize: '12px', padding: '4px' }}
                          >
                            <option value="">Type</option>
                            <option value="percentage">%</option>
                            <option value="fixed">₹</option>
                          </select>
                          <input
                            type="number"
                            min="0"
                            max={w.discountType === 'percentage' ? '100' : undefined}
                            step={w.discountType === 'percentage' ? '1' : '0.01'}
                            value={w.discountValue}
                            onChange={e => handleWeightChange(i, 'discountValue', e.target.value)}
                            placeholder={w.discountType === 'percentage' ? 'e.g. 15' : 'e.g. 30'}
                            className="admin-products__input"
                            style={{ width: '80px', fontSize: '12px', padding: '4px' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
              <div className="admin-products__modal-actions">
                <button type="button" className="admin-products__cancel-btn" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-products__save-btn">
                  {editing ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        <div className="admin-products__list">
          {loading ? (
            <div className="admin-products__message admin-products__message--loading">Loading laddus...</div>
          ) : products.length === 0 ? (
            <div className="admin-products__message">No laddus found.</div>
          ) : (
            <table className="admin-products__table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Image</th>
                  <th>Weights/Price/Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.image && <img src={product.image} alt={product.name} className="admin-products__image-thumb" />}</td>
                    <td>
                      <div className="admin-products__weights-list">
                        {(product.weightOptions || []).map(opt => (
                          <div key={opt.weight} className="admin-products__weight-display">
                            <span className="admin-products__weight-value">{opt.weight}g</span>:
                            <span className="admin-products__weight-price">₹{opt.price}</span>
                            <span className="admin-products__weight-stock">({opt.stock} stock)</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleEdit(product)}
                        className="admin-products__edit-btn"
                        disabled={editingLoading}
                      >
                        {editingLoading ? 'Loading...' : 'Edit'}
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="admin-products__delete-btn">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
export default AdminProducts;
