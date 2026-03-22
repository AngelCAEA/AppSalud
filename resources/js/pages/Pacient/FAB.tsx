import { Plus } from 'lucide-react';

interface FABProps {
  onClick: () => void;
}

export function FAB({ onClick }: FABProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110 active:scale-95 z-50 group cursor-pointer"
      style={{ width: '72px', height: '72px' }}
    >
      <div className="flex flex-col items-center justify-center">
        <Plus className="w-8 h-8" strokeWidth={3} />
        <span className="text-xs mt-0.5">Registrar</span>
      </div>
      
      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-20 group-hover:animate-ping"></div>
    </button>
  );
}