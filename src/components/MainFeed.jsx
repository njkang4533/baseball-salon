import FeedCard from './FeedCard';

export default function MainFeed({ articles, onArticleClick }) {
  return (
    <main className="px-5 py-6 bg-deep-navy min-h-screen">
      {articles.length === 0 ? (
        <div className="text-center text-light-gray mt-20 text-sm font-medium">
          해당 카테고리의 기사가 없습니다.
        </div>
      ) : (
        articles.map(article => (
          <FeedCard key={article.id} article={article} onClick={onArticleClick} />
        ))
      )}
    </main>
  );
}
