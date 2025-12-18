import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import { deliveryChargeApi } from '../../services/deliveryChargeApi.js';
import '../../styles/pages/admin-delivery-charges.css';

const DEFAULT_CHARGE = {
  name: '',
  description: '',
  chargeType: 'fixed',
  fixedAmount: '',
  percentage: '',
  freeDeliveryAbove: '',
  tiers: [],
  minOrderAmount: '',
  maxOrderAmount: '',
  priority: 0,
  isActive: true,
  applicableLocations: []
};

function AdminDeliveryCharges() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editingLoading, setEditingLoading] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_CHARGE);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newTier, setNewTier] = useState({ minAmount: '', maxAmount: '', charge: '' });

  const handleGoBack = () => {
    navigate(-1);
  };

  const fetchCharges = useCallback(async () => {
    setLoading(true);
    try {
      const data = await deliveryChargeApi.getAll();
      setCharges(data);
    } catch (err) {
      setError('Failed to load delivery charges');
      console.error('Fetch delivery charges error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCharges();
  }, [fetchCharges]);

  function handleFormChange(field, value) {
    setFormData(fd => ({ ...fd, [field]: value }));
  }

  function handleAddTier() {
    if (!newTier.minAmount || !newTier.charge) {
      setError('Min amount and charge are required for tier');
      return;
    }
    if (newTier.maxAmount && Number(newTier.maxAmount) <= Number(newTier.minAmount)) {
      setError('Max amount must be greater than min amount');
      return;
    }
    setFormData(fd => ({
      ...fd,
      tiers: [...fd.tiers, {
        minAmount: Number(newTier.minAmount),
        maxAmount: newTier.maxAmount ? Number(newTier.maxAmount) : null,
        charge: Number(newTier.charge)
      }]
    }));
    setNewTier({ minAmount: '', maxAmount: '', charge: '' });
    setError('');
  }

  function handleRemoveTier(index) {
    setFormData(fd => ({
      ...fd,
      tiers: fd.tiers.filter((_, i) => i !== index)
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.chargeType) {
      setError('Charge type is required');
      return;
    }

    // Type-specific validation
    if (formData.chargeType === 'fixed' && (!formData.fixedAmount || formData.fixedAmount < 0)) {
      setError('Fixed amount is required and must be >= 0');
      return;
    }
    if (formData.chargeType === 'percentage' && (!formData.percentage || formData.percentage < 0 || formData.percentage > 100)) {
      setError('Percentage must be between 0 and 100');
      return;
    }
    if (formData.chargeType === 'free_above' && (!formData.freeDeliveryAbove || formData.freeDeliveryAbove < 0)) {
      setError('Free delivery above amount is required');
      return;
    }
    if (formData.chargeType === 'tiered' && formData.tiers.length === 0) {
      setError('At least one tier is required for tiered charge type');
      return;
    }

    try {
      const submitData = {
        ...formData,
        fixedAmount: formData.chargeType === 'fixed' ? Number(formData.fixedAmount) : 0,
        percentage: formData.chargeType === 'percentage' ? Number(formData.percentage) : 0,
        freeDeliveryAbove: formData.chargeType === 'free_above' ? Number(formData.freeDeliveryAbove) : 0,
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
        maxOrderAmount: formData.maxOrderAmount ? Number(formData.maxOrderAmount) : null,
        priority: Number(formData.priority) || 0
      };

      if (editing) {
        await deliveryChargeApi.update(editing, submitData);
        setSuccess('Delivery charge updated!');
      } else {
        await deliveryChargeApi.create(submitData);
        setSuccess('Delivery charge created!');
      }
      setShowForm(false);
      setEditing(null);
      setFormData(DEFAULT_CHARGE);
      fetchCharges();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save delivery charge');
    }
  }

  async function handleEdit(charge) {
    setEditingLoading(true);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Small delay to show loading state and allow scroll
    await new Promise(resolve => setTimeout(resolve, 300));

    setEditing(charge._id);
    setShowForm(true);
    setError('');
    setSuccess('');
    setFormData({
      name: charge.name,
      description: charge.description || '',
      chargeType: charge.chargeType,
      fixedAmount: charge.fixedAmount || '',
      percentage: charge.percentage || '',
      freeDeliveryAbove: charge.freeDeliveryAbove || '',
      tiers: charge.tiers || [],
      minOrderAmount: charge.minOrderAmount || '',
      maxOrderAmount: charge.maxOrderAmount || '',
      priority: charge.priority || 0,
      isActive: charge.isActive,
      applicableLocations: charge.applicableLocations || []
    });

    setEditingLoading(false);
  }

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Delete this delivery charge?')) return;
    try {
      await deliveryChargeApi.delete(id);
      fetchCharges();
    } catch (err) {
      setError('Failed to delete delivery charge');
      console.error('Delete delivery charge error:', err);
    }
  }, [fetchCharges]);

  const toggleActive = useCallback(async (id) => {
    try {
      await deliveryChargeApi.toggleActive(id);
      fetchCharges();
    } catch (err) {
      setError('Failed to update delivery charge status');
      console.error('Toggle active error:', err);
    }
  }, [fetchCharges]);

  if (!user?.isAdmin) {
    return (
      <div>
        <Navbar />
        <div className="admin-delivery-charges__message">Access Denied</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="admin-delivery-charges">
      <Navbar />
      <div className="admin-delivery-charges__container">
        <header className="admin-delivery-charges__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button
              onClick={handleGoBack}
              className="admin-delivery-charges__back-button"
            >
              ← Back
            </button>
            <h1 className="admin-delivery-charges__title" style={{ margin: 0 }}>Manage Delivery Charges</h1>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditing(null);
              setError('');
              setSuccess('');
              setFormData(DEFAULT_CHARGE);
            }}
            className="admin-delivery-charges__add-button"
          >
            {showForm ? 'Cancel' : '+ Add New Delivery Charge'}
          </button>
        </header>

        {showForm && (
          <form onSubmit={handleSubmit} className="admin-delivery-charges__form">
            <h2 className="admin-delivery-charges__form-title">
              {editing ? 'Edit' : 'Create'} Delivery Charge
            </h2>
            {error && (
              <div className="admin-delivery-charges__error">{error}</div>
            )}
            {success && (
              <div className="admin-delivery-charges__success">{success}</div>
            )}

            <div className="admin-delivery-charges__form-group">
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                required
                placeholder="e.g., Standard Delivery"
              />
            </div>

            <div className="admin-delivery-charges__form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Optional description"
                rows="3"
              />
            </div>

            <div className="admin-delivery-charges__form-group">
              <label>Charge Type *</label>
              <select
                value={formData.chargeType}
                onChange={(e) => handleFormChange('chargeType', e.target.value)}
                required
              >
                <option value="fixed">Fixed Amount</option>
                <option value="percentage">Percentage of Order</option>
                <option value="free_above">Free Above Amount</option>
                <option value="tiered">Tiered (Based on Order Amount)</option>
              </select>
            </div>

            {formData.chargeType === 'fixed' && (
              <div className="admin-delivery-charges__form-group">
                <label>Fixed Amount (₹) *</label>
                <input
                  type="number"
                  value={formData.fixedAmount}
                  onChange={(e) => handleFormChange('fixedAmount', e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  placeholder="50"
                />
              </div>
            )}

            {formData.chargeType === 'percentage' && (
              <div className="admin-delivery-charges__form-group">
                <label>Percentage (%) *</label>
                <input
                  type="number"
                  value={formData.percentage}
                  onChange={(e) => handleFormChange('percentage', e.target.value)}
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="5"
                />
              </div>
            )}

            {formData.chargeType === 'free_above' && (
              <div className="admin-delivery-charges__form-group">
                <label>Free Delivery Above (₹) *</label>
                <input
                  type="number"
                  value={formData.freeDeliveryAbove}
                  onChange={(e) => handleFormChange('freeDeliveryAbove', e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  placeholder="500"
                />
                <small>Orders above this amount will have free delivery</small>
              </div>
            )}

            {formData.chargeType === 'tiered' && (
              <div className="admin-delivery-charges__form-group">
                <label>Tiers *</label>
                <div className="admin-delivery-charges__tier-inputs">
                  <input
                    type="number"
                    value={newTier.minAmount}
                    onChange={(e) => setNewTier({ ...newTier, minAmount: e.target.value })}
                    placeholder="Min Amount"
                    min="0"
                    step="0.01"
                  />
                  <input
                    type="number"
                    value={newTier.maxAmount}
                    onChange={(e) => setNewTier({ ...newTier, maxAmount: e.target.value })}
                    placeholder="Max Amount (optional)"
                    min="0"
                    step="0.01"
                  />
                  <input
                    type="number"
                    value={newTier.charge}
                    onChange={(e) => setNewTier({ ...newTier, charge: e.target.value })}
                    placeholder="Charge (₹)"
                    min="0"
                    step="0.01"
                  />
                  <button type="button" onClick={handleAddTier} className="admin-delivery-charges__add-tier-button">
                    Add Tier
                  </button>
                </div>
                {formData.tiers.length > 0 && (
                  <div className="admin-delivery-charges__tiers-list">
                    {formData.tiers.map((tier, idx) => (
                      <div key={idx} className="admin-delivery-charges__tier-item">
                        <span>₹{tier.minAmount} - {tier.maxAmount ? `₹${tier.maxAmount}` : 'Above'}: ₹{tier.charge}</span>
                        <button type="button" onClick={() => handleRemoveTier(idx)} className="admin-delivery-charges__remove-tier-button">
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="admin-delivery-charges__form-group">
              <label>Minimum Order Amount (₹)</label>
              <input
                type="number"
                value={formData.minOrderAmount}
                onChange={(e) => handleFormChange('minOrderAmount', e.target.value)}
                min="0"
                step="0.01"
                placeholder="0"
              />
              <small>This rule applies only if order amount is &gt;= this value</small>
            </div>

            <div className="admin-delivery-charges__form-group">
              <label>Maximum Order Amount (₹)</label>
              <input
                type="number"
                value={formData.maxOrderAmount}
                onChange={(e) => handleFormChange('maxOrderAmount', e.target.value)}
                min="0"
                step="0.01"
                placeholder="Leave empty for no limit"
              />
              <small>This rule applies only if order amount is less than or equal to this value (if set)</small>
            </div>

            <div className="admin-delivery-charges__form-group">
              <label>Priority</label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => handleFormChange('priority', e.target.value)}
                min="0"
                placeholder="0"
              />
              <small>Lower number = higher priority. Rules are evaluated in priority order.</small>
            </div>

            <div className="admin-delivery-charges__form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleFormChange('isActive', e.target.checked)}
                />
                Active
              </label>
            </div>

            <button type="submit" className="admin-delivery-charges__submit-button">
              {editing ? 'Update' : 'Create'} Delivery Charge
            </button>
          </form>
        )}

        {loading ? (
          <div className="admin-delivery-charges__loading">Loading...</div>
        ) : (
          <div className="admin-delivery-charges__list">
            {charges.length === 0 ? (
              <div className="admin-delivery-charges__empty">No delivery charges found</div>
            ) : (
              <table className="admin-delivery-charges__table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Amount/Value</th>
                    <th>Order Range</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {charges.map((charge) => (
                    <tr key={charge._id}>
                      <td>{charge.name}</td>
                      <td>{charge.chargeType}</td>
                      <td>
                        {charge.chargeType === 'fixed' && `₹${charge.fixedAmount}`}
                        {charge.chargeType === 'percentage' && `${charge.percentage}%`}
                        {charge.chargeType === 'free_above' && `Free above ₹${charge.freeDeliveryAbove}`}
                        {charge.chargeType === 'tiered' && `${charge.tiers.length} tiers`}
                      </td>
                      <td>
                        ₹{charge.minOrderAmount}
                        {charge.maxOrderAmount ? ` - ₹${charge.maxOrderAmount}` : '+'}
                      </td>
                      <td>{charge.priority}</td>
                      <td>
                        <span className={charge.isActive ? 'admin-delivery-charges__status--active' : 'admin-delivery-charges__status--inactive'}>
                          {charge.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleEdit(charge)}
                          className="admin-delivery-charges__edit-button"
                          disabled={editingLoading}
                        >
                          {editingLoading ? 'Loading...' : 'Edit'}
                        </button>
                        <button onClick={() => toggleActive(charge._id)} className="admin-delivery-charges__toggle-button">
                          {charge.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDelete(charge._id)} className="admin-delivery-charges__delete-button">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default AdminDeliveryCharges;

