import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../config/api";
import Navbar from "../Navbar";

const ITEMS_PER_PAGE = 3;

function ProductManagePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

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
          if (data.data.user_type !== "admin") {
            alert("어드민 권한이 필요합니다.");
            navigate("/");
            return;
          }
        } else {
          navigate("/login");
          return;
        }
      } catch (error) {
        console.error("유저 정보 가져오기 오류:", error);
        navigate("/login");
        return;
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  const fetchProducts = useCallback(async (page = 1) => {
    setIsFetching(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_ENDPOINTS.PRODUCTS}?page=${page}&limit=${ITEMS_PER_PAGE}`
      );
      const data = await response.json();

      if (response.ok && data.success) {
        setProducts(Array.isArray(data.data) ? data.data : []);
        const pagination = data.pagination || {};
        setCurrentPage(pagination.page || page);
        setTotalPages(pagination.totalPages || 1);
        setTotalProducts(
          typeof pagination.totalItems === "number"
            ? pagination.totalItems
            : Array.isArray(data.data)
              ? data.data.length
              : 0
        );
      } else {
        setErrorMessage(data.message || "상품 목록을 불러오지 못했습니다.");
      }
    } catch (error) {
      console.error("상품 목록 가져오기 오류:", error);
      setErrorMessage("상품 목록을 불러오지 못했습니다. 서버 상태를 확인해주세요.");
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && user && user.user_type === "admin") {
      fetchProducts(1);
    }
  }, [fetchProducts, isLoading, user]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) || product.sku?.includes(searchTerm.toUpperCase());
      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`정말로 "${productName}" 상품을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.PRODUCTS}/${productId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (response.ok && data.success) {
        alert("상품이 삭제되었습니다.");
        await fetchProducts(currentPage);
      } else {
        alert(data.message || "상품 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("상품 삭제 오류:", error);
      alert("상품 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }
    fetchProducts(page);
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div>로딩 중...</div>
      </div>
    );
  }

  if (!user || user.user_type !== "admin") {
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
        .product-manage-page {
          width: 100%;
          min-height: 100vh;
          background: linear-gradient(135deg, #ffe4e9 0%, #ffb6c1 100%);
          padding: 40px 20px 60px;
        }
        .product-manage-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .product-manage-header {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-bottom: 24px;
        }
        .product-manage-title {
          font-size: 32px;
          font-weight: bold;
          color: #333;
          margin-bottom: 8px;
        }
        .product-manage-subtitle {
          font-size: 15px;
          color: #666;
        }
        .product-manage-meta {
          margin-top: 12px;
          font-size: 13px;
          color: #888;
        }
        .product-toolbar {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .product-search {
          flex: 1;
          min-width: 220px;
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
        }
        .product-search:focus {
          outline: none;
          border-color: #ff69b4;
          box-shadow: 0 0 0 3px rgba(255, 105, 180, 0.1);
        }
        .product-filter {
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
        }
        .product-filter:focus {
          outline: none;
          border-color: #ff69b4;
          box-shadow: 0 0 0 3px rgba(255, 105, 180, 0.1);
        }
        .primary-button {
          padding: 12px 24px;
          background: linear-gradient(135deg, #ff69b4 0%, #ffb6c1 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          white-space: nowrap;
        }
        .primary-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        .primary-button:active {
          transform: translateY(0);
        }
        .refresh-button {
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: white;
          color: #333;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .refresh-button:hover {
          background: #f8f9fa;
        }
        .product-table-wrapper {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .product-table {
          width: 100%;
          border-collapse: collapse;
        }
        .product-table th,
        .product-table td {
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid #f1f1f1;
          font-size: 14px;
        }
        .product-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #333;
        }
        .product-table tr:hover {
          background: #fff5f8;
        }
        .product-image-thumb {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          border: 1px solid #eee;
          object-fit: cover;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 600;
          background: #f1f3f5;
          color: #333;
        }
        .table-actions {
          display: flex;
          gap: 8px;
        }
        .table-button {
          padding: 8px 12px;
          border-radius: 6px;
          border: none;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .table-button.edit {
          background: #ff69b4;
          color: white;
        }
        .table-button.edit:hover {
          background: #ff85c1;
        }
        .table-button.delete {
          background: #dc3545;
          color: white;
        }
        .table-button.delete:hover {
          background: #c82333;
        }
        .empty-state {
          text-align: center;
          padding: 80px 20px;
          color: #666;
        }
        .empty-state-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        .error-banner {
          background: rgba(220, 53, 69, 0.1);
          color: #c1121f;
          border: 1px solid rgba(220, 53, 69, 0.2);
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 16px;
          font-size: 14px;
        }
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          padding: 20px;
        }
        .pagination-button {
          padding: 10px 18px;
          border-radius: 8px;
          border: none;
          background: #333;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pagination-button:hover {
          background: #555;
          transform: translateY(-1px);
        }
        .pagination-button:disabled {
          background: #bbb;
          cursor: not-allowed;
          transform: none;
        }
        .pagination-info {
          font-size: 14px;
          color: #666;
        }
        @media (max-width: 992px) {
          .product-table th:nth-child(4),
          .product-table td:nth-child(4),
          .product-table th:nth-child(5),
          .product-table td:nth-child(5) {
            display: none;
          }
        }
        @media (max-width: 640px) {
          .product-toolbar {
            flex-direction: column;
            align-items: stretch;
          }
          .product-search,
          .product-filter,
          .primary-button,
          .refresh-button {
            width: 100%;
          }
        }
      `}</style>
      <div className="product-manage-page">
        <div className="product-manage-container">
          <div className="product-manage-header">
            <h1 className="product-manage-title">상품 관리</h1>
            <p className="product-manage-subtitle">
              등록된 상품을 조회하고 관리할 수 있는 페이지입니다.
            </p>
            <div className="product-manage-meta">
              총 {totalProducts.toLocaleString("ko-KR")}개 상품
            </div>
          </div>

          <div className="product-toolbar">
            <input
              type="text"
              className="product-search"
              placeholder="상품명 또는 SKU로 검색하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="product-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">전체 카테고리</option>
              <option value="구미">구미</option>
              <option value="젤리">젤리</option>
              <option value="젤리빈">젤리빈</option>
            </select>
            <button
              className="refresh-button"
              type="button"
              onClick={() => fetchProducts(currentPage)}
              disabled={isFetching}
            >
              {isFetching ? "새로고침 중..." : "새로고침"}
            </button>
            <button
              className="primary-button"
              type="button"
              onClick={() => navigate("/admin/products/new")}
            >
              + 새 상품 등록
            </button>
          </div>

          {errorMessage && <div className="error-banner">{errorMessage}</div>}

          <div className="product-table-wrapper">
            {filteredProducts.length > 0 ? (
              <table className="product-table">
                <thead>
                  <tr>
                    <th>상품 이미지</th>
                    <th>상품명</th>
                    <th>SKU</th>
                    <th>카테고리</th>
                    <th>가격</th>
                    <th>등록일</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id}>
                      <td>
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="product-image-thumb"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="status-badge">이미지 없음</span>
                        )}
                      </td>
                      <td style={{ fontWeight: 600 }}>{product.name}</td>
                      <td>{product.sku}</td>
                      <td>{product.category}</td>
                      <td>{product.price?.toLocaleString("ko-KR")}원</td>
                      <td>
                        {product.createdAt
                          ? new Date(product.createdAt).toLocaleDateString("ko-KR")
                          : "-"}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="table-button edit"
                            type="button"
                            onClick={() => alert("상품 수정 기능은 추후 구현 예정입니다.")}
                          >
                            수정
                          </button>
                          <button
                            className="table-button delete"
                            type="button"
                            onClick={() => handleDeleteProduct(product._id, product.name)}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🛒</div>
                <p>
                  {searchTerm.trim() || categoryFilter !== "all"
                    ? "조건에 맞는 상품이 없습니다. 다른 검색어나 카테고리를 시도해보세요."
                    : "등록된 상품이 없습니다. 새로운 상품을 등록해보세요."}
                </p>
                <button
                  className="primary-button"
                  type="button"
                  style={{ marginTop: 20 }}
                  onClick={() => navigate("/admin/products/new")}
                >
                  새 상품 등록하기
                </button>
              </div>
            )}
          </div>

          {totalProducts > 0 ? (
            <div className="pagination">
              <button
                type="button"
                className="pagination-button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isFetching}
              >
                이전
              </button>
              <div className="pagination-info">
                페이지 {currentPage} / {totalPages}
              </div>
              <button
                type="button"
                className="pagination-button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isFetching}
              >
                다음
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

export default ProductManagePage;

