"use client"

import { Component, ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Application Error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <Card className="p-8 max-w-md w-full bg-slate-800/50 border-red-500/30">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-white">Application Error</h2>
              <p className="text-slate-300">
                Something went wrong. Please try refreshing the page.
              </p>
              {this.state.error && (
                <details className="text-left w-full">
                  <summary className="text-sm text-slate-400 cursor-pointer hover:text-slate-300">
                    Error Details
                  </summary>
                  <pre className="mt-2 p-3 bg-slate-900/50 rounded text-xs text-red-400 overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Refresh Page
              </Button>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
