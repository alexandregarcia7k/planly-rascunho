import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Kanban, Calculator, BarChart3, Plus, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNotes } from '../contexts/NotesContext';
import { useKanban } from '../contexts/KanbanContext';

const quickActions = [
  {
    title: 'Nova Nota',
    description: 'Criar uma nova nota',
    icon: FileText,
    path: '/notes',
    color: 'bg-blue-500'
  },
  {
    title: 'Novo Card Kanban',
    description: 'Adicionar ao quadro',
    icon: Kanban,
    path: '/kanban',
    color: 'bg-green-500'
  },
  {
    title: 'Calculadoras',
    description: 'Ferramentas de cálculo',
    icon: Calculator,
    path: '/calculators',
    color: 'bg-purple-500'
  },
  {
    title: 'Analytics',
    description: 'Ver estatísticas',
    icon: BarChart3,
    path: '/analytics',
    color: 'bg-orange-500'
  }
];

export default function Dashboard() {
  const { notes } = useNotes();
  const { getCurrentBoard } = useKanban();

  const currentBoard = getCurrentBoard();
  const totalTasks = currentBoard ? currentBoard.columns.reduce((sum, column) => sum + column.cards.length, 0) : 0;
  const completedTasks = currentBoard ? currentBoard.columns.find(col => col.title === 'Concluído')?.cards.length || 0 : 0;
  const recentNotes = notes.slice(-3).reverse();

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta! Aqui está um resumo da sua produtividade.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Notas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{notes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tarefas Totais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalTasks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tarefas Concluídas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{completedTasks}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} to={action.path}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-2`}>
                        <Icon className="text-white" size={20} />
                      </div>
                      <CardTitle className="text-base">{action.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{action.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Notes */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Notas Recentes</h2>
            <Link to="/notes">
              <Button variant="outline" size="sm">
                Ver Todas
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
          
          {recentNotes.length > 0 ? (
            <div className="grid gap-4">
              {recentNotes.map((note) => (
                <Link key={note.id} to={`/notes/${note.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base line-clamp-1">
                        {note.title || 'Nota sem título'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {note.content || 'Conteúdo vazio'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {note.updatedAt.toLocaleDateString('pt-BR')}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <FileText className="text-muted-foreground mb-4" size={48} />
                <p className="text-muted-foreground text-center mb-4">
                  Você ainda não criou nenhuma nota
                </p>
                <Link to="/notes">
                  <Button>
                    <Plus size={16} className="mr-2" />
                    Criar Primeira Nota
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
