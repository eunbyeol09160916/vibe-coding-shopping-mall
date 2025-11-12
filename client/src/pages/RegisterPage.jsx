import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";
import Navbar from "./Navbar";

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreements, setAgreements] = useState({
    all: false,
    terms: false,
    privacy: false,
    marketing: false,
  });
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

  const handleAgreementChange = (name) => {
    if (name === "all") {
      const allChecked = !agreements.all;
      setAgreements({
        all: allChecked,
        terms: allChecked,
        privacy: allChecked,
        marketing: allChecked,
      });
    } else {
      const newAgreements = {
        ...agreements,
        [name]: !agreements[name],
      };
      // 전체 동의는 모든 항목이 체크되었을 때만 true
      newAgreements.all =
        newAgreements.terms &&
        newAgreements.privacy &&
        newAgreements.marketing;
      setAgreements(newAgreements);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "이름을 입력해주세요.";
    }
    if (!formData.email.trim()) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다.";
    }
    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요.";
    } else if (
      !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(
        formData.password
      )
    ) {
      newErrors.password =
        "비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }
    if (!agreements.terms) {
      newErrors.terms = "이용약관 동의가 필요합니다.";
    }
    if (!agreements.privacy) {
      newErrors.privacy = "개인정보처리방침 동의가 필요합니다.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 로그아웃 핸들러 (RegisterPage에서는 사용되지 않지만 Navbar에 전달)
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 백엔드 스키마에 맞게 데이터 변환
      const userData = {
        email: formData.email.trim(),
        name: formData.name.trim(),
        password: formData.password,
        user_type: "customer", // 기본값
        address: "", // 선택사항
      };

      const response = await fetch(API_ENDPOINTS.USERS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("회원가입이 완료되었습니다!");
        // 폼 초기화
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setAgreements({
          all: false,
          terms: false,
          privacy: false,
          marketing: false,
        });
        navigate("/");
      } else {
        // 서버에서 보낸 에러 메시지 표시
        alert(data.message || "회원가입에 실패했습니다.");
        // 에러가 특정 필드와 관련된 경우 표시
        if (data.error) {
          console.error("서버 에러:", data.error);
        }
      }
    } catch (error) {
      console.error("회원가입 오류:", error);
      alert("서버 연결에 실패했습니다. 서버가 실행 중인지 확인해주세요.");
    } finally {
      setIsSubmitting(false);
    }
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
        .register-page {
          width: 100%;
          min-height: 100vh;
          background: linear-gradient(135deg, #ffe4e9 0%, #ffb6c1 100%);
          padding: 60px 20px;
        }
        .signup-container {
          max-width: 600px;
          margin: 0 auto;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .signup-form {
          background: white;
          border-radius: 12px;
          padding: 40px;
          width: 100%;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }
        .signup-title {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 8px;
          color: #333;
          text-align: center;
        }
        .signup-subtitle {
          font-size: 14px;
          color: #666;
          margin-bottom: 32px;
          text-align: center;
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
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 12px;
          font-size: 18px;
          z-index: 1;
        }
        .input-wrapper input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
        }
        .input-wrapper input:focus {
          outline: none;
          border-color: #ff69b4;
          box-shadow: 0 0 0 3px rgba(255, 105, 180, 0.1);
        }
        .input-wrapper input.error {
          border-color: #dc3545;
        }
        .toggle-password {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 18px;
          padding: 0;
          display: flex;
          align-items: center;
          z-index: 1;
        }
        .password-hint {
          font-size: 12px;
          color: #666;
          margin: 0;
        }
        .error-message {
          font-size: 12px;
          color: #dc3545;
        }
        .agreements-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 8px;
        }
        .agreement-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background-color: #f9f9f9;
          border-radius: 8px;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
          color: #333;
        }
        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }
        .view-link {
          font-size: 12px;
          color: #ff69b4;
          text-decoration: none;
          transition: color 0.2s;
        }
        .view-link:hover {
          color: #ffb6c1;
          text-decoration: underline;
        }
        .signup-button {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #ff69b4 0%, #ffb6c1 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 8px;
          transition: all 0.2s;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .signup-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        .signup-button:active {
          transform: translateY(0);
        }
        .signup-button:disabled {
          background: #ccc;
          cursor: not-allowed;
          opacity: 0.7;
          transform: none;
        }
        @media (max-width: 600px) {
          .signup-form {
            padding: 30px 20px;
          }
          .signup-title {
            font-size: 28px;
          }
        }
      `}</style>
      <div className="register-page">
        <div className="signup-container">
          <div className="signup-form">
        <h1 className="signup-title">회원가입</h1>
        <p className="signup-subtitle">
          새로운 계정을 만들어 쇼핑을 시작하세요
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="name">이름</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="이름"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "error" : ""}
              />
            </div>
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="email">이메일</label>
            <div className="input-wrapper">
              <span className="input-icon">✉</span>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
              />
            </div>
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="password">비밀번호</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            <p className="password-hint">
              8자 이상, 영문, 숫자, 특수문자 포함
            </p>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "error" : ""}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          <div className="agreements-section">
            <div className="agreement-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreements.all}
                  onChange={() => handleAgreementChange("all")}
                />
                <span>전체 동의</span>
              </label>
            </div>

            <div className="agreement-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreements.terms}
                  onChange={() => handleAgreementChange("terms")}
                  className={errors.terms ? "error" : ""}
                />
                <span>이용약관 동의 (필수)</span>
              </label>
              <a href="#" className="view-link">
                보기
              </a>
            </div>

            <div className="agreement-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreements.privacy}
                  onChange={() => handleAgreementChange("privacy")}
                  className={errors.privacy ? "error" : ""}
                />
                <span>개인정보처리방침 동의 (필수)</span>
              </label>
              <a href="#" className="view-link">
                보기
              </a>
            </div>

            <div className="agreement-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreements.marketing}
                  onChange={() => handleAgreementChange("marketing")}
                />
                <span>마케팅 정보 수신 동의 (선택)</span>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className="signup-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "처리 중..." : "회원가입"}
          </button>
        </form>
        </div>
        </div>
      </div>
    </>
  );
}

export default RegisterPage;

