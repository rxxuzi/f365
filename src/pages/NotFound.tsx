import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center animate-in">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">ページが見つかりませんでした</p>
      <Link 
        to="/" 
        className="flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors"
      >
        <Home className="w-4 h-4 mr-2" />
        ホームに戻る
      </Link>
    </div>
  );
}