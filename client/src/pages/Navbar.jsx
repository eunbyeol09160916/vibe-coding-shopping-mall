import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  const isAdmin = user?.user_type === 'admin';

  // 장바구니 아이템 수 가져오기
  useEffect(() => {
    const fetchCartItemCount = async () => {
      if (!user) {
        setCartItemCount(0);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setCartItemCount(0);
        return;
      }

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
          setCartItemCount(data.data.itemCount || 0);
        }
      } catch (error) {
        console.error("장바구니 정보 가져오기 오류:", error);
      }
    };

    fetchCartItemCount();
  }, [user]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.user-welcome-container')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    onLogout();
  };

  return (
    <>
      <style>{`
        .navbar {
          background-color: #ffb6c1;
          padding: 12px 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .navbar-brand {
          font-size: 24px;
          font-weight: bold;
          color: #fff;
          text-decoration: none;
          cursor: pointer;
        }
        .navbar-brand:hover {
          opacity: 0.9;
        }
        .navbar-center {
          flex: 1;
          display: flex;
          justify-content: center;
          margin: 0 40px;
        }
        .search-bar {
          width: 100%;
          max-width: 500px;
          padding: 10px 20px;
          border: none;
          border-radius: 25px;
          font-size: 14px;
          outline: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .navbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .nav-button {
          padding: 8px 16px;
          background-color: #fff;
          color: #ff69b4;
          border: none;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .nav-button:hover {
          background-color: #ffe4e9;
        }
        .user-welcome-container {
          position: relative;
        }
        .user-welcome-btn {
          padding: 8px 16px;
          background-color: transparent;
          color: #fff;
          border: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .user-welcome-btn:hover {
          opacity: 0.9;
        }
        .welcome-text {
          font-size: 14px;
          color: #fff;
          font-weight: 500;
        }
        .welcome-text strong {
          color: #fff;
          font-weight: 700;
        }
        .welcome-dropdown-arrow {
          font-size: 10px;
          transition: transform 0.2s;
        }
        .welcome-dropdown-arrow.open {
          transform: rotate(180deg);
        }
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background-color: white;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 120px;
          overflow: hidden;
          animation: slideDown 0.2s ease-out;
          z-index: 1000;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .dropdown-item {
          padding: 10px 16px;
          font-size: 14px;
          color: #333;
          cursor: pointer;
          transition: background-color 0.2s;
          border: none;
          width: 100%;
          text-align: left;
          background: none;
        }
        .dropdown-item:hover {
          background-color: #f8f9fa;
        }
        .dropdown-item.logout {
          color: #dc3545;
        }
        .dropdown-item.logout:hover {
          background-color: #fff5f5;
        }
        .cart-icon-button {
          position: relative;
          width: 45px;
          height: 45px;
          background-color: #ff8c00;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .cart-icon-button:hover {
          background-color: #ff7a00;
          transform: scale(1.05);
        }
        .cart-icon {
          width: 24px;
          height: 24px;
          fill: white;
        }
        .cart-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: #dc3545;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: bold;
          border: 2px solid #ffb6c1;
        }
      `}</style>
      <nav className="navbar">
        <div className="navbar-container">
          <a
            href="#"
            className="navbar-brand"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
          >
            젤리사자
          </a>
          <div className="navbar-center">
            <input
              type="text"
              className="search-bar"
              placeholder="상품을 검색해보세요..."
            />
          </div>
          <div className="navbar-right">
            {!user ? (
              <button
                className="nav-button"
                onClick={() => navigate("/login")}
              >
                로그인
              </button>
            ) : (
              <>
                <div className="user-welcome-container">
                  <button
                    className="user-welcome-btn"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <span className="welcome-text">
                      <strong>{user.name}</strong>님 환영합니다!
                    </span>
                    <span className={`welcome-dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>
                      ▼
                    </span>
                  </button>
                  {isDropdownOpen && (
                    <div className="dropdown-menu">
                      <button
                        className="dropdown-item logout"
                        onClick={handleLogout}
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
                <button
                  className="cart-icon-button"
                  onClick={() => navigate("/cart")}
                  title="장바구니"
                >
                  <svg className="cart-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.15.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-1.39-2.5H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                  {cartItemCount > 0 && (
                    <span className="cart-badge">{cartItemCount}</span>
                  )}
                </button>
                {!isAdmin && (
                  <button
                    className="nav-button"
                    onClick={() => navigate("/orders")}
                  >
                    주문 목록
                  </button>
                )}
                {isAdmin && (
                  <button
                    className="nav-button"
                    onClick={() => navigate("/admin")}
                  >
                    어드민 페이지
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;

