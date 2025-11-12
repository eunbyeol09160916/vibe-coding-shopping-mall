import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";
import Navbar from "./Navbar";

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberId, setRememberId] = useState(false);
  const [secureConnection, setSecureConnection] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!formData.email.trim()) {
      newErrors.email = "이메일을 입력해주세요.";
    } else {
      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "올바른 이메일 형식이 아닙니다.";
      }
    }
    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요.";
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
    setErrors({}); // 이전 에러 초기화

    try {
      const response = await fetch(`${API_ENDPOINTS.USERS}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("응답 파싱 오류:", parseError);
        setErrors({
          submit: "서버 응답을 처리할 수 없습니다.",
        });
        return;
      }

      if (response.ok && data.success) {
        // JWT 토큰 저장
        if (data.data && data.data.token) {
          localStorage.setItem("token", data.data.token);
          localStorage.setItem("user", JSON.stringify(data.data.user));
        }

        // 아이디 저장
        if (rememberId) {
          localStorage.setItem("rememberedEmail", formData.email.trim());
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        alert("로그인에 성공했습니다!");
        navigate("/");
      } else {
        // 서버에서 보낸 에러 메시지 표시
        const errorMessage = data.message || "로그인에 실패했습니다.";
        setErrors({
          submit: errorMessage,
        });
        
        // 필드별 에러가 있는 경우 표시
        if (data.error) {
          console.error("서버 에러:", data.error);
        }
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      setErrors({
        submit: "서버 연결에 실패했습니다. 서버가 실행 중인지 확인해주세요.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 토큰이 있으면 유저 정보 확인 후 메인 페이지로 리다이렉트
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        // 토큰이 없으면 저장된 아이디 불러오기
        const rememberedEmail = localStorage.getItem("rememberedEmail");
        if (rememberedEmail) {
          setFormData((prev) => ({
            ...prev,
            email: rememberedEmail,
          }));
          setRememberId(true);
        }
        return;
      }

      // 토큰이 있으면 유저 정보 확인
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
          // 유효한 토큰이면 메인 페이지로 리다이렉트
          navigate("/");
        } else {
          // 토큰이 유효하지 않으면 제거
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          
          // 저장된 아이디 불러오기
          const rememberedEmail = localStorage.getItem("rememberedEmail");
          if (rememberedEmail) {
            setFormData((prev) => ({
              ...prev,
              email: rememberedEmail,
            }));
            setRememberId(true);
          }
        }
      } catch (error) {
        console.error("토큰 검증 오류:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        // 저장된 아이디 불러오기
        const rememberedEmail = localStorage.getItem("rememberedEmail");
        if (rememberedEmail) {
          setFormData((prev) => ({
            ...prev,
            email: rememberedEmail,
          }));
          setRememberId(true);
        }
      }
    };

    checkAuth();
  }, [navigate]);

  // 로그아웃 핸들러 (LoginPage에서는 사용되지 않지만 Navbar에 전달)
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <>
      <Navbar user={null} onLogout={handleLogout} />
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .login-page {
          width: 100%;
          min-height: 100vh;
          background: linear-gradient(135deg, #ffe4e9 0%, #ffb6c1 100%);
          padding: 60px 20px;
        }
        .login-container {
          max-width: 500px;
          margin: 0 auto;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .login-form {
          width: 100%;
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .login-title {
          font-size: 32px;
          font-weight: bold;
          color: #333;
          text-align: center;
        }
        .login-subtitle {
          font-size: 14px;
          color: #666;
          text-align: center;
          margin-top: -16px;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .input-group input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          background-color: white;
          transition: all 0.2s;
        }
        .input-group input:focus {
          outline: none;
          border-color: #ff69b4;
          box-shadow: 0 0 0 3px rgba(255, 105, 180, 0.1);
        }
        .input-group input.error {
          border-color: #dc3545;
        }
        .error-message {
          font-size: 12px;
          color: #dc3545;
          margin-top: -4px;
        }
        .checkbox-group {
          display: flex;
          gap: 16px;
          justify-content: flex-end;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          font-size: 14px;
          color: #333;
        }
        .checkbox-label input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }
        .button-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .login-button {
          width: 100%;
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
        .login-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        .login-button:active {
          transform: translateY(0);
        }
        .login-button:disabled {
          background: #ccc;
          cursor: not-allowed;
          opacity: 0.7;
          transform: none;
        }
        .signup-button {
          width: 100%;
          padding: 14px;
          background-color: #333;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .signup-button:hover {
          background-color: #555;
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        .signup-button:active {
          transform: translateY(0);
        }
        .find-link {
          text-align: center;
          font-size: 14px;
          color: #666;
          text-decoration: none;
          margin-top: 8px;
          transition: color 0.2s;
        }
        .find-link:hover {
          color: #ff69b4;
          text-decoration: underline;
        }
        @media (max-width: 600px) {
          .login-form {
            padding: 30px 20px;
          }
          .login-title {
            font-size: 28px;
          }
        }
      `}</style>
      <div className="login-page">
        <div className="login-container">
          <div className="login-form">
          <h1 className="login-title">로그인</h1>
          <p className="login-subtitle">
            위니비니가 회원님께 드리는 혜택을 놓치지마세요!
          </p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="이메일"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="input-group">
              <input
                type="password"
                name="password"
                placeholder="비밀번호"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberId}
                  onChange={(e) => setRememberId(e.target.checked)}
                />
                <span>아이디저장</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={secureConnection}
                  onChange={(e) => setSecureConnection(e.target.checked)}
                />
                <span>보안접속</span>
              </label>
            </div>

            {errors.submit && (
              <div className="error-message" style={{ textAlign: "center", marginTop: "-8px" }}>
                {errors.submit}
              </div>
            )}

            <div className="button-group">
              <button
                type="submit"
                className="login-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "로그인 중..." : "로그인"}
              </button>
              <button
                type="button"
                className="signup-button"
                onClick={() => navigate("/signup")}
              >
                회원가입
              </button>
            </div>
          </form>

          <a href="#" className="find-link">
            아이디/비밀번호찾기
          </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;

