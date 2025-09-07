import React from 'react';

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log the error to console for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <div className="container mx-auto p-8 max-w-4xl">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <h2 className="text-xl font-semibold text-red-800 mb-4">Oops! Bir hata oluştu</h2>
                        <p className="text-red-700 mb-4">
                            Bir React bileşeni hatası meydana geldi. Sayfayı yeniden yükleyerek deneyebilirsiniz.
                        </p>
                        <div className="space-y-2">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 border border-red-300 transition-colors mr-4"
                            >
                                Sayfayı Yenile
                            </button>
                            <button
                                onClick={() => this.setState({ hasError: false })}
                                className="px-6 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors"
                            >
                                Tekrar Dene
                            </button>
                        </div>
                        {this.state.error && (
                            <details className="mt-4 text-left">
                                <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
                                    Hata Detayları (Geliştiriciler için)
                                </summary>
                                <pre className="mt-2 text-xs text-red-700 bg-red-100 p-2 rounded overflow-auto">
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
