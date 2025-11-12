import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";
import Navbar from "./Navbar";

function OrderFailurePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // URL 파라미터에서 에러 메시지 가져오기
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setErrorMessage(decodeURIComponent(error));
    } else {
      setErrorMessage("주문 처리 중 오류가 발생했습니다.");
    }
  }, [searchParams]);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .order-failure-page {
          width: 100%;
          min-height: 100vh;
          background-color: #f8f9fa;
        }
        .order-failure-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .failure-card {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        .failure-icon {
          font-size: 80px;
          margin-bottom: 20px;
        }
        .failure-title {
          font-size: 32px;
          font-weight: bold;
          color: #dc3545;
          margin-bottom: 10px;
        }
        .failure-message {
          font-size: 18px;
          color: #666;
          margin-bottom: 30px;
          line-height: 1.6;
          padding: 20px;
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          border-radius: 8px;
          text-align: left;
        }
        .failure-details {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 30px 0;
          text-align: left;
        }
        .failure-details-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 10px;
        }
        .failure-details-text {
          font-size: 14px;
          color: #666;
          line-height: 1.6;
        }
        .action-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 30px;
          flex-wrap: wrap;
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
        .btn-outline {
          background: white;
          color: #dc3545;
          border: 2px solid #dc3545;
        }
        .btn-outline:hover {
          background: #dc3545;
          color: white;
        }
      `}</style>
      <div className="order-failure-page">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="order-failure-container">
          <div className="failure-card">
            <div className="failure-icon">❌</div>
            <h1 className="failure-title">주문에 실패했습니다</h1>
            <div className="failure-message">
              {errorMessage || "주문 처리 중 오류가 발생했습니다. 다시 시도해주세요."}
            </div>

            <div className="failure-details">
              <div className="failure-details-title">다음과 같은 경우 주문이 실패할 수 있습니다:</div>
              <div className="failure-details-text">
                • 결제 정보가 올바르지 않은 경우<br />
                • 네트워크 연결 문제가 발생한 경우<br />
                • 서버 오류가 발생한 경우<br />
                • 중복 주문이 감지된 경우<br />
                • 결제 검증에 실패한 경우
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn btn-primary" onClick={() => navigate("/cart")}>
                장바구니로 돌아가기
              </button>
              <button className="btn btn-secondary" onClick={() => navigate("/checkout")}>
                다시 주문하기
              </button>
              <button className="btn btn-outline" onClick={() => navigate("/")}>
                홈으로 가기
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default OrderFailurePage;

