import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../config/api";
import Navbar from "../Navbar";

function ProductCreatePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    price: "",
    category: "",
    image: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cloudinaryWidget, setCloudinaryWidget] = useState(null);

  // 유저 정보 및 권한 확인
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
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setUser(data.data);
          // 어드민 권한 확인
          if (data.data.user_type !== 'admin') {
            alert("어드민 권한이 필요합니다.");
            navigate("/");
            return;
          }
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("유저 정보 가져오기 오류:", error);
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  // Cloudinary 스크립트 로드 및 위젯 초기화
  useEffect(() => {
    // Cloudinary 스크립트가 이미 로드되었는지 확인
    if (window.cloudinary) {
      initializeWidget();
      return;
    }

    // Cloudinary 스크립트 로드
    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.async = true;
    script.onload = () => {
      initializeWidget();
    };
    document.body.appendChild(script);

    return () => {
      // 컴포넌트 언마운트 시 스크립트 제거 (선택사항)
    };
  }, []);

  const initializeWidget = () => {
    if (!window.cloudinary) return;

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    // 환경 변수가 설정되지 않은 경우 경고
    if (!cloudName || !uploadPreset || cloudName === 'your-cloud-name' || uploadPreset === 'your-upload-preset') {
      console.warn('Cloudinary 환경 변수가 설정되지 않았습니다. client/.env 파일을 생성하고 VITE_CLOUDINARY_CLOUD_NAME과 VITE_CLOUDINARY_UPLOAD_PRESET을 설정해주세요.');
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
        sources: ['local', 'camera', 'url'],
        multiple: false,
        maxFiles: 1,
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        maxFileSize: 5000000, // 5MB
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary 업로드 오류:', error);
          setErrors((prev) => ({
            ...prev,
            image: '이미지 업로드에 실패했습니다. Cloudinary 설정을 확인해주세요.',
          }));
          return;
        }
        
        if (result && result.event === 'success') {
          const imageUrl = result.info.secure_url;
          setFormData((prev) => ({
            ...prev,
            image: imageUrl,
          }));
          // 에러 초기화
          setErrors((prev) => ({
            ...prev,
            image: '',
          }));
        }
      }
    );

    setCloudinaryWidget(widget);
  };

  const openUploadWidget = () => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    // 환경 변수 확인
    if (!cloudName || !uploadPreset || cloudName === 'your-cloud-name' || uploadPreset === 'your-upload-preset') {
      alert('Cloudinary 설정이 필요합니다.\n\nclient/.env 파일을 생성하고 다음을 추가하세요:\n\nVITE_CLOUDINARY_CLOUD_NAME=your-cloud-name\nVITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset\n\nCloudinary 계정: https://cloudinary.com');
      return;
    }

    if (cloudinaryWidget) {
      cloudinaryWidget.open();
    } else {
      alert('Cloudinary 위젯이 초기화되지 않았습니다. 페이지를 새로고침해주세요.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // 에러 초기화
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.sku.trim()) {
      newErrors.sku = "SKU를 입력해주세요.";
    }
    if (!formData.name.trim()) {
      newErrors.name = "상품명을 입력해주세요.";
    }
    if (!formData.price) {
      newErrors.price = "가격을 입력해주세요.";
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = "가격은 0 이상의 숫자여야 합니다.";
    }
    if (!formData.category) {
      newErrors.category = "카테고리를 선택해주세요.";
    }
    if (!formData.image.trim()) {
      newErrors.image = "이미지 URL을 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const productData = {
        sku: formData.sku.trim(),
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        image: formData.image.trim(),
        description: formData.description.trim() || undefined,
      };

      const response = await fetch(API_ENDPOINTS.PRODUCTS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("상품이 성공적으로 등록되었습니다!");
        navigate("/admin");
      } else {
        // 서버에서 반환한 에러 메시지 표시
        const errorMessage = data.message || data.error || "상품 등록에 실패했습니다.";
        setErrors({
          submit: errorMessage,
        });
        
        // 필드별 에러가 있는 경우 표시
        if (data.errors) {
          setErrors((prev) => ({
            ...prev,
            ...data.errors,
          }));
        }
      }
    } catch (error) {
      console.error("상품 등록 오류:", error);
      setErrors({
        submit: "서버 연결에 실패했습니다. 서버가 실행 중인지 확인해주세요.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>로딩 중...</div>
      </div>
    );
  }

  if (!user || user.user_type !== 'admin') {
    return null;
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .new-product-page {
          width: 100%;
          min-height: 100vh;
          background: linear-gradient(135deg, #ffe4e9 0%, #ffb6c1 100%);
          padding: 60px 20px;
        }
        .new-product-container {
          max-width: 600px;
          margin: 0 auto;
        }
        .new-product-form {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }
        .form-title {
          font-size: 32px;
          font-weight: bold;
          color: #333;
          text-align: center;
          margin-bottom: 8px;
        }
        .form-subtitle {
          font-size: 14px;
          color: #666;
          text-align: center;
          margin-bottom: 32px;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .input-group label {
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }
        .input-group input,
        .input-group select,
        .input-group textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
        }
        .input-group input:focus,
        .input-group select:focus,
        .input-group textarea:focus {
          outline: none;
          border-color: #ff69b4;
          box-shadow: 0 0 0 3px rgba(255, 105, 180, 0.1);
        }
        .input-group input.error,
        .input-group select.error,
        .input-group textarea.error {
          border-color: #dc3545;
        }
        .input-group textarea {
          min-height: 100px;
          resize: vertical;
        }
        .error-message {
          font-size: 12px;
          color: #dc3545;
        }
        .button-group {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }
        .submit-button {
          flex: 1;
          padding: 14px;
          background: linear-gradient(135deg, #ff69b4 0%, #ffb6c1 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .submit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        .submit-button:active {
          transform: translateY(0);
        }
        .submit-button:disabled {
          background: #ccc;
          cursor: not-allowed;
          opacity: 0.7;
          transform: none;
        }
        .cancel-button {
          flex: 1;
          padding: 14px;
          background: #333;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .cancel-button:hover {
          background: #555;
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        .cancel-button:active {
          transform: translateY(0);
        }
        @media (max-width: 600px) {
          .new-product-form {
            padding: 30px 20px;
          }
          .form-title {
            font-size: 28px;
          }
        }
      `}</style>
      <div className="new-product-page">
        <div className="new-product-container">
          <div className="new-product-form">
            <h1 className="form-title">새 상품 등록</h1>
            <p className="form-subtitle">상품 정보를 입력해주세요</p>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="sku">SKU *</label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  placeholder="예: PROD001"
                  value={formData.sku}
                  onChange={handleChange}
                  className={errors.sku ? "error" : ""}
                />
                {errors.sku && (
                  <span className="error-message">{errors.sku}</span>
                )}
              </div>

              <div className="input-group">
                <label htmlFor="name">상품명 *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="상품명을 입력하세요"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? "error" : ""}
                />
                {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )}
              </div>

              <div className="input-group">
                <label htmlFor="price">가격 *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  placeholder="0"
                  min="0"
                  step="1"
                  value={formData.price}
                  onChange={handleChange}
                  className={errors.price ? "error" : ""}
                />
                {errors.price && (
                  <span className="error-message">{errors.price}</span>
                )}
              </div>

              <div className="input-group">
                <label htmlFor="category">카테고리 *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={errors.category ? "error" : ""}
                >
                  <option value="">카테고리를 선택하세요</option>
                  <option value="구미">구미</option>
                  <option value="젤리">젤리</option>
                  <option value="젤리빈">젤리빈</option>
                </select>
                {errors.category && (
                  <span className="error-message">{errors.category}</span>
                )}
              </div>

              <div className="input-group">
                <label htmlFor="image">이미지 *</label>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <button
                    type="button"
                    onClick={openUploadWidget}
                    style={{
                      padding: "12px 24px",
                      background: "linear-gradient(135deg, #ff69b4 0%, #ffb6c1 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "none";
                    }}
                  >
                    이미지 업로드
                  </button>
                  <input
                    type="url"
                    id="image"
                    name="image"
                    placeholder="Cloudinary에서 업로드하거나 URL을 직접 입력하세요"
                    value={formData.image}
                    onChange={handleChange}
                    className={errors.image ? "error" : ""}
                    style={{ flex: 1 }}
                  />
                </div>
                {formData.image && (
                  <div style={{ marginTop: "12px" }}>
                    <div style={{ 
                      fontSize: "12px", 
                      color: "#666", 
                      marginBottom: "8px" 
                    }}>
                      이미지 미리보기:
                    </div>
                    <img
                      src={formData.image}
                      alt="상품 미리보기"
                      style={{
                        width: "100%",
                        maxWidth: "300px",
                        height: "auto",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
                {errors.image && (
                  <span className="error-message">{errors.image}</span>
                )}
              </div>

              <div className="input-group">
                <label htmlFor="description">상품 설명</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="상품 설명을 입력하세요 (선택사항)"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              {errors.submit && (
                <div className="error-message" style={{ textAlign: "center" }}>
                  {errors.submit}
                </div>
              )}

              <div className="button-group">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => navigate("/admin")}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "등록 중..." : "상품 등록"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductCreatePage;

