import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Users, CalendarDays, CheckCircle2, 
  ArrowRight, Shield, BarChart3, Search, 
  Bell, MessageSquare, FileText, Sparkles,
  Building2, ChevronRight, Star
} from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'Role-Based Access',
    description: 'Secure dashboards tailored for employees and managers with granular permissions.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Track leave trends, approval rates, and team availability with live dashboards.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Search,
    title: 'Smart Search & Filters',
    description: 'Quickly find leave requests by type, status, date range, or employee name.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Bell,
    title: 'Instant Notifications',
    description: 'Get real-time updates when leave requests are submitted, approved, or rejected.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: MessageSquare,
    title: 'Approval Comments',
    description: 'Managers can provide feedback with comments when approving or rejecting requests.',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: FileText,
    title: 'Leave History',
    description: 'Complete audit trail of all leave requests with export capabilities.',
    color: 'from-teal-500 to-cyan-500',
  },
]

const stats = [
  { icon: Building2, value: '500+', label: 'Companies' },
  { icon: Users, value: '50K+', label: 'Employees' },
  { icon: CheckCircle2, value: '98%', label: 'Satisfaction' },
  { icon: CalendarDays, value: '1M+', label: 'Requests Managed' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <CalendarDays className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground">Employee Leave Management System</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Stats</a>
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
            <Link to="/register">
              <Button size="sm" className="rounded-full">
                Get Started <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </nav>
          <Link to="/login" className="md:hidden">
            <Button variant="outline" size="sm">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background via-50% to-background" />
          <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply blur-3xl animate-pulse" />
          <div className="absolute top-0 -right-40 w-96 h-96 bg-cyan-500/20 rounded-full mix-blend-multiply blur-3xl animate-pulse [animation-delay:1s]" />
          <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-primary/20 rounded-full mix-blend-multiply blur-3xl animate-pulse [animation-delay:2s]" />
        </div>

        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />

        {/* Decorative dashboard illustration */}
        <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-3/4 opacity-80">
          <div className="relative w-full h-full">
            <div className="absolute right-10 top-10 w-[500px] h-[350px] rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background border border-border/50 shadow-2xl backdrop-blur-sm p-6 rotate-6">
              <div className="flex gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="space-y-3">
                <div className="h-3 w-3/4 rounded-full bg-foreground/10" />
                <div className="h-3 w-1/2 rounded-full bg-foreground/10" />
                <div className="grid grid-cols-3 gap-3 mt-6">
                  <div className="h-20 rounded-lg bg-primary/20" />
                  <div className="h-20 rounded-lg bg-green-500/20" />
                  <div className="h-20 rounded-lg bg-yellow-500/20" />
                </div>
                <div className="h-2 w-full rounded-full bg-foreground/5 mt-4" />
                <div className="h-2 w-5/6 rounded-full bg-foreground/5" />
                <div className="h-2 w-4/6 rounded-full bg-foreground/5" />
              </div>
            </div>
            <div className="absolute right-32 bottom-10 w-[400px] h-[250px] rounded-2xl bg-gradient-to-br from-background to-primary/5 border border-border/50 shadow-xl p-6 -rotate-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/30" />
                <div className="space-y-1.5">
                  <div className="h-2.5 w-24 rounded-full bg-foreground/10" />
                  <div className="h-2 w-16 rounded-full bg-foreground/5" />
                </div>
                <div className="ml-auto px-3 py-1 rounded-full bg-green-500/20 text-xs text-green-600 font-medium">Approved</div>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full rounded-full bg-foreground/5" />
                <div className="h-2 w-3/4 rounded-full bg-foreground/5" />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-2xl lg:max-w-xl space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-purple-500/10 border border-primary/20 text-sm text-primary font-medium shadow-lg shadow-primary/5">
              <Sparkles className="h-3.5 w-3.5 text-purple-500" />
              <span className="bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text">
                Simplify Leave Management
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground tracking-tight leading-[0.95]">
              Leave{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-500">
                Management
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-primary to-purple-500">
                Made Simple
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Empower your team with a modern leave management system. 
              Submit requests, track approvals, and manage time off — all in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/register">
                <Button size="lg" className="rounded-full text-base px-8 h-12 shadow-2xl shadow-primary/40 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 border-0">
                  Start Free Trial <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="rounded-full text-base px-8 h-12 border-2 hover:bg-primary/5">
                  <Star className="h-4 w-4 mr-2 text-yellow-500" />
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-6 pt-8 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                Free 14-day trial
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                No credit card
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat) => {
            const IconComponent = stat.icon as React.ComponentType<{ className?: string }>
            return (
              <Card key={stat.label} className="border-0 bg-muted/30 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center space-y-2">
                  <div className="inline-flex p-2.5 rounded-xl bg-primary/10">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            Features
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Everything you need to manage leave
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to streamline your leave management process from start to finish.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const IconComponent = feature.icon as React.ComponentType<{ className?: string }>
            return (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default"
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br ${feature.color}`} />
                <CardContent className="p-6 space-y-4">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1.5">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              Ready to transform your leave management?
            </h2>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Join thousands of companies that trust Employee Leave Management System to manage their employee leave requests efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="rounded-full text-base px-8 h-12 shadow-xl">
                  Get Started Free <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="rounded-full text-base px-8 h-12 border-white/30 text-white hover:bg-white/10 hover:text-white">
                  Sign In <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <CalendarDays className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-semibold text-lg text-foreground">Employee Leave Management System</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Modern leave management solution for growing teams.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Product</h4>
              <ul className="space-y-2">
                {['Features', 'Pricing', 'Integrations', 'Changelog'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Company</h4>
              <ul className="space-y-2">
                {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Support</h4>
              <ul className="space-y-2">
                {['Documentation', 'FAQ', 'API Reference', 'Status'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              &copy; 2026 Employee Leave Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
