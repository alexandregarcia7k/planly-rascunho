import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  FileText, 
  Kanban, 
  Calculator, 
  BarChart3, 
  Moon, 
  Sun,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '../contexts/ThemeContext';

const features = [
  {
    icon: FileText,
    title: 'Notas Inteligentes',
    description: 'Sistema de notas com tags personalizáveis e organização visual intuitiva.'
  },
  {
    icon: Kanban,
    title: 'Quadro Kanban',
    description: 'Visualize e gerencie suas tarefas com drag-and-drop e comentários.'
  },
  {
    icon: Calculator,
    title: 'Calculadoras e Conversores',
    description: 'Diversas ferramentas de cálculo para seu dia a dia produtivo.'
  },
  {
    icon: BarChart3,
    title: 'Analytics Personalizados',
    description: 'Acompanhe seu progresso com gráficos e estatísticas detalhadas.'
  }
];

const benefits = [
  'Interface moderna e intuitiva',
  'Modo escuro e claro',
  'Totalmente responsivo',
  'Dados salvos localmente',
  'Sem necessidade de login',
  'Gratuito e open source'
];

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">P</span>
              </div>
              <span className="text-2xl font-bold text-foreground">Planly</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </Button>
              <Link to="/dashboard">
                <Button>
                  Começar Agora
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Organize sua vida com
            <span className="text-primary block">Planly</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            A plataforma completa de produtividade que reúne notas, kanban, calculadoras e analytics 
            em um só lugar. Simples, moderno e totalmente gratuito.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                Começar Gratuitamente
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Ver Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tudo que você precisa para ser mais produtivo
          </h2>
          <p className="text-lg text-muted-foreground">
            Ferramentas poderosas em uma interface limpa e intuitiva
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-border">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="text-primary" size={24} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-muted/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Por que escolher o Planly?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Desenvolvido com foco na experiência do usuário, o Planly oferece uma abordagem 
                moderna e eficiente para gerenciar suas tarefas e projetos.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckCircle2 className="text-primary flex-shrink-0" size={20} />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-card rounded-2xl p-8 border border-border">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">NOTAS CRIADAS</span>
                  <span className="text-2xl font-bold text-primary">247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">TAREFAS CONCLUÍDAS</span>
                  <span className="text-2xl font-bold text-green-500">189</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">PRODUTIVIDADE</span>
                  <span className="text-2xl font-bold text-blue-500">94%</span>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    Acompanhe seu progresso em tempo real
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center bg-card rounded-2xl p-12 border border-border">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Pronto para aumentar sua produtividade?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Comece a usar o Planly agora mesmo. É gratuito e não requer cadastro.
          </p>
          <Link to="/dashboard">
            <Button size="lg">
              Começar Agora
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">P</span>
              </div>
              <span className="text-foreground font-semibold">Planly</span>
              <span className="text-muted-foreground">© 2024</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
