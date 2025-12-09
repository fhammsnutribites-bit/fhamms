import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import Navbar from '../../components/Navbar.jsx';
import { ordersApi } from '../../services/ordersApi.js';

function AdminOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user?.isAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await ordersApi.getAll();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleDeliver = useCallback(async (orderId) => {
    try {
      await ordersApi.markAsDelivered(orderId);
      fetchOrders();
    } catch (err) {
      alert('Failed to update order');
      console.error('Mark as delivered error:', err);
    }
  }, [fetchOrders]);

  if (!user?.isAdmin) {
    return (
      <div>
        <Navbar />
        <div style={{padding:40,textAlign:'center'}}>Access Denied</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{maxWidth:1200,margin:'30px auto',padding:20}}>
        <h2>Manage Orders</h2>
        {loading ? (
          <p>Loading...</p>
        ) : orders.length === 0 ? (
          <p>No orders yet</p>
        ) : (
          <div>
            {orders.map(order => (
              <div key={order._id} style={{border:'1px solid #ddd',padding:20,marginBottom:20,borderRadius:8}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                  <div>
                    <strong>Order ID:</strong> {order._id}
                  </div>
                  <div>
                    <strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{marginBottom:10}}>
                  <strong>Customer:</strong> {order.user?.name} ({order.user?.email})
                </div>
                <div style={{marginBottom:10}}>
                  <strong>Shipping Address:</strong> {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
                </div>
                <div style={{marginBottom:10}}>
                  <strong>Items:</strong>
                  <ul>
                    {order.orderItems?.map((item, idx) => (
                      <li key={idx}>
                        {item.product?.name || 'Product'} - Qty: {item.qty} - ${item.price}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <strong>Total:</strong> ${order.totalPrice}
                  </div>
                  <div>
                    {order.isDelivered ? (
                      <span style={{color:'green',marginRight:10}}>✓ Delivered on {new Date(order.deliveredAt).toLocaleDateString()}</span>
                    ) : (
                      <button onClick={() => handleDeliver(order._id)} style={{padding:'5px 15px',background:'#28a745',color:'white',border:'none',borderRadius:5,cursor:'pointer'}}>
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default AdminOrders;

