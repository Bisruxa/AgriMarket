
import Header from '@/components/common/Header';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const ErrorState = ({ error, onRetry }: ErrorStateProps) => (
  <div>
    <Header />
    <hr />
    <div className="py-6 space-y-4">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mx-4">
        {error}
        <button 
          onClick={onRetry}
          className="ml-4 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    </div>
  </div>
);