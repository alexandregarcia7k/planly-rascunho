import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, FileText, CheckSquare, Target, Calendar, Filter } from 'lucide-react';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { useNotes } from '../contexts/NotesContext';
import { useKanban } from '../contexts/KanbanContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Analytics() {
  const { settings, updateSettings } = useAnalytics();
  const { notes, tags } = useNotes();
  const { getCurrentBoard } = useKanban();

  // Generate mock data for charts
  const generateChartData = () => {
    const now = new Date();
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
        notesCreated: Math.floor(Math.random() * 5) + 1,
        tasksCompleted: Math.floor(Math.random() * 8) + 2,
        tasksCreated: Math.floor(Math.random() * 6) + 3,
        productivity: Math.floor(Math.random() * 30) + 70
      });
    }
    
    return data;
  };

  const chartData = generateChartData();

  const currentBoard = getCurrentBoard();
  const totalTasks = currentBoard ? currentBoard.columns.reduce((sum, column) => sum + column.cards.length, 0) : 0;
  const completedTasks = currentBoard ? currentBoard.columns.find(col => col.title === 'Concluído')?.cards.length || 0 : 0;
  const inProgressTasks = currentBoard ? currentBoard.columns.find(col => col.title === 'Em Progresso')?.cards.length || 0 : 0;
  const todoTasks = currentBoard ? currentBoard.columns.find(col => col.title === 'A Fazer')?.cards.length || 0 : 0;

  const taskDistribution = [
    { name: 'A Fazer', value: todoTasks, color: '#FF8042' },
    { name: 'Em Progresso', value: inProgressTasks, color: '#FFBB28' },
    { name: 'Concluído', value: completedTasks, color: '#00C49F' }
  ];

  const tagUsage = tags.map(tag => ({
    name: tag.name,
    value: notes.filter(note => note.tags.includes(tag.id)).length,
    color: tag.color
  })).filter(tag => tag.value > 0);

  const stats = [
    {
      title: 'Total de Notas',
      value: notes.length,
      icon: FileText,
      color: 'text-blue-500'
    },
    {
      title: 'Tarefas Concluídas',
      value: completedTasks,
      icon: CheckSquare,
      color: 'text-green-500'
    },
    {
      title: 'Tarefas Totais',
      value: totalTasks,
      icon: Target,
      color: 'text-purple-500'
    },
    {
      title: 'Taxa de Conclusão',
      value: totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}%` : '0%',
      icon: TrendingUp,
      color: 'text-orange-500'
    }
  ];

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
              <p className="text-muted-foreground">
                Acompanhe seu progresso e produtividade
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-muted-foreground" />
              <Select value={settings.dateRange} onValueChange={(value: 'week' | 'month' | 'year') => updateSettings({ dateRange: value })}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">7 dias</SelectItem>
                  <SelectItem value="month">30 dias</SelectItem>
                  <SelectItem value="year">1 ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <Icon className={`${stat.color}`} size={20} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Chart Settings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter size={20} />
              Configurações de Visualização
            </CardTitle>
            <CardDescription>
              Escolha quais métricas deseja visualizar nos gráficos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showNotes"
                  checked={settings.showNotes}
                  onCheckedChange={(checked) => updateSettings({ showNotes: !!checked })}
                />
                <label htmlFor="showNotes" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Notas Criadas
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showTasks"
                  checked={settings.showTasks}
                  onCheckedChange={(checked) => updateSettings({ showTasks: !!checked })}
                />
                <label htmlFor="showTasks" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Tarefas
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showProductivity"
                  checked={settings.showProductivity}
                  onCheckedChange={(checked) => updateSettings({ showProductivity: !!checked })}
                />
                <label htmlFor="showProductivity" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Produtividade
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Productivity Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Produtividade</CardTitle>
              <CardDescription>
                Acompanhe sua evolução ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  {settings.showNotes && (
                    <Line
                      type="monotone"
                      dataKey="notesCreated"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Notas Criadas"
                    />
                  )}
                  {settings.showTasks && (
                    <>
                      <Line
                        type="monotone"
                        dataKey="tasksCompleted"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Tarefas Concluídas"
                      />
                      <Line
                        type="monotone"
                        dataKey="tasksCreated"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        name="Tarefas Criadas"
                      />
                    </>
                  )}
                  {settings.showProductivity && (
                    <Line
                      type="monotone"
                      dataKey="productivity"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="Produtividade (%)"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Task Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Tarefas</CardTitle>
              <CardDescription>
                Visão geral do status das suas tarefas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {taskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Atividade Semanal</CardTitle>
              <CardDescription>
                Comparação de diferentes métricas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  {settings.showNotes && (
                    <Bar dataKey="notesCreated" fill="#3b82f6" name="Notas Criadas" />
                  )}
                  {settings.showTasks && (
                    <>
                      <Bar dataKey="tasksCompleted" fill="#10b981" name="Tarefas Concluídas" />
                      <Bar dataKey="tasksCreated" fill="#f59e0b" name="Tarefas Criadas" />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tag Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Uso de Tags</CardTitle>
              <CardDescription>
                Quais tags você mais utiliza
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tagUsage.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={tagUsage} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-72 text-muted-foreground">
                  <div className="text-center">
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Nenhuma tag utilizada ainda</p>
                    <p className="text-sm">Crie tags nas suas notas para ver as estatísticas</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
