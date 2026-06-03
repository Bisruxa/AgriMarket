
import Header from '@/components/common/Header';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const ErrorState = ({ error, onRetry }: ErrorStateProps) => (
  <div className="w-full min-w-0 max-w-full">
    <Header />
    <hr />
    <div className="py-6 space-y-4">
      <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
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