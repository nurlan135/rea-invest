import { Button } from '@/components/ui/button'
import { LoadingSpinner } from './loading-spinner'
import { cn } from '@/lib/utils'

interface ButtonLoadingProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  children: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function ButtonLoading({ 
  isLoading, 
  children, 
  disabled,
  className,
  ...props 
}: ButtonLoadingProps) {
  return (
    <Button 
      disabled={disabled || isLoading} 
      className={cn(className)}
      {...props}
    >
      {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </Button>
  )
}