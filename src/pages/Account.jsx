import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Loader from '../components/Loader.jsx';
import { usersApi } from '../services/usersApi.js';
import { addressApi } from '../services/addressApi.js';

function Account() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({});
  
  // Profile form
  const [profileForm, setProfileForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  
  // Address form
  const [addressForm, setAddressForm] = useState({
    label: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: '',
    isDefault: false
  });
  const [editingAddressIdx, setEditingAddressIdx] = useState(null);
  const [addressError, setAddressError] = useState('');
  const [addressSuccess, setAddressSuccess] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [validatingPincode, setValidatingPincode] = useState(false);
  const [isPincodeValid, setIsPincodeValid] = useState(false);
  
  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    type: 'card',
    cardLast4: '',
    brand: 'visa',
    isDefault: false
  });
  const [editingPaymentIdx, setEditingPaymentIdx] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setUserData({});
      return;
    }
    try {
      const data = await usersApi.getProfile();
      setUserData(data && typeof data === 'object' ? data : {});
      setProfileForm({ name: data?.name || '', email: data?.email || '', password: '', confirmPassword: '' });
    } catch (err) {
      console.error('Failed to load user data:', err);
      setUserData({});
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    
    if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
      setProfileError('Passwords do not match');
      return;
    }
    
    try {
      const updateData = { name: profileForm.name, email: profileForm.email };
      if (profileForm.password) updateData.password = profileForm.password;
      
      const data = await usersApi.updateProfile(updateData);
      setUserData(data);
      setProfileForm({ ...profileForm, password: '', confirmPassword: '' });
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddressError('');
    setAddressSuccess('');
    
    if (!addressForm.addressLine1 || !addressForm.city || !addressForm.state || !addressForm.zip) {
      setAddressError('Please fill in all required fields (Address, City, State, and Pincode)');
      return;
    }
    
    // Validate pincode format
    if (!addressApi.validatePincodeFormat(addressForm.zip)) {
      setAddressError('Please enter a valid 6-digit Indian pincode');
      return;
    }
    
    // Check if pincode is validated and city/state are populated
    if (!isPincodeValid || !addressForm.city || !addressForm.state) {
      setAddressError('Please wait for pincode validation to complete. City and State must be auto-populated from a valid pincode.');
      return;
    }
    
    // Check if pincode validation is in progress
    if (validatingPincode) {
      setAddressError('Please wait for pincode validation to complete.');
      return;
    }
    
    try {
      if (editingAddressIdx !== null) {
        await usersApi.updateAddress(editingAddressIdx, addressForm);
        setAddressSuccess('Address updated successfully!');
      } else {
        await usersApi.addAddress(addressForm);
        setAddressSuccess('Address added successfully!');
      }
      await fetchUserData();
      setAddressForm({
        label: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zip: '',
        country: 'India',
        phone: '',
        isDefault: false
      });
      setPincodeError('');
      setEditingAddressIdx(null);
      setTimeout(() => setAddressSuccess(''), 3000);
    } catch (err) {
      setAddressError(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handleEditAddress = (idx) => {
    const addr = userData.addresses[idx];
    setAddressForm({ ...addr });
    setEditingAddressIdx(idx);
    setActiveTab('addresses');
    setPincodeError('');
    // If editing existing address with valid pincode, mark as valid
    if (addr.zip && addr.zip.length === 6 && addr.city && addr.state) {
      setIsPincodeValid(true);
    } else {
      setIsPincodeValid(false);
    }
  };

  const handlePincodeChange = useCallback(async (pincode) => {
    // Validate format first
    if (!addressApi.validatePincodeFormat(pincode)) {
      setPincodeError('Invalid pincode format. Please enter a valid 6-digit Indian pincode.');
      setAddressForm(prev => ({...prev, city: '', state: ''}));
      setIsPincodeValid(false);
      return;
    }

    setValidatingPincode(true);
    setPincodeError('');
    setIsPincodeValid(false);

    try {
      const result = await addressApi.getAddressByPincode(pincode);
      
      if (result.success) {
        setAddressForm(prev => ({
          ...prev,
          city: result.city || '',
          state: result.state || '',
          country: result.country || 'India'
        }));
        setPincodeError('');
        setIsPincodeValid(true);
      } else {
        setPincodeError(result.message || 'Invalid pincode. Please enter a valid Indian pincode.');
        setAddressForm(prev => ({...prev, city: '', state: ''}));
        setIsPincodeValid(false);
      }
    } catch (err) {
      console.error('Pincode validation error:', err);
      setPincodeError('Failed to validate pincode. Please try again.');
      setAddressForm(prev => ({...prev, city: '', state: ''}));
      setIsPincodeValid(false);
    } finally {
      setValidatingPincode(false);
    }
  }, []);

  const handleDeleteAddress = async (idx) => {
    if (!confirm('Delete this address?')) return;
    try {
      await usersApi.deleteAddress(idx);
      await fetchUserData();
    } catch (err) {
      alert('Failed to delete address');
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    setPaymentError('');
    setPaymentSuccess('');
    
    if (!paymentForm.cardLast4 || paymentForm.cardLast4.length !== 4) {
      setPaymentError('Please enter last 4 digits of card');
      return;
    }
    
    try {
      if (editingPaymentIdx !== null) {
        await usersApi.updatePaymentMethod(editingPaymentIdx, paymentForm);
        setPaymentSuccess('Payment method updated successfully!');
      } else {
        await usersApi.addPaymentMethod(paymentForm);
        setPaymentSuccess('Payment method added successfully!');
      }
      await fetchUserData();
      setPaymentForm({ type: 'card', cardLast4: '', brand: 'visa', isDefault: false });
      setEditingPaymentIdx(null);
      setTimeout(() => setPaymentSuccess(''), 3000);
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Failed to save payment method');
    }
  };

  const handleEditPayment = (idx) => {
    const pm = userData.paymentMethods[idx];
    setPaymentForm({ ...pm });
    setEditingPaymentIdx(idx);
    setActiveTab('payments');
  };

  const handleDeletePayment = async (idx) => {
    if (!confirm('Delete this payment method?')) return;
    try {
      await usersApi.deletePaymentMethod(idx);
      await fetchUserData();
    } catch (err) {
      alert('Failed to delete payment method');
    }
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
          <h2 style={{ fontSize: '28px', color: '#333', marginBottom: '15px' }}>
            Please Login to Access Account
          </h2>
          <p style={{ fontSize: '16px', color: '#666' }}>
            You need to be logged in to manage your account.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return <Loader fullPage />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{
          fontSize: '42px',
          fontWeight: 'bold',
          color: '#1b5e20',
          marginBottom: '40px'
        }}>
          My Account
        </h1>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '30px',
          borderBottom: '2px solid #e0e0e0'
        }}>
          {['profile', 'addresses', 'payments'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '3px solid #4caf50' : '3px solid transparent',
                color: activeTab === tab ? '#4caf50' : '#666',
                fontWeight: activeTab === tab ? '600' : '500',
                fontSize: '16px',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.3s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{ fontSize: '24px', marginBottom: '30px', color: '#333' }}>
              Edit Profile
            </h2>
            {profileError && (
              <div style={{
                padding: '12px',
                background: '#ffebee',
                color: '#c62828',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div style={{
                padding: '12px',
                background: '#e8f5e9',
                color: '#2e7d32',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                {profileSuccess}
              </div>
            )}
            <form onSubmit={handleProfileUpdate}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={profileForm.password}
                  onChange={e => setProfileForm({ ...profileForm, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={profileForm.confirmPassword}
                  onChange={e => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '14px 32px',
                  background: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#45a049';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#4caf50';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Update Profile
              </button>
            </form>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '40px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              marginBottom: '30px'
            }}>
              <h2 style={{ fontSize: '24px', marginBottom: '30px', color: '#333' }}>
                {editingAddressIdx !== null ? 'Edit Address' : 'Add New Address'}
              </h2>
              {addressError && (
                <div style={{
                  padding: '12px',
                  background: '#ffebee',
                  color: '#c62828',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  {addressError}
                </div>
              )}
              {addressSuccess && (
                <div style={{
                  padding: '12px',
                  background: '#e8f5e9',
                  color: '#2e7d32',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  {addressSuccess}
                </div>
              )}
              <form onSubmit={handleAddAddress}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                      Label (e.g., Home, Work)
                    </label>
                    <input
                      type="text"
                      value={addressForm.label}
                      onChange={e => setAddressForm({ ...addressForm, label: e.target.value })}
                      placeholder="Home"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={addressForm.phone}
                      onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    value={addressForm.addressLine1}
                    onChange={e => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={addressForm.addressLine2}
                    onChange={e => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    value={addressForm.zip}
                    onChange={e => {
                      const value = e.target.value.replace(/\D/g, ''); // Only numbers
                      setAddressForm({...addressForm, zip: value});
                      setPincodeError('');
                      setIsPincodeValid(false);
                      
                      // Validate and fetch city/state when 6 digits entered
                      if (value.length === 6) {
                        handlePincodeChange(value);
                      } else if (value.length < 6) {
                        // Clear city/state if pincode is incomplete
                        setAddressForm(prev => ({...prev, city: '', state: ''}));
                        setIsPincodeValid(false);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: pincodeError ? '2px solid #dc3545' : '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                    placeholder="Enter 6-digit pincode"
                  />
                  {validatingPincode && (
                    <small style={{ display: 'block', color: '#007bff', fontSize: '12px', marginTop: '5px' }}>
                      Validating pincode...
                    </small>
                  )}
                  {pincodeError && (
                    <div style={{
                      display: 'block',
                      color: '#dc3545',
                      fontSize: '12px',
                      marginTop: '5px',
                      padding: '5px',
                      background: '#f8d7da',
                      borderRadius: '4px'
                    }}>
                      {pincodeError}
                    </div>
                  )}
                  {addressForm.zip.length === 6 && !pincodeError && !validatingPincode && addressForm.city && (
                    <small style={{ display: 'block', color: '#28a745', fontSize: '12px', marginTop: '5px', fontWeight: '500' }}>
                      ✓ City and State auto-filled
                    </small>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                      City *
                    </label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                      required
                      readOnly={addressForm.zip.length === 6 && addressForm.city ? true : false}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '16px',
                        backgroundColor: addressForm.zip.length === 6 && addressForm.city ? '#f0f0f0' : 'white',
                        cursor: addressForm.zip.length === 6 && addressForm.city ? 'not-allowed' : 'text'
                      }}
                    />
                    {addressForm.zip.length === 6 && addressForm.city && (
                      <small style={{ display: 'block', color: '#666', fontSize: '11px', marginTop: '5px', fontStyle: 'italic' }}>
                        Auto-filled from pincode
                      </small>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                      State *
                    </label>
                    <input
                      type="text"
                      value={addressForm.state}
                      onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                      required
                      readOnly={addressForm.zip.length === 6 && addressForm.state ? true : false}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '16px',
                        backgroundColor: addressForm.zip.length === 6 && addressForm.state ? '#f0f0f0' : 'white',
                        cursor: addressForm.zip.length === 6 && addressForm.state ? 'not-allowed' : 'text'
                      }}
                    />
                    {addressForm.zip.length === 6 && addressForm.state && (
                      <small style={{ display: 'block', color: '#666', fontSize: '11px', marginTop: '5px', fontStyle: 'italic' }}>
                        Auto-filled from pincode
                      </small>
                    )}
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                    Country
                  </label>
                  <input
                    type="text"
                    value={addressForm.country}
                    onChange={e => setAddressForm({ ...addressForm, country: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <label style={{ fontWeight: '600', color: '#333' }}>
                    Set as default address
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button
                    type="submit"
                    disabled={!isPincodeValid || validatingPincode || !addressForm.city || !addressForm.state || addressForm.zip.length !== 6}
                    style={{
                      padding: '14px 32px',
                      background: (!isPincodeValid || validatingPincode || !addressForm.city || !addressForm.state || addressForm.zip.length !== 6) ? '#ccc' : '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50px',
                      fontWeight: '600',
                      fontSize: '16px',
                      cursor: (!isPincodeValid || validatingPincode || !addressForm.city || !addressForm.state || addressForm.zip.length !== 6) ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s',
                      opacity: (!isPincodeValid || validatingPincode || !addressForm.city || !addressForm.state || addressForm.zip.length !== 6) ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!e.target.disabled) {
                        e.target.style.background = '#45a049';
                        e.target.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!e.target.disabled) {
                        e.target.style.background = '#4caf50';
                        e.target.style.transform = 'translateY(0)';
                      }
                    }}
                    title={(!isPincodeValid || validatingPincode || !addressForm.city || !addressForm.state || addressForm.zip.length !== 6) ? 'Please complete pincode validation and ensure city/state are populated' : ''}
                  >
                    {editingAddressIdx !== null ? 'Update Address' : 'Add Address'}
                  </button>
                  {editingAddressIdx !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAddressIdx(null);
                        setAddressForm({
                          label: '',
                          addressLine1: '',
                          addressLine2: '',
                          city: '',
                          state: '',
                          zip: '',
                          country: 'India',
                          phone: '',
                          isDefault: false
                        });
                        setPincodeError('');
                      }}
                      style={{
                        padding: '14px 32px',
                        background: '#f5f5f5',
                        color: '#666',
                        border: 'none',
                        borderRadius: '50px',
                        fontWeight: '600',
                        fontSize: '16px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Saved Addresses */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '40px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
            }}>
              <h2 style={{ fontSize: '24px', marginBottom: '30px', color: '#333' }}>
                Saved Addresses
              </h2>
              {!userData?.addresses || userData.addresses.length === 0 ? (
                <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>
                  No saved addresses. Add one above!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {userData.addresses.map((addr, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '20px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        {addr.isDefault && (
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            background: '#4caf50',
                            color: 'white',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            marginBottom: '10px',
                            marginRight: '10px'
                          }}>
                            Default
                          </span>
                        )}
                        {!addr.isDefault && (
                          <button
                            style={{
                              padding: '4px 12px',
                              background: '#e8f5e9',
                              color: '#388e3c',
                              border: '1px solid #4caf50',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '600',
                              marginBottom: '10px',
                              marginRight: '10px',
                              cursor: 'pointer'
                            }}
                            onClick={async () => {
                              try {
                                await usersApi.setDefaultAddress(idx);
                                await fetchUserData();
                              } catch (err) {
                                alert('Failed to set default address');
                              }
                            }}
                          >
                            Set as Default
                          </button>
                        )}
                        {addr.label && (
                          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                            {addr.label}
                          </div>
                        )}
                        <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                          {addr.addressLine1}
                          {addr.addressLine2 && `, ${addr.addressLine2}`}
                          <br />
                          {addr.city}, {addr.state} {addr.zip}
                          {addr.country && `, ${addr.country}`}
                          {addr.phone && <><br />📞 {addr.phone}</>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleEditAddress(idx)}
                          style={{
                            padding: '8px 16px',
                            background: '#fff3e0',
                            color: '#e65100',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(idx)}
                          style={{
                            padding: '8px 16px',
                            background: '#ffebee',
                            color: '#c62828',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '40px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              marginBottom: '30px'
            }}>
              <h2 style={{ fontSize: '24px', marginBottom: '30px', color: '#333' }}>
                {editingPaymentIdx !== null ? 'Edit Payment Method' : 'Add Payment Method'}
              </h2>
              {paymentError && (
                <div style={{
                  padding: '12px',
                  background: '#ffebee',
                  color: '#c62828',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  {paymentError}
                </div>
              )}
              {paymentSuccess && (
                <div style={{
                  padding: '12px',
                  background: '#e8f5e9',
                  color: '#2e7d32',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  {paymentSuccess}
                </div>
              )}
              <form onSubmit={handleAddPayment}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                      Card Type
                    </label>
                    <select
                      value={paymentForm.type}
                      onChange={e => setPaymentForm({ ...paymentForm, type: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '16px'
                      }}
                    >
                      <option value="card">Credit/Debit Card</option>
                      <option value="paypal">PayPal</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                      Card Brand
                    </label>
                    <select
                      value={paymentForm.brand}
                      onChange={e => setPaymentForm({ ...paymentForm, brand: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '16px'
                      }}
                    >
                      <option value="visa">Visa</option>
                      <option value="mastercard">Mastercard</option>
                      <option value="amex">American Express</option>
                      <option value="discover">Discover</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                    Last 4 Digits *
                  </label>
                  <input
                    type="text"
                    value={paymentForm.cardLast4}
                    onChange={e => setPaymentForm({ ...paymentForm, cardLast4: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    required
                    placeholder="1234"
                    maxLength={4}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={paymentForm.isDefault}
                    onChange={e => setPaymentForm({ ...paymentForm, isDefault: e.target.checked })}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <label style={{ fontWeight: '600', color: '#333' }}>
                    Set as default payment method
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button
                    type="submit"
                    style={{
                      padding: '14px 32px',
                      background: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50px',
                      fontWeight: '600',
                      fontSize: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#45a049';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#4caf50';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    {editingPaymentIdx !== null ? 'Update Payment' : 'Add Payment Method'}
                  </button>
                  {editingPaymentIdx !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPaymentIdx(null);
                        setPaymentForm({ type: 'card', cardLast4: '', brand: 'visa', isDefault: false });
                      }}
                      style={{
                        padding: '14px 32px',
                        background: '#f5f5f5',
                        color: '#666',
                        border: 'none',
                        borderRadius: '50px',
                        fontWeight: '600',
                        fontSize: '16px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Saved Payment Methods */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '40px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
            }}>
              <h2 style={{ fontSize: '24px', marginBottom: '30px', color: '#333' }}>
                Saved Payment Methods
              </h2>
              {!userData?.paymentMethods || userData.paymentMethods.length === 0 ? (
                <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>
                  No saved payment methods. Add one above!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {userData.paymentMethods.map((pm, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '20px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ fontSize: '32px' }}>
                          {pm.brand === 'visa' ? '💳' : pm.brand === 'mastercard' ? '💳' : '💳'}
                        </div>
                        <div>
                          {pm.isDefault && (
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 12px',
                              background: '#4caf50',
                              color: 'white',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '600',
                              marginBottom: '5px'
                            }}>
                              Default
                            </span>
                          )}
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                            {pm.brand?.toUpperCase() || 'Card'} •••• {pm.cardLast4}
                          </div>
                          <div style={{ fontSize: '14px', color: '#666' }}>
                            {pm.type === 'card' ? 'Credit/Debit Card' : 'PayPal'}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleEditPayment(idx)}
                          style={{
                            padding: '8px 16px',
                            background: '#fff3e0',
                            color: '#e65100',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePayment(idx)}
                          style={{
                            padding: '8px 16px',
                            background: '#ffebee',
                            color: '#c62828',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Account;


