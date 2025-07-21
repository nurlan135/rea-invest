'use client'

import { Component, ReactNode, ErrorInfo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Xəta Baş Verdi</CardTitle>
              <CardDescription>
                Tətbiqdə gözlənilməz bir xəta baş verdi. Lütfən səhifəni yeniləyin.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Səhifəni Yenilə
              </Button>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4 text-left">
                  <details className="text-sm text-gray-600">
                    <summary className="cursor-pointer">Xəta Detalları</summary>
                    <pre className="mt-2 whitespace-pre-wrap bg-gray-100 p-2 rounded">
                      {this.state.error.message}
                    </pre>
                  </details>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}