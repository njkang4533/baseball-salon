import { useState, useEffect } from 'react';
import Header from './components/Header';
import MainFeed from './components/MainFeed';
import ArticleDetailModal from './components/ArticleDetailModal';
import LoginScreen from './components/LoginScreen';
import ResearchBoardModal from './components/ResearchBoardModal';
import AdminDashboard from './components/AdminDashboard';
import AdminAuthModal from './components/AdminAuthModal';
import * as api from './utils/mockApi';
import { Search } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('salon_auth') === 'true'
  );
  const [articles, setArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showResearchBoard, setShowResearchBoard] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const handleToggleAdmin = () => {
    if (showAdminDashboard) {
      setShowAdminDashboard(false);
    } else {
      if (isAdminAuthenticated) {
        setShowAdminDashboard(true);
      } else {
        setShowAdminAuthModal(true);
      }
    }
  };

  const fetchArticles = async () => {
    try {
      const data = await api.getArticles();
      setArticles(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchArticles();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const filteredArticles = articles.filter(a => {
    const matchesCategory = selectedCategory === '전체' || a.category === selectedCategory;
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <div className="min-h-screen w-full bg-deep-navy font-sans max-w-md mx-auto shadow-2xl relative flex flex-col">
        <Header 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        onOpenResearchBoard={() => setShowResearchBoard(true)}
        onToggleAdmin={handleToggleAdmin}
        isAdmin={showAdminDashboard}
        onGoHome={() => setShowAdminDashboard(false)}
      />
      
      {showAdminDashboard ? (
        <AdminDashboard onPublishSuccess={fetchArticles} />
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
          {loading ? (
            <div className="text-center text-light-gray mt-20 text-sm">기사를 불러오는 중...</div>
          ) : (
            <MainFeed 
              articles={filteredArticles} 
              onArticleClick={setSelectedArticle} 
            />
          )}
        </div>
      )}
      </div>

      {showAdminAuthModal && (
        <AdminAuthModal 
          onSuccess={() => {
            setIsAdminAuthenticated(true);
            setShowAdminAuthModal(false);
            setShowAdminDashboard(true);
          }}
          onClose={() => setShowAdminAuthModal(false)}
        />
      )}

      {selectedArticle && (
        <ArticleDetailModal 
          article={selectedArticle} 
          onClose={() => setSelectedArticle(null)} 
        />
      )}

      {showResearchBoard && (
        <ResearchBoardModal onClose={() => setShowResearchBoard(false)} />
      )}
    </>
  );
}

export default App;
