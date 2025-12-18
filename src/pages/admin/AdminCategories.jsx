
import React, { useEffect, useState } from 'react';

import '../../styles/pages/admin-categories.css';
import { categoriesApi } from '../../services/categoriesApi.js';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
// import { apiClient, createHeaders } from '../../services/api.js';

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', image: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoriesApi.getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch categories');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let result;
      if (editingId) {
        result = await categoriesApi.update(editingId, form);
      } else {
        result = await categoriesApi.create(form);
      }
      setForm({ name: '', image: '' });
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      if (err?.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError('Failed to save category');
      }
    }
    setLoading(false);
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, image: cat.image || '' });
    setEditingId(cat._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    setLoading(true);
    try {
      await categoriesApi.delete(id);
      fetchCategories();
    } catch (err) {
      setError('Failed to delete category');
    }
    setLoading(false);
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <>
      <Navbar />
      <div className="admin-categories">
        <div className="admin-categories__header" style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <button
            className="admin-categories__back-btn"
            onClick={handleGoBack}
            style={{ marginRight: 16, background: '#e2e8f0', border: 'none', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontWeight: 500 }}
          >
            ← Back
          </button>
          <h2 style={{ margin: 0, fontSize: '1.7rem', color: '#2d3748' }}>Manage Categories</h2>
        </div>
        <form onSubmit={handleSubmit} className="admin-category-form">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Category Name"
            required
          />
          <input
            type="text"
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="Image URL (https://...)"
          />
          {form.image && (
            <img src={form.image} alt="Preview" style={{ width: 60, height: 60, objectFit: 'cover' }} />
          )}
          <button type="submit" disabled={loading}>
            {editingId ? 'Update' : 'Add'} Category
          </button>
          {editingId && (
            <button type="button" onClick={() => { setForm({ name: '', image: '' }); setEditingId(null); }}>
              Cancel
            </button>
          )}
        </form>
        {error && <div className="error">{typeof error === 'string' ? error : (error?.message || JSON.stringify(error))}</div>}
        <div className="admin-category-list">
          {Array.isArray(categories) && categories.length > 0 ? (
            categories.map((cat) => (
              <div key={cat._id} className="admin-category-item">
                {cat.image && <img src={cat.image} alt={cat.name} style={{ width: 60, height: 60, objectFit: 'cover' }} />}
                <span>{cat.name}</span>
                <button onClick={() => handleEdit(cat)}>Edit</button>
                <button onClick={() => handleDelete(cat._id)}>Delete</button>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: '#888', padding: '16px' }}>
              {loading ? 'Loading categories...' : 'No categories found.'}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AdminCategories;
