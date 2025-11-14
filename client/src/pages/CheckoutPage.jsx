import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";
import Navbar from "./Navbar";

function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 주문 정보 폼
  const [formData, setFormData] = useState({
    shippingAddress: "",
    recipientName: "",
    recipientPhone: "",
    notes: "",
  });

  // 포트원 결제 모듈 초기화
  useEffect(() => {
    const initPortOne = () => {
      if (window.IMP) {
        window.IMP.init("imp57538368");
        console.log("포트원 초기화 완료");
      } else {
        // IMP 스크립트가 로드되지 않았으면 잠시 후 다시 시도
        setTimeout(initPortOne, 100);
      }
    };
    
    initPortOne();
  }, []);

  // 모바일 결제 완료 후 리디렉션 처리
  useEffect(() => {
    const impUid = searchParams.get('imp_uid');
    const merchantUid = searchParams.get('merchant_uid');
    const success = searchParams.get('imp_success');
    const errorMsg = searchParams.get('error_msg');

    // 모바일에서 결제 완료 후 리디렉션된 경우
    if (impUid && merchantUid) {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("로그인이 필요합니다.");
        return;
      }

      if (success === 'true' && impUid) {
        // 결제 성공
        setSubmitting(true);
        handleMobilePaymentSuccess(impUid, merchantUid, token);
      } else {
        // 결제 실패 - 주문 실패 페이지로 이동
        navigate(`/order/failure?error=${encodeURIComponent(errorMsg || "결제에 실패했습니다.")}`, { replace: true });
      }
    }
  }, [searchParams]);

  // 모바일 결제 성공 처리
  const handleMobilePaymentSuccess = async (impUid, merchantUid, token) => {
    try {
      // 주문 생성 API 호출
      const response = await fetch(API_ENDPOINTS.ORDERS, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          merchantUid: merchantUid,
          impUid: impUid,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 주문 성공 페이지로 이동
        navigate(`/order/success?success=true&orderId=${data.data._id}`, { replace: true });
      } else {
        // 결제는 성공했지만 주문 생성 실패 - 재시도 안내
        alert(`결제는 완료되었지만 주문 생성에 실패했습니다.\n\n에러: ${data.message || "주문 처리에 실패했습니다."}\n\n고객센터로 문의해주세요. 결제 내역은 확인 가능합니다.`);
        // 주문 목록 페이지로 이동하여 결제 내역 확인 가능하도록
        navigate("/orders", { replace: true });
      }
    } catch (error) {
      console.error("주문 처리 오류:", error);
      // 결제는 성공했지만 주문 생성 실패 - 재시도 안내
      alert("결제는 완료되었지만 주문 생성 중 오류가 발생했습니다.\n\n고객센터로 문의해주세요. 결제 내역은 확인 가능합니다.");
      navigate("/orders", { replace: true });
    }
  };

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
          // 사용자 정보로 기본값 설정
          setFormData((prev) => ({
            ...prev,
            recipientName: data.data.name || "",
            shippingAddress: data.data.address || "",
          }));
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
          if (!data.data.cart || data.data.cart.items.length === 0) {
            setError("장바구니가 비어있습니다.");
            setTimeout(() => navigate("/cart"), 2000);
            return;
          }
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
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // 폼 검증
    if (!formData.shippingAddress.trim()) {
      setError("배송지를 입력해주세요.");
      return;
    }

    if (!formData.recipientName.trim()) {
      setError("수령인 이름을 입력해주세요.");
      return;
    }

    if (!formData.recipientPhone.trim()) {
      setError("수령인 연락처를 입력해주세요.");
      return;
    }

    if (!window.IMP) {
      setError("결제 모듈을 불러올 수 없습니다. 페이지를 새로고침해주세요.");
      return;
    }

    const cartItems = cart?.cart?.items || [];
    const totalAmount = cart?.totalAmount || 0;
    // 배송비 계산 (30,000원 이상 무료, 미만 1원)
    const shippingFee = totalAmount >= 30000 ? 0 : 1;
    const finalTotal = totalAmount + shippingFee;

    // 주문번호 생성 (임시)
    const merchantUid = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 포트원 결제 요청
    if (!window.IMP) {
      setError("결제 모듈을 불러올 수 없습니다. 페이지를 새로고침해주세요.");
      return;
    }

    // 주문명 생성
    const orderName = cartItems.length === 1
      ? cartItems[0].product.name
      : `${cartItems[0].product.name} 외 ${cartItems.length - 1}개`;

    // IMP.request_pay 호출
    // 포트원 V1 + 이니시스 구모듈(html5_inicis) 채널 사용
    window.IMP.request_pay(
      {
        pg: 'html5_inicis', // 이니시스 구모듈
        pay_method: 'card',
        merchant_uid: merchantUid, // 상점에서 관리하는 주문 번호
        name: orderName,
        amount: finalTotal,
        buyer_email: user?.email || '',
        buyer_name: formData.recipientName,
        buyer_tel: formData.recipientPhone,
        buyer_addr: formData.shippingAddress,
        buyer_postcode: '',
        m_redirect_url: window.location.origin + '/checkout', // 모바일에서 결제 완료 후 리디렉션 될 URL
      },
      async (rsp) => {
        if (rsp.success) {
          // 결제 성공
          setSubmitting(true);
          try {
            const response = await fetch(API_ENDPOINTS.ORDERS, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ...formData,
                merchantUid: rsp.merchant_uid,
                impUid: rsp.imp_uid,
              }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
              // 주문 성공 페이지로 이동
              navigate(`/order/success?success=true&orderId=${data.data._id}`);
            } else {
              // 결제는 성공했지만 주문 생성 실패 - 재시도 안내
              alert(`결제는 완료되었지만 주문 생성에 실패했습니다.\n\n에러: ${data.message || "주문 처리에 실패했습니다."}\n\n고객센터로 문의해주세요. 결제 내역은 확인 가능합니다.`);
              // 주문 목록 페이지로 이동하여 결제 내역 확인 가능하도록
              navigate("/orders");
            }
          } catch (error) {
            console.error("주문 처리 오류:", error);
            // 결제는 성공했지만 주문 생성 실패 - 재시도 안내
            alert("결제는 완료되었지만 주문 생성 중 오류가 발생했습니다.\n\n고객센터로 문의해주세요. 결제 내역은 확인 가능합니다.");
            navigate("/orders");
          }
        } else {
          // 결제 실패 - 주문 실패 페이지로 이동
          navigate(`/order/failure?error=${encodeURIComponent(rsp.error_msg || "결제에 실패했습니다.")}`);
        }
      }
    );
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
          주문 정보를 불러오는 중입니다...
        </div>
      </>
    );
  }

  if (error && !cart) {
    return (
      <>
        <Navbar user={user} onLogout={handleLogout} />
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <p>{error}</p>
          <button
            onClick={() => navigate("/cart")}
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
            장바구니로 돌아가기
          </button>
        </div>
      </>
    );
  }

  const displayCartItems = cart?.cart?.items || [];
  const displayTotalAmount = cart?.totalAmount || 0;
  // 배송비 계산 (30,000원 이상 무료, 미만 1원)
  const displayShippingFee = displayTotalAmount >= 30000 ? 0 : 1;
  const displayFinalTotal = displayTotalAmount + displayShippingFee;

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .checkout-page {
          width: 100%;
          min-height: 100vh;
          background-color: #f8f9fa;
        }
        .checkout-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .checkout-header {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 24px;
        }
        .checkout-title {
          font-size: 32px;
          font-weight: bold;
          color: #333;
          margin-bottom: 8px;
        }
        .checkout-subtitle {
          font-size: 16px;
          color: #666;
        }
        .checkout-content {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 24px;
        }
        .checkout-form-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .section-title {
          font-size: 20px;
          font-weight: bold;
          color: #333;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #f0f0f0;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }
        .form-label.required::after {
          content: " *";
          color: #dc3545;
        }
        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
        }
        .form-input:focus {
          outline: none;
          border-color: #ff69b4;
          box-shadow: 0 0 0 3px rgba(255, 105, 180, 0.1);
        }
        .form-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          min-height: 100px;
          resize: vertical;
          transition: all 0.2s;
          font-family: inherit;
        }
        .form-textarea:focus {
          outline: none;
          border-color: #ff69b4;
          box-shadow: 0 0 0 3px rgba(255, 105, 180, 0.1);
        }
        .checkout-summary {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          height: fit-content;
          position: sticky;
          top: 100px;
        }
        .order-items {
          margin-bottom: 20px;
        }
        .order-item {
          display: flex;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .order-item:last-child {
          border-bottom: none;
        }
        .order-item-image {
          width: 60px;
          height: 60px;
          border-radius: 6px;
          object-fit: cover;
          background: linear-gradient(135deg, #ffe4e9 0%, #ffb6c1 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        }
        .order-item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 6px;
        }
        .order-item-info {
          flex: 1;
        }
        .order-item-name {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }
        .order-item-details {
          font-size: 12px;
          color: #999;
        }
        .order-item-price {
          font-size: 14px;
          font-weight: 600;
          color: #333;
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
        .submit-btn {
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
        .submit-btn:hover:not(:disabled) {
          background: #c82333;
        }
        .submit-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .error-message {
          background: #fff3cd;
          border: 1px solid #ffc107;
          color: #856404;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
        }
        @media (max-width: 968px) {
          .checkout-content {
            grid-template-columns: 1fr;
          }
          .checkout-summary {
            position: static;
          }
        }
      `}</style>
      <div className="checkout-page">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="checkout-container">
          <div className="checkout-header">
            <h1 className="checkout-title">주문하기</h1>
            <p className="checkout-subtitle">배송 정보를 입력하고 주문을 완료하세요</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="checkout-content">
              <div className="checkout-form-section">
                <h2 className="section-title">배송 정보</h2>

                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                  <label className="form-label required" htmlFor="recipientName">
                    수령인 이름
                  </label>
                  <input
                    type="text"
                    id="recipientName"
                    name="recipientName"
                    className="form-input"
                    value={formData.recipientName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required" htmlFor="recipientPhone">
                    수령인 연락처
                  </label>
                  <input
                    type="tel"
                    id="recipientPhone"
                    name="recipientPhone"
                    className="form-input"
                    value={formData.recipientPhone}
                    onChange={handleInputChange}
                    placeholder="010-1234-5678"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required" htmlFor="shippingAddress">
                    배송지 주소
                  </label>
                  <input
                    type="text"
                    id="shippingAddress"
                    name="shippingAddress"
                    className="form-input"
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    placeholder="서울시 강남구 테헤란로 123"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="notes">
                    배송 메시지 (선택사항)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    className="form-textarea"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="배송 시 요청사항을 입력해주세요"
                  />
                </div>
              </div>

              <div className="checkout-summary">
                <h2 className="section-title">주문 요약</h2>

                <div className="order-items">
                  {displayCartItems.map((item) => {
                    const product = item.product;
                    const itemTotal = product.price * item.quantity;

                    return (
                      <div key={item._id || product._id} className="order-item">
                        <div className="order-item-image">
                          {product.image ? (
                            <img src={product.image} alt={product.name} />
                          ) : (
                            <span>🛍️</span>
                          )}
                        </div>
                        <div className="order-item-info">
                          <div className="order-item-name">{product.name}</div>
                          <div className="order-item-details">
                            {item.quantity}개 × {product.price.toLocaleString()}원
                          </div>
                        </div>
                        <div className="order-item-price">
                          {itemTotal.toLocaleString()}원
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="summary-row">
                  <span className="summary-label">상품 금액</span>
                  <span className="summary-value">
                    {displayTotalAmount.toLocaleString()}원
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">배송비</span>
                  <span className="summary-value">
                    {displayShippingFee === 0 ? "무료" : `${displayShippingFee.toLocaleString()}원`}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#999", marginTop: "-8px", marginBottom: "12px", textAlign: "right" }}>
                  30,000원 이상: 무료(0원) / 30,000원 미만: 1원
                </div>
                <div className="summary-total">
                  <span className="summary-total-label">총 결제금액</span>
                  <span className="summary-total-value">
                    {displayFinalTotal.toLocaleString()}원
                  </span>
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={submitting || displayCartItems.length === 0}
                >
                  {submitting ? "주문 처리 중..." : "주문하기"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default CheckoutPage;

