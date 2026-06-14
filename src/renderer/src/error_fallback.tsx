import { Button } from '@/components/ui/button'
import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useNavbar } from './components/context/navbar_context'

export default function ErrorFallback({
  error,
  resetErrorBoundary = () => {}
}: {
  error?: Error
  resetErrorBoundary?: () => void
}) {
  const navigate = useNavigate()
  const { setCrumbs } = useNavbar()

  useEffect(() => {
    setCrumbs('خطأ')
  }, [])

  return (
    <div className="flex-1 h-full w-full flex items-center justify-center bg-background text-foreground">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-xl font-bold text-red-500">حدث خطأ غير متوقع</h1>

        <p className="text-sm text-muted-foreground">{error?.message}</p>

        <div className="flex gap-2 justify-center pt-2">
          <Button
            onClick={() => {
              resetErrorBoundary()
              navigate(0)
            }}
          >
            إعادة المحاولة
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              resetErrorBoundary()
              navigate('/', { replace: true, flushSync: true })
            }}
          >
            الصفحة الرئيسية
          </Button>
        </div>
      </div>
    </div>
  )
}
