import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext.jsx';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import { API_URL } from '../../config/api.js';
import '../../styles/pages/admin-products.css'; // NEW CSS (to create)

const DEFAULT_WEIGHTS = [
  { weight: 250, price: '', stock: '' },
  { weight: 500, price: '', stock: '' },
  { weight: 1000, price: '', stock: '' },
];
const DEFAULT_PRODUCT = {
  name: '',
  description: '',
  basePrice: '',
  image: '',
  category: '',
  weightOptions: DEFAULT_WEIGHTS,
};

function AdminProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_PRODUCT);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/products`);
      setProducts(data);
    } catch (err) {
      setError('Failed to load products');
    }
    setLoading(false);
  }

  function handleWeightChange(idx, field, value) {
    setFormData(fd => {
      const updated = fd.weightOptions.map((w, i) =>
        i === idx ? { ...w, [field]: value } : w
      );
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
      const token = localStorage.getItem('token');
      const submitData = {
        ...formData,
        basePrice: formData.weightOptions[0].price,
        weightOptions: formData.weightOptions.filter(w => w.price),
      };
      if (editing) {
        await axios.put(
          `${API_URL}/api/products/${editing}`,
          submitData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Product updated!');
      } else {
        await axios.post(
          `${API_URL}/api/products`,
          submitData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Product created!');
      }
      setShowForm(false);
      setEditing(null);
      setFormData(DEFAULT_PRODUCT);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    }
  }

  function handleEdit(product) {
    setEditing(product._id);
    setShowForm(true);
    setFormData({
      name: product.name,
      description: product.description,
      basePrice: product.basePrice,
      image: product.image || '',
      category: product.category || '',
      weightOptions: [250,500,1000].map(w =>
        (product.weightOptions || []).find(opt => opt.weight === w) || { weight: w, price: '', stock: '' }
      ),
    });
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this product?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
    } catch {
      setError('Failed to delete product');
    }
  }

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
          <h1 className="admin-products__title">Manage Nutri Laddus</h1>
          <button
            className="admin-products__add-btn"
            onClick={() => {
              setShowForm(!showForm);
              setEditing(null);
              setError('');
              setSuccess('');
              setFormData(DEFAULT_PRODUCT);
            }}
          >
            {showForm ? 'Cancel' : '+ Add New Laddu'}
          </button>
        </header>

        {showForm && (
          <form className="admin-products__form" onSubmit={handleSubmit}>
            <h2 className="admin-products__form-title">{editing ? 'Edit' : 'Add'} Laddu</h2>
            {!!error && <div className="admin-products__form-error">{error}</div>}
            {!!success && <div className="admin-products__form-success">{success}</div>}
            <div className="admin-products__form-fields">
              <label>Name*
                <input value={formData.name} onChange={e => handleFormChange('name', e.target.value)} required className="admin-products__input" />
              </label>
              <label>Category*
                <input value={formData.category} onChange={e => handleFormChange('category', e.target.value)} required className="admin-products__input" placeholder="e.g. Dry Fruit Laddus" />
              </label>
              <label>Description
                <textarea value={formData.description} onChange={e => handleFormChange('description', e.target.value)} rows={3} className="admin-products__input admin-products__input--textarea" />
              </label>
              <label>Image URL
                <input value={formData.image} onChange={e => handleFormChange('image', e.target.value)} className="admin-products__input" />
              </label>
            </div>
            <div className="admin-products__weights-section">
              <h3 className="admin-products__weights-title">Weights & Pricing (g/₹/stock)</h3>
              <div className="admin-products__weights-row">
                {formData.weightOptions.map((w, i) => (
                  <div className="admin-products__weight-box" key={i}>
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
                  </div>
                ))}
              </div>
            </div>
            <button type="submit" className="admin-products__save-btn">
              {editing ? 'Update' : 'Create'} Laddu
            </button>
          </form>
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
                      <button onClick={() => handleEdit(product)} className="admin-products__edit-btn">Edit</button>
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
