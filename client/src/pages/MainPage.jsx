import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";
import Navbar from "./Navbar";

const FALLBACK_SPECIAL_PRODUCTS = [
  {
    _id: "fallback-special-1",
    name: "특가 수박 젤리",
    price: 12000,
    originalPrice: 18000,
    emoji: "🍬",
  },
  {
    _id: "fallback-special-2",
    name: "특가 곰 구미",
    price: 12000,
    originalPrice: 18000,
    emoji: "🧸",
  },
];

const FALLBACK_BEST_PRODUCTS = [
  {
    _id: "fallback-best-1",
    name: "베스트 과일 젤리",
    price: 15000,
    originalPrice: 20000,
    emoji: "🍬",
  },
  {
    _id: "fallback-best-2",
    name: "베스트 초콜릿 젤리빈",
    price: 16000,
    originalPrice: 22000,
    emoji: "🫘",
  },
  {
    _id: "fallback-best-3",
    name: "베스트 딸기 젤리빈",
    price: 17000,
    originalPrice: 23000,
    emoji: "🫘",
  },
  {
    _id: "fallback-best-4",
    name: "베스트 곰 구미",
    price: 14000,
    originalPrice: 19000,
    emoji: "🧸",
  },
];

const FALLBACK_NEW_PRODUCTS = [
  {
    _id: "fallback-new-1",
    name: "신상 수박 젤리",
    price: 18000,
    emoji: "🍬",
  },
  {
    _id: "fallback-new-2",
    name: "신상 복숭아 젤리빈",
    price: 19000,
    emoji: "🫘",
  },
  {
    _id: "fallback-new-3",
    name: "신상 하트 구미",
    price: 20000,
    emoji: "🧸",
  },
  {
    _id: "fallback-new-4",
    name: "신상 별 구미",
    price: 21000,
    emoji: "🧸",
  },
];

function MainPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");

  // 유저 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        return;
      }

      try {
        const response = await fetch(`${API_ENDPOINTS.USERS}/me`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setUser(data.data);
        } else {
          clearAuthData();
        }
      } catch (error) {
        console.error("유저 정보 가져오기 오류:", error);
        clearAuthData();
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      setProductError("");

      try {
        const response = await fetch(`${API_ENDPOINTS.PRODUCTS}?page=1&limit=100`);
        const data = await response.json();

        if (response.ok && data.success) {
          const fetchedProducts = Array.isArray(data.data) ? data.data : [];
          setProducts(fetchedProducts);
        } else {
          setProductError(data.message || "상품 정보를 불러오지 못했습니다.");
        }
      } catch (error) {
        console.error("상품 정보 가져오기 오류:", error);
        setProductError("상품 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  const { specialProducts, bestProducts, newProducts } = useMemo(() => {
    if (products.length === 0) {
      return {
        specialProducts: FALLBACK_SPECIAL_PRODUCTS,
        bestProducts: FALLBACK_BEST_PRODUCTS,
        newProducts: FALLBACK_NEW_PRODUCTS,
        hasRealData: false,
      };
    }

    const special = products.slice(0, 2);
    const best = products.slice(2, 6);
    const new_products = products.slice(6, 10);

    return {
      specialProducts: special.length > 0 ? special : FALLBACK_SPECIAL_PRODUCTS,
      bestProducts: best.length > 0 ? best : FALLBACK_BEST_PRODUCTS,
      newProducts: new_products.length > 0 ? new_products : FALLBACK_NEW_PRODUCTS,
      hasRealData: true,
    };
  }, [products]);

  // localStorage 정리 함수
  const clearAuthData = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  // 로그아웃 처리
  const handleLogout = useCallback(() => {
    clearAuthData();
    setUser(null);
    window.location.href = "/";
  }, [clearAuthData]);

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .main-page {
          width: 100%;
          min-height: 100vh;
          background-color: #fff;
        }
        /* Hero Section */
        .hero-section {
          background: linear-gradient(135deg, #ffe4e9 0%, #ffb6c1 100%);
          padding: 60px 20px;
          text-align: center;
        }
        .hero-content {
          max-width: 1200px;
          margin: 0 auto;
        }
        .hero-title {
          font-size: 48px;
          font-weight: bold;
          color: #fff;
          margin-bottom: 20px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }
        .hero-subtitle {
          font-size: 20px;
          color: #fff;
          opacity: 0.9;
        }
        /* Product Sections */
        .product-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 60px 20px;
        }
        .section-title {
          font-size: 28px;
          font-weight: bold;
          color: #333;
          margin-bottom: 30px;
          text-align: center;
        }
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 30px;
        }
        .product-grid.special-grid {
          display: flex;
          justify-content: center;
          gap: 30px;
          flex-wrap: wrap;
        }
        .product-grid.special-grid .product-card {
          max-width: 300px;
          flex: 0 0 auto;
        }
        .product-card {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
        }
        .product-image {
          width: 100%;
          height: 250px;
          background: linear-gradient(135deg, #ffe4e9 0%, #ffb6c1 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
        }
        .product-info {
          padding: 20px;
        }
        .product-name {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 10px;
        }
        .product-price {
          font-size: 20px;
          font-weight: bold;
          color: #ff69b4;
        }
        .product-price-original {
          font-size: 16px;
          color: #999;
          text-decoration: line-through;
          margin-right: 8px;
        }
        /* Footer */
        .footer {
          background-color: #333;
          color: #fff;
          padding: 40px 20px;
          text-align: center;
          margin-top: 60px;
        }
      `}</style>
      <div className="main-page">
        <Navbar user={user} onLogout={handleLogout} />

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">어흥! '젤리사자'에서 젤리 사자!</h1>
            <p className="hero-subtitle">새콤달콤한 젤리를 만나보세요</p>
          </div>
        </section>

        {/* Product Sections */}
        <section className="product-section">
          <h2 className="section-title">특가 상품</h2>
          {isLoadingProducts ? (
            <div style={{ textAlign: "center", color: "#666" }}>상품 정보를 불러오는 중입니다...</div>
          ) : productError ? (
            <div style={{ textAlign: "center", color: "#dc3545" }}>{productError}</div>
          ) : (
            <div className="product-grid special-grid">
              {specialProducts.map((product) => (
                <div
                  key={product._id || product.id}
                  className="product-card"
                  onClick={() => {
                    const productId = product._id || product.id;
                    navigate(`/products/${productId}`);
                  }}
                >
                  <div className="product-image">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      product.emoji || "🔥"
                    )}
                  </div>
                  <div className="product-info">
                    <div className="product-name">{product.name}</div>
                    <div className="product-price">
                      {product.originalPrice && (
                        <span className="product-price-original">
                          {product.originalPrice.toLocaleString()}원
                        </span>
                      )}
                      <span>
                        {(typeof product.price === "number" ? product.price : 0).toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="product-section">
          <h2 className="section-title">베스트 상품</h2>
          {isLoadingProducts ? (
            <div style={{ textAlign: "center", color: "#666" }}>상품 정보를 불러오는 중입니다...</div>
          ) : productError ? (
            <div style={{ textAlign: "center", color: "#dc3545" }}>{productError}</div>
          ) : (
            <div className="product-grid">
              {bestProducts.map((product) => (
                <div
                  key={product._id || product.id}
                  className="product-card"
                  onClick={() => {
                    const productId = product._id || product.id;
                    navigate(`/products/${productId}`);
                  }}
                >
                  <div className="product-image">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      product.emoji || "🛍️"
                    )}
                  </div>
                  <div className="product-info">
                    <div className="product-name">{product.name}</div>
                    <div className="product-price">
                      {product.originalPrice && (
                        <span className="product-price-original">
                          {product.originalPrice.toLocaleString()}원
                        </span>
                      )}
                      <span>
                        {(typeof product.price === "number" ? product.price : 0).toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="product-section">
          <h2 className="section-title">신상품</h2>
          {isLoadingProducts ? (
            <div style={{ textAlign: "center", color: "#666" }}>상품 정보를 불러오는 중입니다...</div>
          ) : productError ? (
            <div style={{ textAlign: "center", color: "#dc3545" }}>{productError}</div>
          ) : (
            <div className="product-grid">
              {newProducts.map((product) => {
                const productId = product._id || product.id;
                return (
                <div
                  key={productId}
                  className="product-card"
                  onClick={() => navigate(`/products/${productId}`)}
                >
                  <div className="product-image">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      product.emoji || "✨"
                    )}
                  </div>
                  <div className="product-info">
                    <div className="product-name">{product.name}</div>
                    <div className="product-price">
                      {(typeof product.price === "number" ? product.price : 0).toLocaleString()}원
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="footer">
          <p>&copy; 2024 쇼핑몰. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}

export default MainPage;
