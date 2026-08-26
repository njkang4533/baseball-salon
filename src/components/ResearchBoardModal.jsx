import { useState, useEffect } from 'react';
import { X, Search, FileText, CheckCircle2, Clock, PlusCircle, ChevronLeft, Send, MessageCircle } from 'lucide-react';
import * as api from '../utils/mockApi';

export default function ResearchBoardModal({ onClose }) {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newReply, setNewReply] = useState('');

  useEffect(() => {
    api.getResearchTasks()
      .then(data => setTasks(data))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsSubmitting(true);
    const newTask = {
      title: newTaskTitle,
      author: "본인 (코치)",
      status: "pending",
      timestamp: new Date().toISOString(),
      replies: []
    };

    try {
      const data = await api.postResearchTask(newTask);
      setTasks([data, ...tasks]);
      setNewTaskTitle('');
      setIsSubmitting(false);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (task) => {
    const newStatus = task.status === 'pending' ? 'resolved' : 'pending';
    
    try {
      const updatedTask = await api.updateResearchTaskStatus(task.id, newStatus);
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      if (selectedTask && selectedTask.id === updatedTask.id) {
        setSelectedTask(updatedTask);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!newReply.trim() || !selectedTask) return;

    const replyObj = {
      id: Date.now(),
      author: "본인 (코치)",
      content: newReply,
      timestamp: new Date().toISOString()
    };

    const updatedReplies = [...(selectedTask.replies || []), replyObj];

    try {
      const updatedTask = await api.updateResearchTaskReplies(selectedTask.id, updatedReplies);
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      setSelectedTask(updatedTask);
      setNewReply('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-deep-navy overflow-y-auto flex flex-col font-sans animate-in slide-in-from-bottom-4 duration-300">
      <div className="sticky top-0 z-10 bg-deep-navy/95 backdrop-blur-xl border-b border-charcoal-navy shadow-sm">
        <div className="flex items-center justify-between px-5 py-4">
          <h1 className="text-xl font-extrabold text-white flex items-center">
            <Search className="mr-2 text-neon-lime" size={24} />
            On-Demand Research
          </h1>
          <button onClick={onClose} className="p-2 -mr-2 text-white hover:bg-white/10 rounded-full transition-colors">
            <X size={28} />
          </button>
        </div>
      </div>

      {!selectedTask ? (
        <div className="flex-1 px-5 py-6 max-w-md mx-auto w-full">
          {/* 새 의뢰 폼 */}
          <div className="bg-charcoal-navy rounded-[20px] p-5 mb-8 border border-white/5 shadow-xl">
            <h2 className="text-sm font-bold text-neon-lime mb-3 flex items-center">
              <PlusCircle size={18} className="mr-1.5" />
              새로운 리서치 의뢰하기
            </h2>
            <form onSubmit={handleSubmit} className="relative">
              <textarea
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="예: 우리 팀 2번 타자의 최근 발사각 저하 원인 분석 부탁합니다..."
                className="w-full bg-deep-navy border border-charcoal-navy focus:border-neon-lime/50 text-white rounded-xl p-4 pb-14 text-sm placeholder-light-gray/50 outline-none resize-none transition-colors shadow-inner"
                rows="3"
                disabled={isSubmitting}
              ></textarea>
              <button 
                type="submit" 
                disabled={!newTaskTitle.trim() || isSubmitting}
                className="absolute bottom-3 right-3 bg-bright-blue text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                의뢰 등록
              </button>
            </form>
          </div>

          {/* 리서치 보드 목록 */}
          <h2 className="text-lg font-bold text-white mb-5 flex items-center">
            <FileText size={20} className="mr-2" />
            리서치 현황판
          </h2>
          
          <div className="space-y-4 pb-10">
            {tasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => setSelectedTask(task)}
                className="bg-charcoal-navy/60 p-5 rounded-[20px] border border-white/5 cursor-pointer hover:bg-charcoal-navy transition-colors group"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide flex items-center ${
                    task.status === 'resolved' 
                      ? 'bg-neon-lime/20 text-neon-lime' 
                      : 'bg-bright-blue/20 text-bright-blue'
                  }`}>
                    {task.status === 'resolved' ? (
                      <><CheckCircle2 size={12} className="mr-1" /> 해결됨</>
                    ) : (
                      <><Clock size={12} className="mr-1" /> 진행 중</>
                    )}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {new Date(task.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-[15px] font-bold text-white leading-snug mb-4 group-hover:text-neon-lime transition-colors">
                  {task.title}
                </h3>
                <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
                  <span className="flex items-center bg-white/5 px-2 py-1 rounded-md">
                    <MessageCircle size={12} className="mr-1.5" />
                    답변 {(task.replies || []).length}
                  </span>
                  <span>의뢰자: {task.author}</span>
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="text-center text-gray-500 py-10 text-sm">
                등록된 리서치 의뢰가 없습니다.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 스레드 뷰 (상세 대화 화면) */
        <div className="flex-1 flex flex-col px-5 py-6 max-w-md mx-auto w-full">
          <button 
            onClick={() => setSelectedTask(null)} 
            className="mb-5 text-light-gray flex items-center hover:text-white transition-colors w-fit text-sm font-medium"
          >
            <ChevronLeft size={18} className="mr-1" /> 목록으로 돌아가기
          </button>
          
          <div className="bg-charcoal-navy rounded-[20px] p-5 mb-6 border border-white/10 shadow-lg relative">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-gray-500 font-medium">{new Date(selectedTask.timestamp).toLocaleString()}</span>
              <button 
                onClick={() => toggleStatus(selectedTask)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold tracking-wide flex items-center transition-transform hover:scale-105 active:scale-95 shadow-md ${
                  selectedTask.status === 'resolved' 
                    ? 'bg-neon-lime text-deep-navy' 
                    : 'bg-bright-blue text-white'
                }`}
              >
                {selectedTask.status === 'resolved' ? (
                  <><CheckCircle2 size={14} className="mr-1" /> 해결 완료 해제</>
                ) : (
                  <><CheckCircle2 size={14} className="mr-1" /> 이 의뢰를 해결 완료로 표시</>
                )}
              </button>
            </div>
            <h2 className="text-[17px] font-bold text-white leading-relaxed mb-4">{selectedTask.title}</h2>
            <div className="text-sm text-gray-400 font-medium bg-black/20 p-3 rounded-xl inline-block">
              👤 작성자: {selectedTask.author}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-1 custom-scrollbar">
            {(selectedTask.replies || []).length === 0 && (
              <div className="text-center text-gray-500 py-10 text-sm">
                아직 등록된 답변이 없습니다.
              </div>
            )}
            {(selectedTask.replies || []).map(reply => (
              <div key={reply.id} className={`p-4 rounded-2xl ${reply.author.includes('본인') ? 'bg-bright-blue/20 border border-bright-blue/30 ml-8' : 'bg-white/5 border border-white/10 mr-8'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-bold ${reply.author.includes('본인') ? 'text-bright-blue' : 'text-neon-lime'}`}>
                    {reply.author}
                  </span>
                  <span className="text-[10px] text-gray-500">{new Date(reply.timestamp).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-sm text-gray-200 leading-relaxed font-medium whitespace-pre-wrap">{reply.content}</p>
              </div>
            ))}
          </div>

          {/* 댓글 입력창 */}
          <form onSubmit={handleReplySubmit} className="relative mt-auto">
            <input 
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              className="w-full bg-charcoal-navy rounded-full py-4 pl-5 pr-14 text-sm text-white focus:border-neon-lime border border-transparent outline-none shadow-xl transition-colors"
              placeholder="답변이나 추가 질문을 입력하세요..."
            />
            <button 
              type="submit" 
              disabled={!newReply.trim()} 
              className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-neon-lime text-deep-navy rounded-full disabled:opacity-50 disabled:bg-gray-600 disabled:text-gray-400 hover:scale-105 active:scale-95 transition-all"
            >
              <Send size={18} className="ml-1" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
