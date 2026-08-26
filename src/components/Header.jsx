import { Search, Settings } from 'lucide-react';

const categories = ['전체', '바이오메카닉스', '뇌과학/인지', '데이터분석', '멘탈코칭'];

export default function Header({ selectedCategory, onSelectCategory, searchTerm, onSearch, onOpenResearchBoard, onToggleAdmin, isAdmin, onGoHome }) {
  return (
    <header className="sticky top-0 z-50 bg-deep-navy/95 backdrop-blur-md border-b border-charcoal-navy">
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h1 
            onClick={onGoHome}
            className="text-xl font-bold tracking-tighter text-white font-sans whitespace-nowrap cursor-pointer hover:text-neon-lime transition-colors"
          >
            Baseball Salon
          </h1>
          <div className="flex items-center space-x-2">
            <button 
              onClick={onToggleAdmin}
              className={`px-3 py-1.5 rounded-full text-xs font-extrabold shadow-md hover:scale-105 active:scale-95 transition-colors flex items-center shrink-0 border ${
                isAdmin 
                  ? 'bg-charcoal-navy text-neon-lime border-neon-lime/50 shadow-neon-lime/20' 
                  : 'bg-charcoal-navy/50 text-gray-400 border-white/5 hover:text-white hover:bg-charcoal-navy'
              }`}
            >
              <Settings size={12} className={`mr-1 stroke-[3px] ${isAdmin ? 'animate-spin-slow' : ''}`} />
              관리자
            </button>
            <button 
              onClick={onOpenResearchBoard}
              className="bg-neon-lime text-deep-navy px-3 py-1.5 rounded-full text-xs font-extrabold shadow-[0_2px_10px_rgba(202,255,0,0.3)] hover:scale-105 active:scale-95 transition-transform flex items-center shrink-0"
            >
              전문가 리서치 의뢰
            </button>
            <div className="relative shrink-0">
              <input 
                type="text" 
                placeholder="검색..."
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)}
                className="bg-charcoal-navy text-white text-xs rounded-full pl-7 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-neon-lime w-20 focus:w-32 transition-all placeholder-light-gray"
              />
              <Search size={12} className="absolute left-2.5 top-2 text-light-gray" />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto no-scrollbar pb-1">
          <div className="flex space-x-6 min-w-max px-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onSelectCategory(category)}
                className={`pb-3 text-sm font-semibold transition-colors relative ${
                  selectedCategory === category
                    ? 'text-neon-lime'
                    : 'text-light-gray hover:text-white'
                }`}
              >
                {category}
                {selectedCategory === category && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-neon-lime rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
