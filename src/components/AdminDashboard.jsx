import { useState, useEffect } from 'react';
import { Send, Trash2, Database, AlertCircle, FileText, ExternalLink } from 'lucide-react';
import * as api from '../utils/mockApi';

export default function AdminDashboard({ onPublishSuccess }) {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingImageId, setGeneratingImageId] = useState(null);

  useEffect(() => {
    api.getDraftArticles()
      .then(data => {
        setDrafts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const [publishingId, setPublishingId] = useState(null);

  const handlePublish = async (draft) => {
    if (publishingId) return;
    setPublishingId(draft.id);
    const newArticle = { ...draft };
    delete newArticle.id; 
    newArticle.title = newArticle.title.replace('[AI 초안] ', '');
    newArticle.summary = newArticle.summary.replace('새벽 AI 크롤링 요약: ', '');

    try {
      await api.postArticle(newArticle);
      await api.deleteDraftArticle(draft.id);
      setDrafts(drafts.filter(d => d.id !== draft.id));
      if (onPublishSuccess) onPublishSuccess();
    } catch (err) {
      console.error(err);
      alert("발행 중 오류가 발생했습니다.");
    } finally {
      setPublishingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.deleteDraftArticle(id);
      setDrafts(drafts.filter(d => d.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex-1 text-center mt-20 text-light-gray text-sm">데이터를 불러오는 중...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-10 bg-deep-navy font-sans p-5">
      <div className="bg-gradient-to-r from-neon-lime/20 to-transparent p-4 rounded-xl mb-6 border border-neon-lime/30 flex items-center shadow-lg">
        <Database className="text-neon-lime mr-3" size={24} />
        <div>
          <h2 className="text-white font-extrabold text-lg">관리자 큐레이션 대기열</h2>
          <p className="text-xs text-gray-300 mt-1">AI 봇이 수집한 기사들을 검토하고 메인 피드에 발행하세요.</p>
        </div>
      </div>

      {drafts.length === 0 ? (
        <div className="text-center text-gray-500 py-20 flex flex-col items-center">
          <AlertCircle size={40} className="mb-3 opacity-50" />
          <p>현재 대기 중인 AI 수집 기사가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {drafts.map(draft => (
            <div key={draft.id} className="bg-charcoal-navy rounded-[20px] p-5 shadow-xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-neon-lime" />
              
              <div className="flex justify-between items-start mb-3">
                <span className="bg-deep-navy px-2 py-1 rounded text-[10px] font-bold text-gray-400">
                  {draft.category}
                </span>
                {draft.flag && (
                  <img 
                    src={`https://flagcdn.com/20x15/${draft.flag}.png`} 
                    alt="국기" 
                    className="rounded-sm opacity-80"
                  />
                )}
              </div>
              
              <h3 className="text-white font-bold text-[15px] leading-snug mb-3">
                {draft.title}
              </h3>
              
              <div className="mb-4 bg-black/40 rounded-xl p-3 border border-white/10">
                {draft.image_base64 ? (
                  <div className="relative mb-3 group/img">
                    <img 
                      src={`data:image/png;base64,${draft.image_base64}`} 
                      alt="AI diagram" 
                      className="w-full rounded-lg object-contain max-h-[300px]" 
                    />
                    <button
                      onClick={async () => {
                        try {
                          const updatedDraft = { ...draft, image_base64: "" };
                          await api.updateDraftArticle(updatedDraft);
                          setDrafts(drafts.map(d => d.id === draft.id ? updatedDraft : d));
                        } catch (e) {
                          alert("삭제 실패");
                        }
                      }}
                      className="absolute top-2 right-2 bg-red-500/80 text-white p-1.5 rounded text-xs opacity-0 group-hover/img:opacity-100 transition-opacity"
                    >
                      삭제
                    </button>
                  </div>
                ) : (
                  <div className="mb-2">
                    <label className="block text-xs text-gray-400 mb-2">
                      <span className="text-neon-lime font-bold">💡 추천 이미지:</span> 16:9 비율 (예: 800x450px), 용량 <span className="text-red-400">500KB 이하</span>의 최적화된 사진을 제미나이 등에서 생성 후 업로드해주세요. (DB 용량 제한)
                    </label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        if (file.size > 500 * 1024) {
                          alert("파이어베이스 실시간 DB 1MB 제한으로 인해 500KB 이하의 이미지만 업로드 가능합니다! 이미지를 압축하거나 더 작게 생성해주세요.");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = async (evt) => {
                          try {
                            const base64Str = evt.target.result.split(',')[1];
                            const updatedDraft = { ...draft, image_base64: base64Str };
                            await api.updateDraftArticle(updatedDraft);
                            setDrafts(drafts.map(d => d.id === draft.id ? updatedDraft : d));
                          } catch (err) {
                            alert("업로드 실패: 파일이 너무 커서 DB에서 거부했습니다.");
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="block w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
                    />
                  </div>
                )}
              </div>
              
              <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-4">
                <div className="flex items-center text-neon-lime font-bold text-xs mb-2">
                  <FileText size={14} className="mr-1" /> AI 요약본
                </div>
                <p className="text-gray-300 text-[13px] leading-relaxed whitespace-pre-wrap">
                  {draft.summary && draft.summary.replace(/<br><br>/g, '\n\n').replace(/<span.*?>/g, '').replace(/<\/span>/g, '')}
                </p>
              </div>

              <div className="flex space-x-2 mt-4 pt-4 border-t border-white/10">
                {draft.originalUrl && (
                  <a
                    href={draft.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-white/5 text-gray-300 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10"
                  >
                    <ExternalLink size={14} className="mr-1.5" />
                    원문 보기
                  </a>
                )}
                <button 
                  onClick={() => handlePublish(draft)}
                  className="flex-1 bg-neon-lime text-deep-navy py-2.5 rounded-lg text-xs font-extrabold flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-transform shadow-lg shadow-neon-lime/20"
                >
                  <Send size={14} className="mr-1.5" />
                  발행
                </button>
                <button 
                  onClick={() => handleReject(draft.id)}
                  className="flex-1 bg-red-500/10 text-red-400 py-2.5 rounded-lg text-xs font-extrabold flex items-center justify-center hover:bg-red-500/20 active:scale-95 transition-all border border-red-500/20"
                >
                  <Trash2 size={14} className="mr-1.5" />
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
