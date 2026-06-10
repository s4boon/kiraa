import React from 'react'

class ErrorBoundary extends React.Component {
  state = { hasError: false }
  declare props: Readonly<{
    fallback: React.ReactNode
    children: React.ReactNode
  }>
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.log(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

export default ErrorBoundary
