import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@components/ui/Button'

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
          <div className="text-4xl mb-4">🌾</div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-500 max-w-sm mb-6">
            {this.state.error?.message ?? 'An unexpected error occurred. Please try again.'}
          </p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
