import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";
import Navbar from "./Navbar";

function OrderSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // URL 파라미터에서 주문 성공/실패 정보 가져오기
  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");
  const errorMessage = searchParams.get("error");

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

  // 주문 정보 가져오기 (성공한 경우)
  useEffect(() => {
    const fetchOrderInfo = async () => {
      if (success === "true" && orderId) {
        const token = localStorage.getItem("token");
        if (!token) return;

        setIsLoading(true);
        try {
          const response = await fetch(`${API_ENDPOINTS.ORDERS}/${orderId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          const data = await response.json();
          if (response.ok && data.success) {
            setOrderData(data.data);
          } else {
            setError("주문 정보를 불러올 수 없습니다.");
          }
        } catch (error) {
          console.error("주문 정보 가져오기 오류:", error);
          setError("주문 정보를 불러오는 중 오류가 발생했습니다.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchOrderInfo();
  }, [success, orderId]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const handleViewOrders = () => {
    navigate("/orders");
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .order-success-page {
          width: 100%;
          min-height: 100vh;
          background-color: #f8f9fa;
        }
        .order-success-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .success-card {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        .success-icon {
          font-size: 80px;
          margin-bottom: 20px;
        }
        .success-title {
          font-size: 32px;
          font-weight: bold;
          color: #333;
          margin-bottom: 10px;
        }
        .success-message {
          font-size: 18px;
          color: #666;
          margin-bottom: 30px;
        }
        .error-card {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        .error-icon {
          font-size: 80px;
          margin-bottom: 20px;
        }
        .error-title {
          font-size: 32px;
          font-weight: bold;
          color: #dc3545;
          margin-bottom: 10px;
        }
        .error-message {
          font-size: 18px;
          color: #666;
          margin-bottom: 30px;
        }
        .order-info {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 30px 0;
          text-align: left;
        }
        .order-info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .order-info-label {
          color: #666;
          font-weight: 600;
        }
        .order-info-value {
          color: #333;
        }
        .action-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 30px;
        }
        .btn {
          padding: 14px 28px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
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
        .loading-message {
          text-align: center;
          padding: 40px;
          font-size: 18px;
          color: #666;
        }
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .order-success-container {
            padding: 20px 16px;
          }
          .success-card,
          .error-card {
            padding: 30px 20px;
          }
          .success-icon,
          .error-icon {
            font-size: 60px;
            margin-bottom: 16px;
          }
          .success-title,
          .error-title {
            font-size: 24px;
            margin-bottom: 8px;
          }
          .success-message,
          .error-message {
            font-size: 16px;
            margin-bottom: 24px;
            line-height: 1.6;
          }
          .order-info {
            padding: 16px;
            margin: 24px 0;
          }
          .order-info-row {
            flex-direction: column;
            gap: 4px;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid #e0e0e0;
          }
          .order-info-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }
          .order-info-label {
            font-size: 14px;
            margin-bottom: 4px;
          }
          .order-info-value {
            font-size: 16px;
            font-weight: 600;
            word-break: break-word;
          }
          .action-buttons {
            flex-direction: column;
            gap: 12px;
            margin-top: 24px;
          }
          .btn {
            width: 100%;
            padding: 16px;
            font-size: 16px;
          }
          .loading-message {
            padding: 30px 20px;
            font-size: 16px;
          }
        }
        @media (max-width: 480px) {
          .success-card,
          .error-card {
            padding: 24px 16px;
          }
          .success-icon,
          .error-icon {
            font-size: 50px;
          }
          .success-title,
          .error-title {
            font-size: 20px;
          }
          .success-message,
          .error-message {
            font-size: 14px;
          }
          .order-info {
            padding: 12px;
          }
          .order-info-label {
            font-size: 13px;
          }
          .order-info-value {
            font-size: 15px;
          }
        }
      `}</style>
      <div className="order-success-page">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="order-success-container">
          {isLoading ? (
            <div className="loading-message">주문 정보를 불러오는 중...</div>
          ) : success === "true" ? (
            <div className="success-card">
              <div className="success-icon">✅</div>
              <h1 className="success-title">주문이 완료되었습니다!</h1>
              <p className="success-message">
                주문해주셔서 감사합니다. 주문 내역은 아래에서 확인하실 수 있습니다.
              </p>

              {orderData && (
                <div className="order-info">
                  <div className="order-info-row">
                    <span className="order-info-label">주문번호</span>
                    <span className="order-info-value">{orderData.orderNumber}</span>
                  </div>
                  <div className="order-info-row">
                    <span className="order-info-label">주문 상태</span>
                    <span className="order-info-value">
                      {orderData.status === "pending" && "결제 대기"}
                      {orderData.status === "processing" && "처리 중"}
                      {orderData.status === "shipped" && "배송 중"}
                      {orderData.status === "delivered" && "배송 완료"}
                      {orderData.status === "cancelled" && "취소됨"}
                    </span>
                  </div>
                  <div className="order-info-row">
                    <span className="order-info-label">총 결제금액</span>
                    <span className="order-info-value">
                      {orderData.totalAmount?.toLocaleString()}원
                    </span>
                  </div>
                  <div className="order-info-row">
                    <span className="order-info-label">배송지</span>
                    <span className="order-info-value">{orderData.shippingAddress}</span>
                  </div>
                  <div className="order-info-row">
                    <span className="order-info-label">수령인</span>
                    <span className="order-info-value">{orderData.recipientName}</span>
                  </div>
                </div>
              )}

              <div className="action-buttons">
                <button className="btn btn-primary" onClick={handleViewOrders}>
                  주문 목록 보기
                </button>
                <button className="btn btn-secondary" onClick={() => navigate("/")}>
                  홈으로 가기
                </button>
              </div>
            </div>
          ) : (
            <div className="error-card">
              <div className="error-icon">❌</div>
              <h1 className="error-title">주문에 실패했습니다</h1>
              <p className="error-message">
                {errorMessage || "주문 처리 중 오류가 발생했습니다. 다시 시도해주세요."}
              </p>
              <div className="action-buttons">
                <button className="btn btn-primary" onClick={() => navigate("/cart")}>
                  장바구니로 돌아가기
                </button>
                <button className="btn btn-secondary" onClick={() => navigate("/")}>
                  홈으로 가기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default OrderSuccessPage;

