import { useState, useEffect } from 'react';
import { Play, Pause, ChevronLeft, Volume2, Share2, Lightbulb } from 'lucide-react';
import * as api from '../utils/mockApi';

export default function ArticleDetailModal({ article, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // 댓글 데이터 Fetch
  useEffect(() => {
    api.getComments(article.id)
      .then(data => setComments(data))
      .catch(console.error);
  }, [article.id]);

  // 기사 내용 기반 총 예상 재생 시간(초) 계산
  useEffect(() => {
    if (article) {
      const stripHtml = (html) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
      };
      const text = `${article.title}. 요약입니다. ${stripHtml(article.summary)}`;
      // rate가 1.1일 때 한국어 초당 약 5~5.5자 읽는다고 가정
      const estimatedSeconds = Math.max(10, Math.ceil(text.length / 5.5));
      setTotalDuration(estimatedSeconds);
    }
  }, [article]);

  // Web Speech API (TTS) progress 업데이트 로직
  useEffect(() => {
    let interval;
    if (isPlaying && window.speechSynthesis && totalDuration > 0) {
      const percentPerTick = (0.5 / totalDuration) * 100;
      interval = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 100 : prev + percentPerTick));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);

  const handlePlayToggle = () => {
    if (!window.speechSynthesis) return;

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused && progress > 0) {
        window.speechSynthesis.resume();
      } else {
        const stripHtml = (html) => {
          const tmp = document.createElement("DIV");
          tmp.innerHTML = html;
          return tmp.textContent || tmp.innerText || "";
        };
        const textToRead = `${article.title}. 요약입니다. ${stripHtml(article.summary)}`;
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'ko-KR';
        utterance.rate = 1.1; // 약간 빠르게
        utterance.onend = () => {
          setIsPlaying(false);
          setProgress(0);
        };
        window.speechSynthesis.speak(utterance);
      }
      setIsPlaying(true);
    }
  };

  // 모달 닫힐 때 TTS 중지
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSeconds = (progress / 100) * totalDuration;

  const handleOriginalLink = () => {
    if (article.originalUrl) {
      window.open(article.originalUrl, '_blank');
    } else if (article.doi) {
      window.open(`https://doi.org/${article.doi}`, '_blank');
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    
    const commentData = {
      articleId: article.id,
      author: "본인",
      role: "현장 코치",
      content: newComment,
      timestamp: new Date().toISOString()
    };

    try {
      const data = await api.postComment(commentData);
      setComments([...comments, data]);
      setNewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  if (!article) return null;
  
  return (
    <div className="fixed inset-0 z-[100] bg-deep-navy overflow-y-auto flex flex-col font-sans animate-in slide-in-from-bottom-4 duration-300">
      <div className="sticky top-0 z-10 bg-deep-navy/95 backdrop-blur-xl border-b border-charcoal-navy shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={onClose} className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft size={28} />
          </button>
          <div className="flex space-x-2">
            <button className="p-2 text-light-gray hover:text-white transition-colors">
              <Share2 size={20} />
            </button>
          </div>
        </div>
        
        <div className="px-5 pb-5">
          <div className="bg-charcoal-navy rounded-2xl p-3 flex items-center shadow-lg border border-white/5">
            <button 
              onClick={handlePlayToggle}
              className="w-12 h-12 rounded-full bg-neon-lime text-deep-navy flex items-center justify-center mr-4 flex-shrink-0 hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause size={22} className="fill-current" /> : <Play size={22} className="fill-current ml-1" />}
            </button>
            <div className="flex-1 mr-2">
              <div className="text-[11px] text-light-gray mb-1.5 flex justify-between font-medium">
                <span>{formatTime(currentSeconds)}</span>
                <span>{formatTime(totalDuration)}</span>
              </div>
              <div className="w-full bg-deep-navy rounded-full h-1.5 cursor-pointer">
                <div className="bg-neon-lime h-1.5 rounded-full relative transition-all duration-500 ease-linear" style={{ width: `${progress}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
                </div>
              </div>
            </div>
            <button className="p-2 text-neon-lime transition-colors">
              <Volume2 size={20}/>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <span className="px-3 py-1.5 rounded-full bg-bright-blue/15 text-bright-blue text-xs font-bold tracking-wide">
              {article.category}
            </span>
            <span className="flex items-center px-3 py-1.5 rounded-full bg-white/10 text-gray-300 text-xs font-bold tracking-wide border border-white/10">
              {article.sourceType}
              {article.country && (
                <img 
                  src={`https://flagcdn.com/w20/${article.country.toLowerCase()}.png`} 
                  alt={article.country} 
                  className="w-4 h-3 ml-2 shadow-[0_0_2px_rgba(0,0,0,0.5)] rounded-sm" 
                />
              )}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-3 leading-snug">
            {article.title}
          </h1>
          <p className="text-sm text-light-gray font-medium">
            {article.date} · <span className="text-neon-lime">{article.readTime}</span>
          </p>
        </div>

        {article.image_base64 && (
          <div className="mb-8 rounded-2xl overflow-hidden bg-black/40 border border-white/5 flex justify-center p-2">
            <img 
              src={`data:image/png;base64,${article.image_base64}`} 
              alt="AI diagram" 
              className="w-full max-w-lg rounded-xl shadow-xl" 
            />
          </div>
        )}

        <section className="mb-10">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center">
            Research Summary
          </h2>
          <div className="text-gray-300 text-[15px] leading-relaxed font-medium space-y-4">
            <p dangerouslySetInnerHTML={{ __html: article.summary }}></p>
          </div>
        </section>



        <section className="mb-10 bg-gradient-to-br from-charcoal-navy to-charcoal-navy/50 rounded-[20px] p-6 border border-neon-lime/20 shadow-xl">
          <h2 className="text-lg font-bold text-neon-lime mb-4 flex items-center">
            <Lightbulb size={22} className="mr-2" />
            현장 적용 포인트
          </h2>
          <ul className="space-y-4">
            {article.applications.map((app, idx) => (
              <li key={idx} className="flex items-start text-[15px] text-gray-200 leading-relaxed font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-lime mt-2 mr-3 flex-shrink-0 shadow-[0_0_8px_rgba(202,255,0,0.6)]"></span>
                <span>{app}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12 bg-charcoal-navy/40 border border-charcoal-navy p-6 rounded-[20px]">
          <h3 className="text-[15px] font-bold text-white mb-4">Source & References</h3>
          <div className="text-sm text-light-gray space-y-2.5 mb-6 font-medium">
            <p><span className="font-semibold text-gray-400 mr-2">{article.type === 'article' ? '작성자(기관):' : '저자:'}</span> {article.authors}</p>
            <p><span className="font-semibold text-gray-400 mr-2">발행:</span> {article.source}</p>
            {article.type === 'article' ? (
              <p><span className="font-semibold text-gray-400 mr-2">링크:</span> <a href={article.originalUrl} target="_blank" rel="noreferrer" className="text-bright-blue hover:underline break-all text-xs">{article.originalUrl}</a></p>
            ) : (
              <p><span className="font-semibold text-gray-400 mr-2">DOI:</span> {article.doi}</p>
            )}
          </div>
          <button 
            onClick={handleOriginalLink}
            className="w-full bg-bright-blue hover:bg-blue-500 text-white font-bold py-4 px-4 rounded-xl transition-colors shadow-lg shadow-bright-blue/20"
          >
            원문 보러가기
          </button>
        </section>
        
        <div className="h-px w-full bg-charcoal-navy mb-10"></div>

        <section className="mb-12">
          <h2 className="text-lg font-bold text-white mb-5">현장 피드백 ({comments.length})</h2>
          <div className="mb-8 relative">
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full bg-charcoal-navy border border-charcoal-navy focus:border-neon-lime/50 text-white rounded-xl p-5 pb-14 text-[15px] placeholder-light-gray/50 outline-none resize-none transition-colors shadow-inner"
              rows="3"
              placeholder="코치님의 현장 의견을 남겨주세요..."
            ></textarea>
            <div className="absolute bottom-3 right-3">
              <button 
                onClick={handlePostComment}
                className="bg-neon-lime text-deep-navy px-5 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-[#b0df00] transition-colors"
              >
                등록
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-charcoal-navy/30 p-5 rounded-xl border border-white/5">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-white text-[15px]">
                    {comment.author} <span className="text-xs font-normal text-light-gray ml-1">{comment.role}</span>
                  </span>
                  <span className="text-xs text-light-gray font-medium">
                    {new Date(comment.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[15px] text-gray-300 leading-relaxed font-medium">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
