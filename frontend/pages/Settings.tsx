import React, { useState } from 'react';
import { Moon, Sun, Palette, Database, Info, Download, Upload, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useTheme } from '../contexts/ThemeContext';
import { useNotes } from '../contexts/NotesContext';
import { useKanban } from '../contexts/KanbanContext';
import { useAnalytics } from '../contexts/AnalyticsContext';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { notes, tags } = useNotes();
  const { boards, getCurrentBoard } = useKanban();
  const { data: analyticsData } = useAnalytics();
  const { toast } = useToast();
  const [autoSave, setAutoSave] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const currentBoard = getCurrentBoard();
  const totalKanbanCards = currentBoard ? currentBoard.columns.reduce((sum, col) => sum + col.cards.length, 0) : 0;

  const exportData = () => {
    const data = {
      notes,
      tags,
      kanbanBoards: boards,
      analytics: analyticsData,
      theme,
      settings: {
        autoSave,
        notifications
      },
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planly-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Dados exportados",
      description: "Seus dados foram exportados com sucesso.",
    });
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate data structure
        if (data.notes && data.tags) {
          localStorage.setItem('planly-notes', JSON.stringify(data.notes));
          localStorage.setItem('planly-tags', JSON.stringify(data.tags));
          
          // Handle both old and new kanban formats
          if (data.kanbanBoards) {
            localStorage.setItem('planly-kanban-boards', JSON.stringify(data.kanbanBoards));
          } else if (data.kanban) {
            localStorage.setItem('planly-kanban', JSON.stringify(data.kanban));
          }
          
          if (data.analytics) {
            localStorage.setItem('planly-analytics', JSON.stringify(data.analytics));
          }
          
          if (data.theme) {
            localStorage.setItem('planly-theme', data.theme);
          }

          toast({
            title: "Dados importados",
            description: "Seus dados foram importados com sucesso. Recarregue a página para ver as mudanças.",
          });
        } else {
          throw new Error('Formato de arquivo inválido');
        }
      } catch (error) {
        toast({
          title: "Erro na importação",
          description: "O arquivo selecionado não é válido.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (window.confirm('Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.')) {
      localStorage.removeItem('planly-notes');
      localStorage.removeItem('planly-tags');
      localStorage.removeItem('planly-kanban-boards');
      localStorage.removeItem('planly-kanban-current-board');
      localStorage.removeItem('planly-kanban-tags');
      localStorage.removeItem('planly-analytics');
      localStorage.removeItem('planly-analytics-settings');
      
      toast({
        title: "Dados apagados",
        description: "Todos os dados foram removidos. Recarregue a página.",
      });
    }
  };

  const calculateStorageSize = () => {
    const data = {
      notes: localStorage.getItem('planly-notes') || '',
      tags: localStorage.getItem('planly-tags') || '',
      kanbanBoards: localStorage.getItem('planly-kanban-boards') || '',
      kanbanTags: localStorage.getItem('planly-kanban-tags') || '',
      analytics: localStorage.getItem('planly-analytics') || ''
    };

    const totalSize = Object.values(data).reduce((sum, item) => sum + item.length, 0);
    return (totalSize / 1024).toFixed(2); // KB
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Configurações</h1>
          <p className="text-muted-foreground">
            Personalize sua experiência no Planly
          </p>
        </div>

        <div className="max-w-4xl space-y-8">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette size={20} />
                Aparência
              </CardTitle>
              <CardDescription>
                Customize a aparência do aplicativo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Tema</Label>
                  <p className="text-sm text-muted-foreground">
                    Escolha entre o modo claro e escuro
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Sun size={16} className="text-muted-foreground" />
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  />
                  <Moon size={16} className="text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Preferências</CardTitle>
              <CardDescription>
                Configure o comportamento do aplicativo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Salvamento Automático</Label>
                  <p className="text-sm text-muted-foreground">
                    Salva automaticamente suas alterações
                  </p>
                </div>
                <Switch
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Notificações</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações sobre suas atividades
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database size={20} />
                Gerenciamento de Dados
              </CardTitle>
              <CardDescription>
                Faça backup, importe ou apague seus dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Exportar Dados</Label>
                  <p className="text-sm text-muted-foreground">
                    Baixe um backup de todos os seus dados
                  </p>
                </div>
                <Button onClick={exportData} variant="outline">
                  <Download size={16} className="mr-2" />
                  Exportar
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Importar Dados</Label>
                  <p className="text-sm text-muted-foreground">
                    Restore dados de um backup anterior
                  </p>
                </div>
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                    id="import-file"
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="import-file" className="cursor-pointer flex items-center">
                      <Upload size={16} className="mr-2" />
                      Importar
                    </label>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Apagar Todos os Dados</Label>
                  <p className="text-sm text-muted-foreground">
                    Remove permanentemente todos os seus dados
                  </p>
                </div>
                <Button onClick={clearAllData} variant="destructive">
                  <Trash2 size={16} className="mr-2" />
                  Apagar Tudo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* App Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info size={20} />
                Informações do Aplicativo
              </CardTitle>
              <CardDescription>
                Estatísticas e informações sobre o uso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{notes.length}</div>
                  <div className="text-sm text-muted-foreground">Notas</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{tags.length}</div>
                  <div className="text-sm text-muted-foreground">Tags</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-foreground">
                    {totalKanbanCards}
                  </div>
                  <div className="text-sm text-muted-foreground">Cards Kanban</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{calculateStorageSize()}</div>
                  <div className="text-sm text-muted-foreground">KB Usados</div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Versão do Planly</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Última atualização</span>
                  <span className="font-medium">Dezembro 2024</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
