import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";
import Navbar from "./Navbar";

function OrderListPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("전체");
  const [cancellingOrders, setCancellingOrders] = useState(new Set());

  const filterOptions = [
    { label: "전체" },
    { label: "주문확인", statuses: ["pending"] },
    { label: "상품준비중", statuses: ["processing"] },
    { label: "배송시작", statuses: ["shipping_started"] },
    { label: "배송중", statuses: ["shipped"] },
    { label: "배송완료", statuses: ["delivered"] },
    { label: "주문취소", statuses: ["cancelled"] },
  ];

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_ENDPOINTS.USERS}/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setUser(data.data);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("유저 정보 가져오기 오류:", error);
        navigate("/login");
      }
    };

    fetchUserInfo();
  }, [navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token || !user) return;

      setLoading(true);
      setError("");

      try {
        // 사용자용: 자신의 주문만 조회
        const response = await fetch(API_ENDPOINTS.ORDERS, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setOrders(data.data || []);
        } else {
          setError(data.message || "주문 목록을 불러오지 못했습니다.");
        }
      } catch (error) {
        console.error("주문 목록 가져오기 오류:", error);
        setError("주문 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  // 주문 상태 한글 변환
  const getStatusText = (status) => {
    const statusMap = {
      pending: "주문확인",
      processing: "상품준비중",
      shipping_started: "배송시작",
      shipped: "배송중",
      delivered: "배송완료",
      cancelled: "주문취소",
    };
    return statusMap[status] || status;
  };

  // 주문 상태 색상
  const getStatusColor = (status) => {
    const colorMap = {
      pending: "#ffc107",
      processing: "#ff9800",
      shipping_started: "#17a2b8",
      shipped: "#17a2b8",
      delivered: "#28a745",
      cancelled: "#dc3545",
    };
    return colorMap[status] || "#666";
  };

  // 필터링된 주문 목록
  const getFilteredOrders = () => {
    const activeOption = filterOptions.find((option) => option.label === activeFilter);

    if (!activeOption || !activeOption.statuses) {
      return orders;
    }

    return orders.filter((order) => activeOption.statuses.includes(order.status));
  };

  const filteredOrders = getFilteredOrders();

  const handleCancelOrder = async (orderId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const confirmed = window.confirm("해당 주문을 취소하시겠습니까?");
    if (!confirmed) return;

    setCancellingOrders((prev) => new Set(prev).add(orderId));

    try {
      const response = await fetch(`${API_ENDPOINTS.ORDERS}/${orderId}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? data.data : order
          )
        );
      } else {
        alert(data.message || "주문 취소에 실패했습니다.");
      }
    } catch (error) {
      console.error("주문 취소 오류:", error);
      alert("주문 취소에 실패했습니다.");
    } finally {
      setCancellingOrders((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .order-list-page {
          width: 100%;
          min-height: 100vh;
          background-color: #f8f9fa;
        }
        .order-list-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .page-header {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 24px;
        }
        .page-title {
          font-size: 32px;
          font-weight: bold;
          color: #333;
          margin-bottom: 8px;
        }
        .page-subtitle {
          font-size: 16px;
          color: #666;
        }
        .filter-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 24px;
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          flex-wrap: wrap;
        }
        .filter-tab {
          padding: 10px 20px;
          border: 2px solid #e0e0e0;
          background: white;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-tab:hover {
          border-color: #ff69b4;
          color: #ff69b4;
        }
        .filter-tab.active {
          border-color: #ff69b4;
          background: #ff69b4;
          color: white;
        }
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .order-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .order-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #f0f0f0;
        }
        .order-info {
          flex: 1;
        }
        .order-number {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }
        .order-meta {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          font-size: 14px;
          color: #999;
        }
        .order-meta-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .order-status {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          color: white;
        }
        .order-status-wrapper {
          display: flex;
          flex-direction: row-reverse;
          align-items: center;
          gap: 10px;
        }
        .order-cancel-button {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          background: #dc3545;
          color: white;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }
        .order-cancel-button:hover:not(:disabled) {
          background: #c82333;
          transform: translateY(-1px);
        }
        .order-cancel-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .order-items {
          margin-bottom: 20px;
        }
        .order-item {
          display: flex;
          gap: 15px;
          padding: 15px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .order-item:last-child {
          border-bottom: none;
        }
        .order-item-image {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          object-fit: cover;
          background: linear-gradient(135deg, #ffe4e9 0%, #ffb6c1 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          flex-shrink: 0;
        }
        .order-item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
        }
        .order-item-info {
          flex: 1;
        }
        .order-item-name {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 5px;
        }
        .order-item-details {
          font-size: 14px;
          color: #999;
        }
        .order-item-price {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
        .order-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 20px;
          border-top: 2px solid #f0f0f0;
        }
        .order-total {
          font-size: 20px;
          font-weight: bold;
          color: #ff69b4;
        }
        .order-actions {
          display: flex;
          gap: 10px;
        }
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary {
          background: #ff69b4;
          color: white;
        }
        .btn-primary:hover {
          background: #ff4da6;
        }
        .btn-secondary {
          background: #6c757d;
          color: white;
        }
        .btn-secondary:hover {
          background: #5a6268;
        }
        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .empty-icon {
          font-size: 80px;
          margin-bottom: 20px;
        }
        .empty-message {
          font-size: 18px;
          color: #666;
          margin-bottom: 30px;
        }
        .loading-message {
          text-align: center;
          padding: 80px 20px;
          font-size: 18px;
          color: #666;
        }
        .error-message {
          background: #fff3cd;
          border: 1px solid #ffc107;
          color: #856404;
          padding: 15px 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
        }
      `}</style>
      <div className="order-list-page">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="order-list-container">
          <div className="page-header">
            <h1 className="page-title">내 주문 목록</h1>
            <p className="page-subtitle">주문 내역을 확인하실 수 있습니다</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="filter-tabs">
            {filterOptions.map((option) => (
              <button
                key={option.label}
                className={`filter-tab ${activeFilter === option.label ? "active" : ""}`}
                onClick={() => setActiveFilter(option.label)}
              >
                {option.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-message">주문 목록을 불러오는 중...</div>
          ) : filteredOrders.length === 0 ? (
              <div className="empty-state">
              <div className="empty-icon">📦</div>
              <div className="empty-message">
                {activeFilter === "전체"
                  ? "주문 내역이 없습니다."
                  : `${activeFilter} 상태의 주문이 없습니다.`}
              </div>
              <button className="btn btn-primary" onClick={() => navigate("/")}>
                쇼핑하러 가기
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {filteredOrders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <div className="order-number">주문번호: {order.orderNumber}</div>
                      <div className="order-meta">
                        <div className="order-meta-item">
                          <span>📅</span>
                          <span>{new Date(order.createdAt).toLocaleString("ko-KR")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="order-status-wrapper">
                      <div
                        className="order-status"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {getStatusText(order.status)}
                      </div>
                      {order.status === "pending" && (
                        <button
                          className="order-cancel-button"
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={cancellingOrders.has(order._id)}
                        >
                          {cancellingOrders.has(order._id) ? "취소 중..." : "주문 취소"}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="order-items">
                    {order.items?.map((item, idx) => {
                      const product = item.product;
                      const itemTotal = item.price * item.quantity;
                      return (
                        <div key={item._id || idx} className="order-item">
                          <div className="order-item-image">
                            {product?.image ? (
                              <img src={product.image} alt={product?.name || "상품"} />
                            ) : (
                              <span>🛍️</span>
                            )}
                          </div>
                          <div className="order-item-info">
                            <div className="order-item-name">
                              {product?.name || "상품명 없음"}
                            </div>
                            <div className="order-item-details">
                              {item.quantity}개 × {item.price.toLocaleString()}원
                            </div>
                          </div>
                          <div className="order-item-price">
                            {itemTotal.toLocaleString()}원
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="order-summary">
                    <div className="order-total">
                      총 결제금액: {order.totalAmount?.toLocaleString()}원
                    </div>
                    <div className="order-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          // TODO: 주문 상세 페이지로 이동
                          alert(`주문 상세 페이지 (주문번호: ${order.orderNumber})`);
                        }}
                      >
                        주문 상세
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default OrderListPage;
