import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background relative overflow-hidden">
      <div className="absolute top-0 -left-40 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply blur-3xl" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply blur-3xl" />
      
      <div className="text-center space-y-6 relative z-10 px-4">
        <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-500">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Link to="/">
            <Button>
              <Home className="h-4 w-4" /> Go Home
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
