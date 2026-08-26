import { Clock } from 'lucide-react';

export default function FeedCard({ article, onClick }) {
  return (
    <button 
      onClick={() => onClick(article)}
      className="w-full text-left block bg-charcoal-navy rounded-[20px] mb-5 cursor-pointer hover:bg-charcoal-navy/80 transition-all shadow-xl hover:-translate-y-1 active:scale-[0.98] border border-white/5 overflow-hidden focus:outline-none"
    >
      <div className="p-5">
        <div className="flex items-center space-x-2 mb-3">
          <span className="px-2.5 py-1 rounded-md bg-bright-blue/20 text-bright-blue text-[11px] font-bold tracking-wider">
            {article.category}
          </span>
          <span className="flex items-center text-[11px] font-bold text-gray-400 bg-white/5 px-2 py-1 rounded-md">
            {article.sourceType}
            {article.country && (
              <img 
                src={`https://flagcdn.com/w20/${article.country.toLowerCase()}.png`} 
                alt={article.country} 
                className="w-3.5 h-[10px] ml-1.5 shadow-[0_0_2px_rgba(0,0,0,0.5)] rounded-sm" 
              />
            )}
          </span>
          <span className="text-light-gray text-xs font-medium ml-auto">{article.date}</span>
        </div>
        
        <h2 className="text-[17px] font-bold text-white mb-4 leading-snug line-clamp-2">
          {article.title}
        </h2>
        
        {article.image_base64 && (
          <div className="mb-4 rounded-xl overflow-hidden bg-black/40 border border-white/5">
            <img 
              src={`data:image/png;base64,${article.image_base64}`} 
              alt="AI diagram" 
              className="w-full h-48 object-cover" 
            />
          </div>
        )}
        
        <div className="border-l-[3px] border-neon-lime bg-deep-navy/40 p-4 rounded-r-xl mb-4">
          <h3 className="text-neon-lime text-xs font-bold uppercase tracking-widest mb-1.5">
            Coaching Point
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed font-medium">
            {article.coachingPoint}
          </p>
        </div>
        
        <div className="flex items-center justify-between text-xs font-medium text-gray-500">
          <span className="truncate flex-1 pr-4">{article.source}</span>
          <span className="flex items-center flex-shrink-0 text-neon-lime/80 bg-neon-lime/10 px-2 py-1 rounded-md">
            <Clock size={12} className="mr-1" />
            {article.readTime}
          </span>
        </div>
      </div>
    </button>
  );
}
