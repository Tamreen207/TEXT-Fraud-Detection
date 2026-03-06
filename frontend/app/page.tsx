import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ShieldAlert,
  BrainCircuit,
  Lock,
  ArrowRight,
  Zap,
  Eye,
  Shield,
} from "lucide-react";

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section - Premium Design */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden py-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* Gradient Orb 1 */}
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-purple-500/20 rounded-full blur-3xl animate-float"></div>

          {/* Gradient Orb 2 */}
          <div
            className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-500/30 to-pink-500/20 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          ></div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
        </div>

        <div className="relative z-10 w-full max-w-6xl px-4 sm:px-6">
          {/* Badge */}
          <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="badge-gradient">
              <BrainCircuit className="w-4 h-4" />
              Next-Gen AI Security
            </div>
          </div>

          {/* Main Heading */}
          <div className="text-center space-y-6 mb-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              Detect Fraud <br className="hidden sm:block" />
              <span className="gradient-text">Before It Happens</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Enterprise-grade AI-powered fraud detection. Instantly identify
              scams, phishing attempts, and manipulative language with
              military-grade accuracy.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link href="/analyze">
              <Button
                size="lg"
                className="gradient-button text-base px-10 h-12 rounded-lg hover:opacity-90 transition-opacity duration-200 group"
              >
                Start Analysis
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button
                variant="outline"
                size="lg"
                className="text-base px-10 h-12 rounded-lg border-2 hover:bg-muted/50 transition-colors duration-200"
              >
                Try Demo
              </Button>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 max-w-4xl mx-auto">
            {[
              { label: "Fraud Detection", value: "99.8%" },
              { label: "Processing Speed", value: "<100ms" },
              { label: "Active Models", value: "12+" },
              { label: "Daily Scans", value: "10K+" },
            ].map((stat, i) => (
              <div
                key={i}
                className="glass-dark p-4 rounded-lg text-center border border-white/10 hover:border-blue-500/30 transition-colors duration-200"
              >
                <div className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 sm:py-32 bg-gradient-to-b from-background via-background to-muted/30">
        <div className="container max-w-6xl">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="badge-gradient justify-center mb-6 w-fit mx-auto">
              <Zap className="w-4 h-4" />
              Powerful Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-3">
              What Makes Us Different
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Cutting-edge technology combined with practical intelligence
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<ShieldAlert className="w-7 h-7 text-red-500" />}
              title="Phishing Detection"
              description="Instantly identifies suspicious domains, urgent language patterns, and social engineering tactics used by attackers."
              gradient="from-red-500/10 to-pink-500/10"
            />
            <FeatureCard
              icon={<BrainCircuit className="w-7 h-7 text-orange-500" />}
              title="AI Content Analysis"
              description="Advanced algorithms distinguish between human conversation and AI-generated scripts with unprecedented accuracy."
              gradient="from-yellow-500/10 to-orange-500/10"
            />
            <FeatureCard
              icon={<Eye className="w-7 h-7 text-blue-500" />}
              title="Real-Time Monitoring"
              description="Process messages instantly with sub-second response times. Detect threats before they can cause harm."
              gradient="from-blue-500/10 to-cyan-500/10"
            />
            <FeatureCard
              icon={<Lock className="w-7 h-7 text-green-500" />}
              title="Enterprise Security"
              description="Bank-level encryption and privacy. Your data is analyzed locally and never stored permanently."
              gradient="from-green-500/10 to-emerald-500/10"
            />
            <FeatureCard
              icon={<Shield className="w-7 h-7 text-purple-500" />}
              title="Multi-Vector Analysis"
              description="Combines URL analysis, text classification, and behavioral patterns for comprehensive threat assessment."
              gradient="from-purple-500/10 to-blue-500/10"
            />
            <FeatureCard
              icon={<Zap className="w-7 h-7 text-yellow-500" />}
              title="Lightning Fast"
              description="Optimized algorithms deliver results in milliseconds without compromising accuracy or depth of analysis."
              gradient="from-amber-500/10 to-yellow-500/10"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="container max-w-4xl text-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold mb-3">
                Ready to Protect Your Users?
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                Join thousands of organizations preventing fraud in real-time
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/analyze">
                <Button
                  size="lg"
                  className="gradient-button text-base px-10 h-12 rounded-lg hover:opacity-90 transition-opacity duration-200"
                >
                  Get Started Free
                </Button>
              </Link>
              <Link href="/demo">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base px-10 h-12 rounded-lg hover:bg-muted/50 transition-colors duration-200"
                >
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

function FeatureCard({ icon, title, description, gradient }: FeatureCardProps) {
  return (
    <div
      className={`group relative overflow-hidden bg-gradient-to-br ${gradient} border-2 border-border rounded-lg p-6 transition-all duration-200 hover:border-blue-500/40 hover:-translate-y-0.5`}
    >
      {/* Subtle shadow overlay that doesn't affect layout */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg shadow-blue-500/10 -z-10"></div>

      {/* Content */}
      <div className="relative z-10 space-y-4">
        <div className="w-12 h-12 rounded-lg bg-background/80 backdrop-blur border border-border flex items-center justify-center transition-transform duration-200">
          {icon}
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
