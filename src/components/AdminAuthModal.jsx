import { useState } from 'react';
import { Lock, X } from 'lucide-react';

export default function AdminAuthModal({ onSuccess, onClose }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKeypad = (num) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const verifyPin = (enteredPin) => {
    if (enteredPin === '3771') {
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => {
        setPin('');
        setError(false);
      }, 800);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-200 px-5">
      <div className="bg-deep-navy border border-charcoal-navy rounded-[24px] p-6 w-full max-w-sm shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full">
          <X size={20} />
        </button>

        <div className="mb-6 text-center mt-2">
          <div className="w-12 h-12 bg-charcoal-navy rounded-full flex items-center justify-center mx-auto mb-3 border border-neon-lime/30 shadow-[0_0_15px_rgba(202,255,0,0.15)]">
            <Lock size={20} className="text-neon-lime" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tighter">관리자 인증</h2>
          <p className="text-gray-400 text-xs mt-1">관리자 전용 코드를 입력하세요</p>
        </div>

        <div className="flex justify-center space-x-3 mb-6">
          {[0, 1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`w-3.5 h-3.5 rounded-full transition-colors duration-200 ${
                pin.length > i 
                  ? (error ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-neon-lime shadow-[0_0_8px_rgba(202,255,0,0.6)]') 
                  : 'bg-charcoal-navy border border-white/10'
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 w-full max-w-[240px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button 
              key={num}
              onClick={() => handleKeypad(num.toString())}
              className="w-14 h-14 rounded-full bg-charcoal-navy text-white text-lg font-bold mx-auto hover:bg-white/10 active:scale-90 transition-all flex items-center justify-center shadow-inner"
            >
              {num}
            </button>
          ))}
          <div />
          <button 
            onClick={() => handleKeypad('0')}
            className="w-14 h-14 rounded-full bg-charcoal-navy text-white text-lg font-bold mx-auto hover:bg-white/10 active:scale-90 transition-all flex items-center justify-center shadow-inner"
          >
            0
          </button>
          <button 
            onClick={handleDelete}
            className="w-14 h-14 rounded-full text-gray-400 text-[11px] font-bold mx-auto hover:text-white active:scale-90 transition-all flex items-center justify-center bg-white/5"
          >
            지우기
          </button>
        </div>
      </div>
    </div>
  );
}
