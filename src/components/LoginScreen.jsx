import { useState } from 'react';
import { Lock } from 'lucide-react';
import * as api from '../utils/mockApi';

export default function LoginScreen({ onLoginSuccess }) {
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

  const verifyPin = async (enteredPin) => {
    try {
      const isValid = await api.verifyPin(enteredPin);
      if (isValid) {
        localStorage.setItem('salon_auth', 'true');
        onLoginSuccess();
      } else {
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 1000);
      }
    } catch (e) {
      console.error(e);
      alert('오류가 발생했습니다.');
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-deep-navy flex flex-col items-center justify-center font-sans max-w-md mx-auto shadow-2xl relative">
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-charcoal-navy rounded-full flex items-center justify-center mx-auto mb-4 border border-neon-lime/30">
          <Lock size={28} className="text-neon-lime" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tighter">Baseball Salon</h1>
        <p className="text-light-gray text-sm mt-2 font-medium">코치진 전용 4자리 코드를 입력해주세요</p>
      </div>

      <div className="flex space-x-4 mb-10">
        {[0, 1, 2, 3].map(i => (
          <div 
            key={i} 
            className={`w-4 h-4 rounded-full transition-colors ${
              pin.length > i 
                ? (error ? 'bg-red-500' : 'bg-neon-lime') 
                : 'bg-charcoal-navy border border-white/10'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 w-full px-12">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button 
            key={num}
            onClick={() => handleKeypad(num.toString())}
            className="w-16 h-16 rounded-full bg-charcoal-navy text-white text-2xl font-bold mx-auto hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center"
          >
            {num}
          </button>
        ))}
        <div />
        <button 
          onClick={() => handleKeypad('0')}
          className="w-16 h-16 rounded-full bg-charcoal-navy text-white text-2xl font-bold mx-auto hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center"
        >
          0
        </button>
        <button 
          onClick={handleDelete}
          className="w-16 h-16 rounded-full text-light-gray text-sm font-bold mx-auto hover:text-white active:scale-95 transition-all flex items-center justify-center"
        >
          지우기
        </button>
      </div>
    </div>
  );
}
