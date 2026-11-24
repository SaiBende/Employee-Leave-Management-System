import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Sparkles } from 'lucide-react'
import { portals } from '@/lib/portals'
import { useSetupStatus } from '@/hooks/use-setup-status'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function PortalChooserPage() {
  const { data, isLoading } = useSetupStatus()
  const needsSetup = data?.needsSetup === true

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          Choose your workspace
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">One platform. Four portals.</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
          Sign in through the portal that matches your role. Each company is fully isolated,
          with a separate platform console for the platform owner.
        </p>
      </div>

      {!isLoading && needsSetup && (
        <Link
          to="/setup"
          className="mb-5 flex items-center gap-3 p-4 rounded-xl border border-amber-300/60 bg-amber-50 text-amber-900 hover:bg-amber-100 transition-colors"
        >
          <div className="h-10 w-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">Finish platform setup</p>
            <p className="text-xs text-amber-700">Create the platform super admin before companies can sign up.</p>
          </div>
          <ArrowRight className="h-4 w-4 ml-auto shrink-0" />
        </Link>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {portals.map((portal) => {
          const Icon = portal.icon
          return (
            <Link key={portal.id} to={portal.path} className="group">
              <Card className="h-full border border-border/60 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                <div className={cn('h-1 w-full bg-gradient-to-r', portal.accent)} />
                <CardContent className="p-5 flex items-start gap-4">
                  <div className={cn('h-11 w-11 rounded-xl text-white flex items-center justify-center shadow-md shrink-0', portal.iconBg)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground flex items-center gap-2">
                      {portal.title}
                      <span className={cn('text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5', portal.badge)}>
                        {portal.subtitle}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{portal.description}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary mt-3">
                      Open portal
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="text-center mt-7 space-y-2">
        <p className="text-sm text-muted-foreground">
          New company?{' '}
          <Link to="/signup" className="text-primary font-semibold hover:text-primary/80 transition-colors">
            Create a company account
          </Link>
        </p>
        <p className="text-xs text-muted-foreground">
          Employees and managers receive credentials from their company administrator.
        </p>
      </div>
    </div>
  )
}
