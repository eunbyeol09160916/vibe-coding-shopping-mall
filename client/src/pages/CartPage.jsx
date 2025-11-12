import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";
import Navbar from "./Navbar";

function CartPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItems, setUpdatingItems] = useState(new Set());

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
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoading(true);
      setError("");

      try {
        const response = await fetch(API_ENDPOINTS.CART, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setCart(data.data);
        } else {
          setError(data.message || "장바구니를 불러오지 못했습니다.");
        }
      } catch (error) {
        console.error("장바구니 정보 가져오기 오류:", error);
        setError("장바구니를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCart();
    }
  }, [user]);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    setUpdatingItems((prev) => new Set(prev).add(productId));

    try {
      const response = await fetch(`${API_ENDPOINTS.CART}/items/${productId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCart(data.data);
      } else {
        alert(data.message || "수량 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("수량 변경 오류:", error);
      alert("수량 변경에 실패했습니다.");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (productId) => {
    if (!window.confirm("장바구니에서 이 상품을 제거하시겠습니까?")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    setUpdatingItems((prev) => new Set(prev).add(productId));

    try {
      const response = await fetch(`${API_ENDPOINTS.CART}/items/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCart(data.data);
      } else {
        alert(data.message || "상품 제거에 실패했습니다.");
      }
    } catch (error) {
      console.error("상품 제거 오류:", error);
      alert("상품 제거에 실패했습니다.");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("장바구니를 모두 비우시겠습니까?")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(API_ENDPOINTS.CART, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCart(data.data);
      } else {
        alert(data.message || "장바구니 비우기에 실패했습니다.");
      }
    } catch (error) {
      console.error("장바구니 비우기 오류:", error);
      alert("장바구니 비우기에 실패했습니다.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  if (loading) {
    return (
      <>
        <Navbar user={user} onLogout={handleLogout} />
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          장바구니를 불러오는 중입니다...
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar user={user} onLogout={handleLogout} />
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <p>{error}</p>
          <button
            onClick={() => navigate("/")}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#ff69b4",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            홈으로 돌아가기
          </button>
        </div>
      </>
    );
  }

  const cartItems = cart?.cart?.items || [];
  const totalAmount = cart?.totalAmount || 0;
  const itemCount = cart?.itemCount || 0;

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .cart-page {
          width: 100%;
          min-height: 100vh;
          background-color: #f8f9fa;
        }
        .cart-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .cart-header {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 24px;
        }
        .cart-title {
          font-size: 32px;
          font-weight: bold;
          color: #333;
          margin-bottom: 8px;
        }
        .cart-subtitle {
          font-size: 16px;
          color: #666;
        }
        .cart-content {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 24px;
        }
        .cart-items-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .cart-items-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f0f0f0;
        }
        .cart-items-count {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }
        .clear-cart-btn {
          padding: 8px 16px;
          background: #fff;
          color: #dc3545;
          border: 1px solid #dc3545;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .clear-cart-btn:hover {
          background: #dc3545;
          color: white;
        }
        .cart-item {
          display: flex;
          gap: 20px;
          padding: 20px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .cart-item:last-child {
          border-bottom: none;
        }
        .cart-item-image {
          width: 120px;
          height: 120px;
          border-radius: 8px;
          object-fit: cover;
          background: linear-gradient(135deg, #ffe4e9 0%, #ffb6c1 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          flex-shrink: 0;
        }
        .cart-item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
        }
        .cart-item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .cart-item-name {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          cursor: pointer;
        }
        .cart-item-name:hover {
          color: #ff69b4;
        }
        .cart-item-category {
          font-size: 14px;
          color: #999;
        }
        .cart-item-actions {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-top: auto;
        }
        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .quantity-btn {
          width: 32px;
          height: 32px;
          border: 1px solid #ddd;
          background: #fff;
          border-radius: 4px;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .quantity-btn:hover:not(:disabled) {
          background: #f5f5f5;
          border-color: #ff69b4;
        }
        .quantity-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .quantity-display {
          min-width: 50px;
          text-align: center;
          font-size: 16px;
          font-weight: 600;
        }
        .cart-item-price {
          font-size: 20px;
          font-weight: bold;
          color: #333;
        }
        .remove-item-btn {
          padding: 8px 16px;
          background: #fff;
          color: #dc3545;
          border: 1px solid #dc3545;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .remove-item-btn:hover {
          background: #dc3545;
          color: white;
        }
        .cart-summary {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          height: fit-content;
          position: sticky;
          top: 100px;
        }
        .summary-title {
          font-size: 20px;
          font-weight: bold;
          color: #333;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f0f0f0;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 16px;
        }
        .summary-label {
          color: #666;
        }
        .summary-value {
          font-weight: 600;
          color: #333;
        }
        .summary-total {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid #f0f0f0;
          font-size: 20px;
        }
        .summary-total-label {
          font-weight: bold;
          color: #333;
        }
        .summary-total-value {
          font-weight: bold;
          color: #ff69b4;
        }
        .checkout-btn {
          width: 100%;
          padding: 16px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 24px;
          transition: all 0.2s;
        }
        .checkout-btn:hover {
          background: #c82333;
        }
        .checkout-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .empty-cart {
          text-align: center;
          padding: 80px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .empty-cart-icon {
          font-size: 80px;
          margin-bottom: 20px;
        }
        .empty-cart-message {
          font-size: 20px;
          color: #666;
          margin-bottom: 30px;
        }
        .continue-shopping-btn {
          padding: 12px 24px;
          background: #ff69b4;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .continue-shopping-btn:hover {
          background: #ff4da6;
        }
        @media (max-width: 968px) {
          .cart-content {
            grid-template-columns: 1fr;
          }
          .cart-summary {
            position: static;
          }
        }
      `}</style>
      <div className="cart-page">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="cart-container">
          <div className="cart-header">
            <h1 className="cart-title">장바구니</h1>
            <p className="cart-subtitle">담은 상품을 확인하고 주문하세요</p>
          </div>

          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <div className="empty-cart-message">장바구니가 비어있습니다</div>
              <button
                className="continue-shopping-btn"
                onClick={() => navigate("/")}
              >
                쇼핑 계속하기
              </button>
            </div>
          ) : (
            <div className="cart-content">
              <div className="cart-items-section">
                <div className="cart-items-header">
                  <div className="cart-items-count">
                    전체 {itemCount}개 상품
                  </div>
                  <button className="clear-cart-btn" onClick={handleClearCart}>
                    전체 삭제
                  </button>
                </div>

                {cartItems.map((item) => {
                  const product = item.product;
                  const isUpdating = updatingItems.has(product._id);
                  const itemTotal = product.price * item.quantity;

                  return (
                    <div key={item._id || product._id} className="cart-item">
                      <div
                        className="cart-item-image"
                        onClick={() => navigate(`/products/${product._id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        {product.image ? (
                          <img src={product.image} alt={product.name} />
                        ) : (
                          <span>🛍️</span>
                        )}
                      </div>
                      <div className="cart-item-info">
                        <div
                          className="cart-item-name"
                          onClick={() => navigate(`/products/${product._id}`)}
                        >
                          {product.name}
                        </div>
                        <div className="cart-item-category">
                          {product.category} | SKU: {product.sku}
                        </div>
                        <div className="cart-item-actions">
                          <div className="quantity-controls">
                            <button
                              className="quantity-btn"
                              onClick={() =>
                                handleQuantityChange(
                                  product._id,
                                  item.quantity - 1
                                )
                              }
                              disabled={isUpdating || item.quantity <= 1}
                            >
                              -
                            </button>
                            <div className="quantity-display">
                              {item.quantity}
                            </div>
                            <button
                              className="quantity-btn"
                              onClick={() =>
                                handleQuantityChange(
                                  product._id,
                                  item.quantity + 1
                                )
                              }
                              disabled={isUpdating}
                            >
                              +
                            </button>
                          </div>
                          <div className="cart-item-price">
                            {(itemTotal).toLocaleString()}원
                          </div>
                          <button
                            className="remove-item-btn"
                            onClick={() => handleRemoveItem(product._id)}
                            disabled={isUpdating}
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="cart-summary">
                <div className="summary-title">주문 요약</div>
                <div className="summary-row">
                  <span className="summary-label">상품 수</span>
                  <span className="summary-value">{itemCount}개</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">상품 금액</span>
                  <span className="summary-value">
                    {totalAmount.toLocaleString()}원
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">배송비</span>
                  <span className="summary-value">
                    {/* 30,000원 이상 무료, 미만 1원 */}
                    {totalAmount >= 30000 ? "무료" : "1원"}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#999", marginTop: "-8px", marginBottom: "12px", textAlign: "right" }}>
                  30,000원 이상: 무료(0원) / 30,000원 미만: 1원
                </div>
                <div className="summary-total">
                  <span className="summary-total-label">총 결제금액</span>
                  <span className="summary-total-value">
                    {/* 30,000원 이상 무료, 미만 1원 */}
                    {(totalAmount + (totalAmount >= 30000 ? 0 : 1)).toLocaleString()}원
                  </span>
                </div>
                <button
                  className="checkout-btn"
                  onClick={() => navigate("/checkout")}
                >
                  주문하기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default CartPage;

