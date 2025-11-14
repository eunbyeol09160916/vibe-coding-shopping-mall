import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";
import Navbar from "./Navbar";

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("detail");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

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
        }
      } catch (error) {
        console.error("유저 정보 가져오기 오류:", error);
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_ENDPOINTS.PRODUCTS}/${id}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setProduct(data.data);
        } else {
          setError(data.message || "상품을 찾을 수 없습니다.");
        }
      } catch (error) {
        console.error("상품 정보 가져오기 오류:", error);
        setError("상품 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    if (!product || !product._id) {
      alert("상품 정보를 불러올 수 없습니다.");
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.CART}/items`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: quantity,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(`장바구니에 ${quantity}개가 추가되었습니다.`);
        // 페이지 새로고침하여 Navbar의 장바구니 아이템 수 업데이트
        window.location.reload();
      } else {
        alert(data.message || "장바구니에 상품을 추가하는데 실패했습니다.");
      }
    } catch (error) {
      console.error("장바구니 추가 오류:", error);
      alert("장바구니에 상품을 추가하는데 실패했습니다.");
    }
  };

  const handleBuyNow = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    if (!product || !product._id) {
      alert("상품 정보를 불러올 수 없습니다.");
      return;
    }

    try {
      // 장바구니에 상품 추가
      const response = await fetch(`${API_ENDPOINTS.CART}/items`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: quantity,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 장바구니에 추가 후 바로 주문 페이지로 이동
        navigate("/checkout");
      } else {
        alert(data.message || "장바구니에 상품을 추가하는데 실패했습니다.");
      }
    } catch (error) {
      console.error("바로구매 오류:", error);
      alert("바로구매 처리에 실패했습니다.");
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
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        상품 정보를 불러오는 중입니다...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <p>{error || "상품을 찾을 수 없습니다."}</p>
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
    );
  }

  const totalPrice = (product.price || 0) * quantity;

  // 상품별 맞춤 콘텐츠 생성 함수
  const getProductCustomContent = () => {
    const productName = product.name?.toLowerCase() || "";
    const category = product.category || "";

    // 복숭아/피치 관련 상품
    if (productName.includes("복숭아") || productName.includes("피치") || productName.includes("peach")) {
      return {
        subtitle: "Peach Heart",
        description: [
          "내 맘 피치피치해~",
          "달콤한 사랑의 미음을 러블리한 복숭아향 히트로~!",
          "반쪽은 복숭아색~반쪽은 빨간색~",
          "설레는 하트모양을 잘 표현한 색감까지!"
        ],
        icons: "🍑❤️🍑❤️🍑",
        hashtags: ["#복숭아향", "#천연향", "#쫄깃쫄깃"],
        checkpointIcons: [
          { icon: "🍬", label: "단맛" },
          { icon: "🍋", label: "신맛" },
          { icon: "🍑", label: "과일맛", active: true },
          { icon: "🌿", label: "유기농" },
          { icon: "🌸", label: "천연향" },
          { icon: "🎨", label: "천연색소" },
        ],
        largeIcons: [
          { icon: "🍑", label: "복숭아향" },
          { icon: "❤️", label: "하트 모양" },
        ]
      };
    }

    // 사우어/신맛 관련 상품
    if (productName.includes("사우어") || productName.includes("sour") || productName.includes("신맛")) {
      return {
        subtitle: "Sour Mix",
        description: [
          "톡 쏘는 신맛이 일품이에요!",
          "달콤함과 신맛의 완벽한 조화~",
          "입안 가득 퍼지는 상큼한 맛!",
          "다양한 과일 맛을 한 번에 즐겨보세요!"
        ],
        icons: "🍋🍊🍇🍓🍒",
        hashtags: ["#신맛", "#상큼한맛", "#과일믹스"],
        checkpointIcons: [
          { icon: "🍋", label: "신맛", active: true },
          { icon: "🍬", label: "단맛" },
          { icon: "🍊", label: "과일맛" },
          { icon: "🌿", label: "천연향" },
          { icon: "💧", label: "촉촉함" },
          { icon: "🎨", label: "천연색소" },
        ],
        largeIcons: [
          { icon: "🍋", label: "신맛" },
          { icon: "🍊", label: "과일믹스" },
        ]
      };
    }

    // 후르츠믹스/과일믹스 관련 상품
    if (productName.includes("후르츠") || productName.includes("과일") || productName.includes("fruit") || productName.includes("믹스")) {
      return {
        subtitle: "Fruit Mix",
        description: [
          "다양한 과일 맛을 한 번에!",
          "상큼하고 달콤한 과일의 향연~",
          "각기 다른 과일 맛이 입안에서 터져요!",
          "자연 그대로의 과일 맛을 느껴보세요!"
        ],
        icons: "🍓🍊🍇🍑🍒🍋",
        hashtags: ["#과일믹스", "#다양한맛", "#상큼한맛"],
        checkpointIcons: [
          { icon: "🍓", label: "딸기맛" },
          { icon: "🍊", label: "오렌지맛" },
          { icon: "🍇", label: "포도맛", active: true },
          { icon: "🍑", label: "복숭아맛" },
          { icon: "🌿", label: "천연향" },
          { icon: "💧", label: "촉촉함" },
        ],
        largeIcons: [
          { icon: "🍓", label: "과일믹스" },
          { icon: "🍊", label: "다양한맛" },
        ]
      };
    }

    // 카테고리별 기본 콘텐츠
    if (category === "젤리빈") {
      return {
        subtitle: "Jelly Bean",
        description: [
          "알록달록 예쁜 젤리빈!",
          "한 알 한 알 씹는 재미가 있어요~",
          "다양한 색깔과 맛을 즐겨보세요!",
          "달콤하고 쫄깃한 식감이 일품이에요!"
        ],
        icons: "🍬🍬🍬🍬🍬",
        hashtags: ["#젤리빈", "#알록달록", "#쫄깃쫄깃"],
        checkpointIcons: [
          { icon: "🍬", label: "단맛", active: true },
          { icon: "🎨", label: "다양한색" },
          { icon: "💫", label: "쫄깃함" },
          { icon: "🌿", label: "천연향" },
          { icon: "🍭", label: "달콤함" },
          { icon: "✨", label: "특별함" },
        ],
        largeIcons: [
          { icon: "🍬", label: "젤리빈" },
          { icon: "🎨", label: "다양한맛" },
        ]
      };
    }

    if (category === "구미") {
      return {
        subtitle: "Gummy",
        description: [
          "부드럽고 쫄깃한 구미!",
          "입안에서 사르르 녹는 부드러운 식감~",
          "달콤한 맛이 오래 지속돼요!",
          "다양한 모양과 맛을 즐겨보세요!"
        ],
        icons: "🐻🍬💫✨🌟",
        hashtags: ["#구미", "#부드러움", "#쫄깃쫄깃"],
        checkpointIcons: [
          { icon: "🍬", label: "단맛", active: true },
          { icon: "💫", label: "쫄깃함" },
          { icon: "🌿", label: "천연향" },
          { icon: "🍭", label: "달콤함" },
          { icon: "✨", label: "부드러움" },
          { icon: "🎨", label: "다양한모양" },
        ],
        largeIcons: [
          { icon: "🐻", label: "구미" },
          { icon: "💫", label: "쫄깃함" },
        ]
      };
    }

    if (category === "젤리") {
      return {
        subtitle: "Jelly",
        description: [
          "부드럽고 달콤한 젤리!",
          "입안에서 사르르 녹는 부드러운 식감~",
          "상큼하고 달콤한 맛이 일품이에요!",
          "다양한 과일 맛을 즐겨보세요!"
        ],
        icons: "🍮🍑🍓🍊💫",
        hashtags: ["#젤리", "#부드러움", "#달콤함"],
        checkpointIcons: [
          { icon: "🍬", label: "단맛", active: true },
          { icon: "🍑", label: "과일맛" },
          { icon: "💫", label: "부드러움" },
          { icon: "🌿", label: "천연향" },
          { icon: "🍭", label: "달콤함" },
          { icon: "✨", label: "특별함" },
        ],
        largeIcons: [
          { icon: "🍮", label: "젤리" },
          { icon: "🍑", label: "과일맛" },
        ]
      };
    }

    // 기본 콘텐츠
    return {
      subtitle: "Delicious",
      description: [
        "달콤하고 맛있는 젤리!",
        "입안 가득 퍼지는 달콤한 맛~",
        "부드럽고 쫄깃한 식감이 일품이에요!",
        "다양한 맛을 즐겨보세요!"
      ],
      icons: "🍬🍭💫✨🌟",
      hashtags: ["#달콤함", "#쫄깃쫄깃", "#맛있어요"],
      checkpointIcons: [
        { icon: "🍬", label: "단맛", active: true },
        { icon: "💫", label: "쫄깃함" },
        { icon: "🌿", label: "천연향" },
        { icon: "🍭", label: "달콤함" },
        { icon: "✨", label: "부드러움" },
        { icon: "🎨", label: "다양한맛" },
      ],
      largeIcons: [
        { icon: "🍬", label: "달콤함" },
        { icon: "💫", label: "쫄깃함" },
      ]
    };
  };

  const customContent = getProductCustomContent();

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .product-detail-page {
          width: 100%;
          min-height: 100vh;
          background-color: #fff;
        }
        /* Header Banner */
        .header-banner {
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          padding: 40px 20px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .header-banner::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 20px,
            rgba(255, 182, 193, 0.1) 20px,
            rgba(255, 182, 193, 0.1) 40px
          );
        }
        .header-banner-text {
          position: relative;
          z-index: 1;
          font-size: 32px;
          font-weight: bold;
          color: white;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }
        /* Product Section */
        .product-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .product-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 60px;
        }
        .product-image-container {
          background: #fff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .product-image {
          width: 100%;
          height: 500px;
          object-fit: contain;
          background: linear-gradient(135deg, #ffe4e9 0%, #ffb6c1 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 120px;
        }
        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .product-info {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .product-name {
          font-size: 32px;
          font-weight: bold;
          color: #333;
        }
        .product-description {
          font-size: 16px;
          color: #666;
          line-height: 1.6;
        }
        .product-price-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .product-price-main {
          font-size: 36px;
          font-weight: bold;
          color: #333;
        }
        .product-price-label {
          font-size: 14px;
          color: #666;
        }
        .quantity-selector {
          display: flex;
          align-items: center;
          gap: 15px;
          margin: 20px 0;
        }
        .quantity-btn {
          width: 40px;
          height: 40px;
          border: 1px solid #ddd;
          background: #fff;
          border-radius: 5px;
          cursor: pointer;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .quantity-btn:hover {
          background: #f5f5f5;
        }
        .quantity-input {
          width: 80px;
          height: 40px;
          text-align: center;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 16px;
        }
        .total-price {
          font-size: 20px;
          font-weight: 600;
          color: #333;
          margin: 20px 0;
        }
        .action-buttons {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        .btn-wishlist {
          width: 50px;
          height: 50px;
          border: 1px solid #ddd;
          background: #fff;
          border-radius: 5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        .btn-wishlist:hover {
          background: #ffe4e9;
        }
        .btn-cart {
          flex: 1;
          height: 50px;
          background: #000;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-cart:hover {
          background: #333;
        }
        .btn-buy-now {
          flex: 1;
          height: 50px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-buy-now:hover {
          background: #c82333;
        }
        /* Tabs */
        .product-tabs {
          border-bottom: 2px solid #e0e0e0;
          margin-bottom: 30px;
        }
        .tabs-list {
          display: flex;
          gap: 0;
          max-width: 1200px;
          margin: 0 auto;
        }
        .tab {
          padding: 15px 30px;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-size: 16px;
          color: #666;
          transition: all 0.3s;
        }
        .tab.active {
          color: #ff69b4;
          border-bottom-color: #ff69b4;
          font-weight: 600;
        }
        .tab:hover {
          color: #ff69b4;
        }
        .tab-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        /* Brand Section */
        .brand-section {
          background: #f8f9fa;
          padding: 40px;
          border-radius: 12px;
          margin-bottom: 40px;
        }
        .brand-icons {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        }
        .brand-icon {
          width: 100%;
          aspect-ratio: 1;
          background: linear-gradient(135deg, #ffe4e9 0%, #ffb6c1 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
        }
        .brand-text {
          font-size: 16px;
          line-height: 1.8;
          color: #333;
          margin-bottom: 20px;
        }
        .brand-search {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .brand-search-input {
          flex: 1;
          padding: 10px 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .brand-search-btn {
          padding: 10px 20px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        /* Warning Section */
        .warning-section {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px 20px;
          margin-bottom: 40px;
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }
        .warning-icon {
          font-size: 24px;
          color: #dc3545;
        }
        .warning-text {
          flex: 1;
          font-size: 14px;
          color: #856404;
          line-height: 1.6;
        }
        /* Pattern Background */
        .pattern-section {
          background: #ffd700;
          padding: 60px 20px;
          margin: 40px 0;
          position: relative;
          overflow: hidden;
        }
        .pattern-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 30px,
            rgba(255, 182, 193, 0.2) 30px,
            rgba(255, 182, 193, 0.2) 60px
          );
        }
        .pattern-content {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }
        .product-feature-title {
          font-size: 48px;
          font-weight: bold;
          color: #333;
          margin-bottom: 20px;
        }
        .product-feature-subtitle {
          font-size: 24px;
          color: #666;
          margin-bottom: 30px;
        }
        .product-feature-text {
          font-size: 18px;
          color: #333;
          line-height: 1.8;
          margin-bottom: 20px;
        }
        /* Check Point Section */
        .checkpoint-section {
          background: #fff;
          padding: 40px;
          border-radius: 12px;
          margin-bottom: 40px;
        }
        .checkpoint-title {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin-bottom: 20px;
        }
        .checkpoint-hashtags {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        .hashtag {
          color: #ff69b4;
          font-size: 14px;
        }
        .checkpoint-icons {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        .checkpoint-icon {
          text-align: center;
        }
        .checkpoint-icon-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px;
          font-size: 32px;
          border: 2px solid transparent;
        }
        .checkpoint-icon-circle.active {
          border-color: #dc3545;
          background: #ffe4e9;
        }
        .checkpoint-icon-label {
          font-size: 14px;
          color: #333;
        }
        .checkpoint-large-icons {
          display: flex;
          gap: 30px;
          justify-content: center;
        }
        .checkpoint-large-icon {
          text-align: center;
        }
        .checkpoint-large-icon-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffe4e9 0%, #ffb6c1 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px;
          font-size: 48px;
        }
        .checkpoint-large-icon-label {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .header-banner {
            padding: 30px 16px;
          }
          .header-banner-text {
            font-size: 24px;
          }
          .product-section {
            padding: 20px 16px;
          }
          .product-container {
            grid-template-columns: 1fr;
            gap: 24px;
            margin-bottom: 40px;
          }
          .product-image {
            height: 350px;
            font-size: 80px;
          }
          .product-name {
            font-size: 24px;
          }
          .product-description {
            font-size: 14px;
          }
          .product-price-main {
            font-size: 28px;
          }
          .product-price-label {
            font-size: 13px;
          }
          .quantity-selector {
            gap: 12px;
            margin: 16px 0;
          }
          .quantity-btn {
            width: 36px;
            height: 36px;
            font-size: 18px;
          }
          .quantity-input {
            width: 70px;
            height: 36px;
            font-size: 14px;
          }
          .total-price {
            font-size: 18px;
            margin: 16px 0;
          }
          .action-buttons {
            flex-direction: column;
            gap: 8px;
          }
          .btn-wishlist {
            width: 100%;
            height: 45px;
          }
          .btn-cart,
          .btn-buy-now {
            height: 45px;
            font-size: 15px;
          }
          .tabs-list {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .tab {
            padding: 12px 20px;
            font-size: 14px;
            white-space: nowrap;
          }
          .tab-content {
            padding: 30px 16px;
          }
          .brand-section {
            padding: 24px 16px;
          }
          .brand-icons {
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 20px;
          }
          .brand-icon {
            font-size: 32px;
          }
          .brand-text {
            font-size: 14px;
            margin-bottom: 16px;
          }
          .brand-search {
            flex-direction: column;
          }
          .brand-search-input {
            width: 100%;
          }
          .warning-section {
            padding: 12px 16px;
            margin-bottom: 30px;
          }
          .warning-text {
            font-size: 13px;
          }
          .pattern-section {
            padding: 40px 16px;
            margin: 30px 0;
          }
          .product-feature-title {
            font-size: 32px;
            margin-bottom: 16px;
          }
          .product-feature-subtitle {
            font-size: 20px;
            margin-bottom: 20px;
          }
          .product-feature-text {
            font-size: 16px;
            margin-bottom: 16px;
          }
          .checkpoint-section {
            padding: 24px 16px;
          }
          .checkpoint-title {
            font-size: 20px;
            margin-bottom: 16px;
          }
          .checkpoint-hashtags {
            gap: 8px;
            margin-bottom: 20px;
          }
          .hashtag {
            font-size: 13px;
          }
          .checkpoint-icons {
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 20px;
          }
          .checkpoint-icon-circle {
            width: 60px;
            height: 60px;
            font-size: 24px;
          }
          .checkpoint-icon-label {
            font-size: 12px;
          }
          .checkpoint-large-icons {
            gap: 20px;
            flex-wrap: wrap;
          }
          .checkpoint-large-icon-circle {
            width: 100px;
            height: 100px;
            font-size: 40px;
          }
          .checkpoint-large-icon-label {
            font-size: 14px;
          }
        }
        @media (max-width: 480px) {
          .header-banner-text {
            font-size: 20px;
          }
          .product-name {
            font-size: 20px;
          }
          .product-price-main {
            font-size: 24px;
          }
          .product-feature-title {
            font-size: 28px;
          }
          .product-feature-subtitle {
            font-size: 18px;
          }
          .checkpoint-icons {
            grid-template-columns: repeat(2, 1fr);
          }
          .checkpoint-large-icons {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
      <div className="product-detail-page">
        <Navbar user={user} onLogout={handleLogout} />

        {/* Header Banner */}
        <div className="header-banner">
          <div className="header-banner-text">JELLY & GUMMY</div>
        </div>

        {/* Product Section */}
        <div className="product-section">
          <div className="product-container">
            <div className="product-image-container">
              <div className="product-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <span>🍑</span>
                )}
              </div>
            </div>
            <div className="product-info">
              <h1 className="product-name">{product.name}</h1>
              <p className="product-description">
                {product.description || "달콤한 사랑을 전할 수 있는 기시아드미"}
              </p>
              <div className="product-price-section">
                <div className="product-price-main">
                  {product.price?.toLocaleString()}원
                </div>
                <div className="product-price-label">
                  판매가 {product.price?.toLocaleString()}원
                </div>
              </div>
              <div className="quantity-selector">
                <button
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(-1)}
                >
                  -
                </button>
                <input
                  type="number"
                  className="quantity-input"
                  value={quantity}
                  readOnly
                />
                <button
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(1)}
                >
                  +
                </button>
              </div>
              <div className="total-price">총 {totalPrice.toLocaleString()}원</div>
              <div className="action-buttons">
                <button className="btn-wishlist">❤️</button>
                <button className="btn-cart" onClick={handleAddToCart}>
                  장바구니에 추가
                </button>
                <button className="btn-buy-now" onClick={handleBuyNow}>
                  바로구매
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="product-tabs">
          <div className="tabs-list">
            <button
              className={`tab ${activeTab === "detail" ? "active" : ""}`}
              onClick={() => setActiveTab("detail")}
            >
              상품상세
            </button>
            <button
              className={`tab ${activeTab === "review" ? "active" : ""}`}
              onClick={() => setActiveTab("review")}
            >
              상품후기
            </button>
            <button
              className={`tab ${activeTab === "inquiry" ? "active" : ""}`}
              onClick={() => setActiveTab("inquiry")}
            >
              상품문의
            </button>
            <button
              className={`tab ${activeTab === "shipping" ? "active" : ""}`}
              onClick={() => setActiveTab("shipping")}
            >
              배송/교환/반품
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "detail" && (
            <>
              {/* Brand Section */}
              <div className="brand-section">
                <div className="brand-icons">
                  {["🍭", "🍪", "🍬", "🍫", "🍰", "🧁", "🍡", "🍯"].map(
                    (icon, idx) => (
                      <div key={idx} className="brand-icon">
                        {icon}
                      </div>
                    )
                  )}
                </div>
                <div className="brand-text">
                  <strong>Jelly Saja</strong>는 고품질의 젤리를 제공하며,
                  고객 만족을 최우선으로 생각합니다.
                </div>
                <div className="brand-search">
                  <input
                    type="text"
                    className="brand-search-input"
                    placeholder="검색창에 젤리사자"
                    defaultValue="젤리사자"
                  />
                  <button className="brand-search-btn">검색</button>
                </div>
                <p style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
                  검색하시면 온라인 매장에서 더 많은 상품을 보실 수 있습니다.
                </p>
              </div>

              {/* Warning Section */}
              <div className="warning-section">
                <div className="warning-icon">⚠️</div>
                <div className="warning-text">
                  상품은 신중하게 포장되어 배송되지만, 캔디의 특성상 배송 중
                  미세한 손상(파손, 균열, 인쇄 불량 등)이 발생할 수 있으며,
                  이는 무료 교환/반품 사유가 되지 않습니다.
                </div>
              </div>

              {/* Pattern Section */}
              <div className="pattern-section">
                <div className="pattern-content">
                  <div className="product-feature-title">
                    {product.name || "상품명"}
                  </div>
                  <div className="product-feature-subtitle">{customContent.subtitle}</div>
                  <div className="product-feature-text">
                    {customContent.description.map((line, idx) => (
                      <span key={idx}>
                        {line}
                        {idx < customContent.description.length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                  <div style={{ fontSize: "60px", marginTop: "20px" }}>
                    {customContent.icons}
                  </div>
                </div>
              </div>

              {/* Check Point Section */}
              <div className="checkpoint-section">
                <div className="checkpoint-title">Weeny Beeny Check Point</div>
                <div className="checkpoint-hashtags">
                  {customContent.hashtags.map((tag, idx) => (
                    <span key={idx} className="hashtag">{tag}</span>
                  ))}
                </div>
                <div className="checkpoint-icons">
                  {customContent.checkpointIcons.map((item, idx) => (
                    <div key={idx} className="checkpoint-icon">
                      <div
                        className={`checkpoint-icon-circle ${
                          item.active ? "active" : ""
                        }`}
                      >
                        {item.icon}
                      </div>
                      <div className="checkpoint-icon-label">{item.label}</div>
                    </div>
                  ))}
                </div>
                <div className="checkpoint-large-icons">
                  {customContent.largeIcons.map((item, idx) => (
                    <div key={idx} className="checkpoint-large-icon">
                      <div className="checkpoint-large-icon-circle">{item.icon}</div>
                      <div className="checkpoint-large-icon-label">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Product Image */}
              <div
                style={{
                  textAlign: "center",
                  marginTop: "40px",
                  padding: "40px",
                  background: "#f8f9fa",
                  borderRadius: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "120px",
                    marginBottom: "20px",
                  }}
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        borderRadius: "12px",
                      }}
                    />
                  ) : (
                    "🍑❤️🍑❤️🍑"
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "review" && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <p style={{ fontSize: "18px", color: "#666" }}>
                상품 후기가 아직 없습니다.
              </p>
            </div>
          )}

          {activeTab === "inquiry" && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <p style={{ fontSize: "18px", color: "#666" }}>
                상품 문의가 아직 없습니다.
              </p>
            </div>
          )}

          {activeTab === "shipping" && (
            <div style={{ padding: "40px", background: "#f8f9fa", borderRadius: "12px" }}>
              <h3 style={{ marginBottom: "20px", fontSize: "20px" }}>배송 정보</h3>
              <p style={{ marginBottom: "15px", lineHeight: "1.8" }}>
                • 배송 기간: 주문 후 2-3일 소요됩니다.
              </p>
              <p style={{ marginBottom: "15px", lineHeight: "1.8" }}>
                • 배송비: 30,000원 이상 구매 시 무료(0원), 30,000원 미만 구매 시 1원
              </p>
              <h3 style={{ marginTop: "30px", marginBottom: "20px", fontSize: "20px" }}>
                교환/반품 안내
              </h3>
              <p style={{ marginBottom: "15px", lineHeight: "1.8" }}>
                • 교환/반품 기간: 상품 수령 후 7일 이내
              </p>
              <p style={{ marginBottom: "15px", lineHeight: "1.8" }}>
                • 단순 변심에 의한 교환/반품 시 배송비는 고객 부담입니다.
              </p>
              <p style={{ marginBottom: "15px", lineHeight: "1.8" }}>
                • 상품의 하자나 오배송의 경우 무료로 교환/반품이 가능합니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ProductDetailPage;

