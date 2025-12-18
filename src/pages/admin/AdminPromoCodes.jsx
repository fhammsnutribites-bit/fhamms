import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import { promoCodeApi } from '../../services/promoCodeApi.js';

const DEFAULT_PROMO = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  minOrderAmount: '',
  maxDiscountAmount: '',
  startDate: '',
  endDate: '',
  isActive: true,
  usageLimit: ''
};

function AdminPromoCodes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editingLoading, setEditingLoading] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_PROMO);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGoBack = () => {
    navigate(-1);
  };



  const fetchPromoCodes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await promoCodeApi.getAll();
      setPromoCodes(data);
    } catch (err) {
      setError('Failed to load promo codes');
      console.error('Fetch promo codes error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleFormChange(field, value) {
    setFormData(fd => ({ ...fd, [field]: value }));
  }
  useEffect(() => {
    fetchPromoCodes();
  }, [fetchPromoCodes]);
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.code.trim()) {
      setError('Promo code is required');
      return;
    }
    if (!formData.discountType || !formData.discountValue) {
      setError('Discount type and value are required');
      return;
    }
    if (formData.discountType === 'percentage' && (formData.discountValue < 0 || formData.discountValue > 100)) {
      setError('Percentage discount must be between 0 and 100');
      return;
    }
    if (formData.discountType === 'fixed' && formData.discountValue < 0) {
      setError('Fixed discount must be positive');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      setError('Start date and end date are required');
      return;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('End date must be after start date');
      return;
    }

    try {
      const submitData = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : undefined,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined
      };

      if (editing) {
        await promoCodeApi.update(editing, submitData);
        setSuccess('Promo code updated!');
      } else {
        await promoCodeApi.create(submitData);
        setSuccess('Promo code created!');
      }
      setShowForm(false);
      setEditing(null);
      setFormData(DEFAULT_PROMO);
      fetchPromoCodes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save promo code');
    }
  }

  async function handleEdit(promoCode) {
    setEditingLoading(true);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Small delay to show loading state and allow scroll
    await new Promise(resolve => setTimeout(resolve, 300));

    setEditing(promoCode._id);
    setShowForm(true);
    setError('');
    setSuccess('');
    setFormData({
      code: promoCode.code,
      description: promoCode.description || '',
      discountType: promoCode.discountType,
      discountValue: promoCode.discountValue,
      minOrderAmount: promoCode.minOrderAmount || '',
      maxDiscountAmount: promoCode.maxDiscountAmount || '',
      startDate: promoCode.startDate ? new Date(promoCode.startDate).toISOString().split('T')[0] : '',
      endDate: promoCode.endDate ? new Date(promoCode.endDate).toISOString().split('T')[0] : '',
      isActive: promoCode.isActive,
      usageLimit: promoCode.usageLimit || ''
    });

    setEditingLoading(false);
  }

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Delete this promo code?')) return;
    try {
      await promoCodeApi.delete(id);
      fetchPromoCodes();
    } catch (err) {
      setError('Failed to delete promo code');
      console.error('Delete promo code error:', err);
    }
  }, [fetchPromoCodes]);

  const toggleActive = useCallback(async (id, currentStatus) => {
    try {
      await promoCodeApi.toggleActive(id, !currentStatus);
      fetchPromoCodes();
    } catch (err) {
      setError('Failed to update promo code status');
      console.error('Toggle active error:', err);
    }
  }, [fetchPromoCodes]);

  if (!user?.isAdmin) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: 40, textAlign: 'center' }}>Access Denied</div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%', flex: 1 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button
              onClick={handleGoBack}
              style={{
                background: '#f8f9fa',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#666',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#e8f5e9';
                e.target.style.borderColor = '#4caf50';
                e.target.style.color = '#2e7d32';
              }}
              onMouseOut={(e) => {
                e.target.style.background = '#f8f9fa';
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.color = '#666';
              }}
            >
              ← Back
            </button>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>Manage Promo Codes</h1>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditing(null);
              setError('');
              setSuccess('');
              setFormData(DEFAULT_PROMO);
            }}
            style={{
              padding: '10px 20px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            {showForm ? 'Cancel' : '+ Add New Promo Code'}
          </button>
        </header>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={{
              background: '#f8f9fa',
              padding: '30px',
              borderRadius: '8px',
              marginBottom: '30px',
              border: '1px solid #dee2e6'
            }}
          >
            <h2 style={{ marginBottom: '20px', fontSize: '22px' }}>
              {editing ? 'Edit' : 'Create'} Promo Code
            </h2>
            {error && (
              <div style={{ padding: '10px', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '15px' }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ padding: '10px', background: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '15px' }}>
                {success}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Promo Code * <span style={{ fontSize: '12px', color: '#666' }}>(will be converted to uppercase)</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={e => handleFormChange('code', e.target.value.toUpperCase())}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  placeholder="e.g. SAVE20"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => handleFormChange('description', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  placeholder="e.g. 20% off on all orders"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Discount Type *</label>
                <select
                  value={formData.discountType}
                  onChange={e => handleFormChange('discountType', e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Discount Value * 
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    ({formData.discountType === 'percentage' ? '0-100%' : '₹ amount'})
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={e => handleFormChange('discountValue', e.target.value)}
                  required
                  min="0"
                  max={formData.discountType === 'percentage' ? '100' : undefined}
                  step={formData.discountType === 'percentage' ? '1' : '0.01'}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  placeholder={formData.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 100'}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Minimum Order Amount (₹)</label>
                <input
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={e => handleFormChange('minOrderAmount', e.target.value)}
                  min="0"
                  step="0.01"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  placeholder="e.g. 500 (optional)"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Max Discount Amount (₹) 
                  <span style={{ fontSize: '12px', color: '#666' }}>(for percentage only)</span>
                </label>
                <input
                  type="number"
                  value={formData.maxDiscountAmount}
                  onChange={e => handleFormChange('maxDiscountAmount', e.target.value)}
                  min="0"
                  step="0.01"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  placeholder="e.g. 500 (optional)"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Start Date *</label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={e => handleFormChange('startDate', e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>End Date *</label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={e => handleFormChange('endDate', e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Usage Limit</label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={e => handleFormChange('usageLimit', e.target.value)}
                  min="0"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  placeholder="e.g. 100 (optional, leave empty for unlimited)"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={e => handleFormChange('isActive', e.target.checked)}
                  style={{ width: '20px', height: '20px' }}
                />
                <label htmlFor="isActive" style={{ fontWeight: '500', cursor: 'pointer' }}>
                  Active (promo code is currently active)
                </label>
              </div>
            </div>

            <button
              type="submit"
              style={{
                padding: '12px 24px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              {editing ? 'Update Promo Code' : 'Create Promo Code'}
            </button>
          </form>
        )}

        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading promo codes...</div>
          ) : promoCodes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>No promo codes found. Create your first one!</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Code</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Description</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Discount</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Min Order</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Valid Period</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Usage</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {promoCodes.map(pc => {
                    const now = new Date();
                    const startDate = new Date(pc.startDate);
                    const endDate = new Date(pc.endDate);
                    const isExpired = now > endDate;
                    const notStarted = now < startDate;
                    const isValid = !isExpired && !notStarted && pc.isActive;

                    return (
                      <tr key={pc._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{pc.code}</td>
                        <td style={{ padding: '12px' }}>{pc.description || '-'}</td>
                        <td style={{ padding: '12px' }}>
                          {pc.discountType === 'percentage' 
                            ? `${pc.discountValue}%` 
                            : `₹${pc.discountValue}`}
                          {pc.maxDiscountAmount && pc.discountType === 'percentage' && (
                            <span style={{ fontSize: '12px', color: '#666' }}> (max ₹{pc.maxDiscountAmount})</span>
                          )}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {pc.minOrderAmount ? `₹${pc.minOrderAmount}` : 'No minimum'}
                        </td>
                        <td style={{ padding: '12px', fontSize: '13px' }}>
                          <div>{new Date(pc.startDate).toLocaleDateString()}</div>
                          <div style={{ color: '#666' }}>to {new Date(pc.endDate).toLocaleDateString()}</div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {pc.usedCount || 0} / {pc.usageLimit || '∞'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {!pc.isActive ? (
                            <span style={{ color: '#dc3545', fontWeight: '500' }}>Inactive</span>
                          ) : isExpired ? (
                            <span style={{ color: '#dc3545', fontWeight: '500' }}>Expired</span>
                          ) : notStarted ? (
                            <span style={{ color: '#ffc107', fontWeight: '500' }}>Not Started</span>
                          ) : (
                            <span style={{ color: '#28a745', fontWeight: '500' }}>Active</span>
                          )}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleEdit(pc)}
                              disabled={editingLoading}
                              style={{
                                padding: '6px 12px',
                                background: editingLoading ? '#6c757d' : '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: editingLoading ? 'not-allowed' : 'pointer',
                                fontSize: '13px'
                              }}
                            >
                              {editingLoading ? 'Loading...' : 'Edit'}
                            </button>
                            <button
                              onClick={() => toggleActive(pc._id, pc.isActive)}
                              style={{
                                padding: '6px 12px',
                                background: pc.isActive ? '#ffc107' : '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '13px'
                              }}
                            >
                              {pc.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDelete(pc._id)}
                              style={{
                                padding: '6px 12px',
                                background: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '13px'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default AdminPromoCodes;

