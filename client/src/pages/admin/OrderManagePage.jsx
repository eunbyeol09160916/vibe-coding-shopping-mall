import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../config/api";
import Navbar from "../Navbar";

function OrderManagePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("전체");
  const [openDropdown, setOpenDropdown] = useState(null); // 열린 드롭다운의 주문 ID
  const [updatingStatus, setUpdatingStatus] = useState(new Set()); // 상태 변경 중인 주문 ID들

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
          // 관리자 권한 확인
          if (data.data.user_type !== 'admin') {
            alert("관리자 권한이 필요합니다.");
            navigate("/");
            return;
          }
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
      if (!token || !user || user.user_type !== 'admin') return;

      setLoading(true);
      setError("");

      try {
        // 관리자용 모든 주문 조회 API
        const response = await fetch(`${API_ENDPOINTS.ORDERS}/all`, {
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

    if (user && user.user_type === 'admin') {
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

  // 상태 변경 핸들러
  const handleStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setUpdatingStatus((prev) => new Set(prev).add(orderId));

    try {
      const response = await fetch(`${API_ENDPOINTS.ORDERS}/${orderId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 주문 목록 업데이트
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? data.data : order
          )
        );
        setOpenDropdown(null);
      } else {
        alert(data.message || "주문 상태 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("주문 상태 변경 오류:", error);
      alert("주문 상태 변경에 실패했습니다.");
    } finally {
      setUpdatingStatus((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  // 상태 옵션
  const statusOptions = [
    { value: "pending", label: "주문확인" },
    { value: "processing", label: "상품준비중" },
    { value: "shipping_started", label: "배송시작" },
    { value: "shipped", label: "배송중" },
    { value: "delivered", label: "배송완료" },
    { value: "cancelled", label: "주문취소" },
  ];

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.order-status-container')) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openDropdown]);

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .order-manage-page {
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
          position: relative;
        }
        .order-status.clickable {
          cursor: pointer;
          transition: all 0.2s;
        }
        .order-status.clickable:hover {
          opacity: 0.9;
          transform: scale(1.05);
        }
        .status-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          min-width: 150px;
          overflow: hidden;
        }
        .status-option {
          padding: 12px 16px;
          cursor: pointer;
          transition: background 0.2s;
          font-size: 14px;
          color: #333;
          border-bottom: 1px solid #f0f0f0;
        }
        .status-option:last-child {
          border-bottom: none;
        }
        .status-option:hover {
          background: #f8f9fa;
        }
        .status-option.active {
          background: #ffe4e9;
          color: #ff69b4;
          font-weight: 600;
        }
        .status-option.disabled {
          opacity: 0.5;
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
        .status-dropdown-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 999;
        }
      `}</style>
      <div className="order-manage-page">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="order-list-container">
          <div className="page-header">
            <h1 className="page-title">주문 관리</h1>
            <p className="page-subtitle">
              모든 주문 내역을 확인하고 관리할 수 있습니다
            </p>
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
                          <span>👤</span>
                          <span>{order.user?.name || "고객명 없음"}</span>
                        </div>
                        <div className="order-meta-item">
                          <span>📧</span>
                          <span>{order.user?.email || "이메일 없음"}</span>
                        </div>
                        <div className="order-meta-item">
                          <span>📅</span>
                          <span>{new Date(order.createdAt).toLocaleString("ko-KR")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="order-status-container" style={{ position: "relative" }}>
                      {openDropdown === order._id && (
                        <div
                          className="status-dropdown-overlay"
                          onClick={() => setOpenDropdown(null)}
                        />
                      )}
                      <div
                        className={`order-status clickable ${updatingStatus.has(order._id) ? "disabled" : ""}`}
                        style={{ backgroundColor: getStatusColor(order.status) }}
                        onClick={() => {
                          if (!updatingStatus.has(order._id)) {
                            setOpenDropdown(openDropdown === order._id ? null : order._id);
                          }
                        }}
                      >
                        {updatingStatus.has(order._id) ? "변경 중..." : getStatusText(order.status)}
                      </div>
                      {openDropdown === order._id && (
                        <div className="status-dropdown">
                          {statusOptions.map((option) => (
                            <div
                              key={option.value}
                              className={`status-option ${
                                order.status === option.value ? "active" : ""
                              }`}
                              onClick={() => {
                                if (order.status !== option.value) {
                                  handleStatusChange(order._id, option.value);
                                } else {
                                  setOpenDropdown(null);
                                }
                              }}
                            >
                              {option.label}
                            </div>
                          ))}
                        </div>
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

export default OrderManagePage;

