import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../config/api";
import Navbar from "../Navbar";

function AdminPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

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

  // 모든 유저 목록 가져오기
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || user.user_type !== 'admin') return;

      try {
        const response = await fetch(API_ENDPOINTS.USERS, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setUsers(data.data);
        }
      } catch (error) {
        console.error("유저 목록 가져오기 오류:", error);
      }
    };

    if (activeTab === "users") {
      fetchUsers();
    }
  }, [user, activeTab]);

  // 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // 주문 상태 한글 변환
  const getStatusText = (status) => {
    const statusMap = {
      pending: "주문확인",
      processing: "상품준비중",
      shipping_started: "배송시작",
      shipped: "배송중",
      delivered: "배송완료",
      cancelled: "주문취소",
    };
    return statusMap[status] || status;
  };

  // 주문 상태 색상
  const getStatusColor = (status) => {
    const colorMap = {
      pending: "#ffc107",
      processing: "#ff9800",
      shipping_started: "#17a2b8",
      shipped: "#17a2b8",
      delivered: "#28a745",
      cancelled: "#dc3545",
    };
    return colorMap[status] || "#666";
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
        .admin-page {
          width: 100%;
          min-height: 100vh;
          background: linear-gradient(135deg, #ffe4e9 0%, #ffb6c1 100%);
          padding: 40px 20px;
        }
        .admin-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .admin-header {
          background: white;
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .admin-title {
          font-size: 36px;
          font-weight: bold;
          color: #333;
          margin-bottom: 10px;
        }
        .admin-subtitle {
          font-size: 16px;
          color: #666;
        }
        .admin-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 30px;
          background: white;
          padding: 12px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .tab-button {
          padding: 12px 24px;
          background: transparent;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
        }
        .tab-button:hover {
          background: #f8f9fa;
          color: #333;
        }
        .tab-button.active {
          background: linear-gradient(135deg, #ff69b4 0%, #ffb6c1 100%);
          color: white;
        }
        .admin-content {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: linear-gradient(135deg, #ffe4e9 0%, #ffb6c1 100%);
          border-radius: 12px;
          padding: 24px;
          color: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .stat-label {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 8px;
        }
        .stat-value {
          font-size: 32px;
          font-weight: bold;
        }
        .users-table {
          width: 100%;
          border-collapse: collapse;
        }
        .users-table th,
        .users-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        .users-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #333;
        }
        .users-table tr:hover {
          background: #f8f9fa;
        }
        .user-type-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        .user-type-badge.admin {
          background: #ff69b4;
          color: white;
        }
        .user-type-badge.customer {
          background: #e9ecef;
          color: #333;
        }
        .action-button {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .action-button.edit {
          background: #ff69b4;
          color: white;
        }
        .action-button.edit:hover {
          background: #ffb6c1;
        }
        .action-button.delete {
          background: #dc3545;
          color: white;
        }
        .action-button.delete:hover {
          background: #c82333;
        }
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }
        .empty-state-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        @media (max-width: 768px) {
          .admin-tabs {
            flex-wrap: wrap;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .users-table {
            font-size: 14px;
          }
          .users-table th,
          .users-table td {
            padding: 8px;
          }
        }
      `}</style>
      <div className="admin-page">
        <div className="admin-container">
          <div className="admin-header">
            <h1 className="admin-title">관리자 대시보드</h1>
            <p className="admin-subtitle">시스템 관리 및 모니터링</p>
          </div>

          <div className="admin-tabs">
            <button
              className={`tab-button ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              대시보드
            </button>
            <button
              className={`tab-button ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              유저 관리
            </button>
            <button
              className="tab-button"
              onClick={() => navigate("/admin/products")}
            >
              상품 관리
            </button>
            <button
              className={`tab-button ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => navigate("/admin/orders")}
            >
              주문 관리
            </button>
          </div>

          <div className="admin-content">
            {activeTab === "dashboard" && (
              <div>
                <h2 style={{ marginBottom: "20px", color: "#333" }}>통계</h2>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-label">전체 유저</div>
                    <div className="stat-value">{users.length || 0}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">일반 고객</div>
                    <div className="stat-value">
                      {users.filter(u => u.user_type === 'customer').length || 0}
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">관리자</div>
                    <div className="stat-value">
                      {users.filter(u => u.user_type === 'admin').length || 0}
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">전체 상품</div>
                    <div className="stat-value">0</div>
                  </div>
                </div>
                <div style={{ marginTop: "40px" }}>
                  <h3 style={{ marginBottom: "20px", color: "#333" }}>최근 활동</h3>
                  <div className="empty-state">
                    <div className="empty-state-icon">📊</div>
                    <p>최근 활동 내역이 없습니다.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div>
                <h2 style={{ marginBottom: "20px", color: "#333" }}>유저 목록</h2>
                {users.length > 0 ? (
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>이름</th>
                        <th>이메일</th>
                        <th>유저 타입</th>
                        <th>가입일</th>
                        <th>작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id}>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>
                            <span className={`user-type-badge ${u.user_type}`}>
                              {u.user_type === 'admin' ? '관리자' : '고객'}
                            </span>
                          </td>
                          <td>
                            {u.createdAt 
                              ? new Date(u.createdAt).toLocaleDateString('ko-KR')
                              : '-'}
                          </td>
                          <td>
                            <button
                              className="action-button edit"
                              onClick={() => alert(`유저 ${u.name} 수정`)}
                            >
                              수정
                            </button>
                            <button
                              className="action-button delete"
                              onClick={() => {
                                if (window.confirm(`정말 ${u.name} 유저를 삭제하시겠습니까?`)) {
                                  alert(`유저 ${u.name} 삭제`);
                                }
                              }}
                              style={{ marginLeft: "8px" }}
                            >
                              삭제
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <p>유저가 없습니다.</p>
                  </div>
                )}
              </div>
            )}

            {/* 상품 관리는 별도 페이지에서 처리 */}

            {activeTab === "orders" && (
              <div>
                <h2 style={{ marginBottom: "20px", color: "#333" }}>주문 관리</h2>
                <div className="empty-state">
                  <div className="empty-state-icon">📦</div>
                  <p>주문 관리 기능은 추후 구현 예정입니다.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminPage;

