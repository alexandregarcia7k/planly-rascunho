import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Tag, Plus, X, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useNotes } from '../contexts/NotesContext';
import { ColorPicker } from '../components/ColorPicker';
import { UnsavedChangesDialog } from '../components/UnsavedChangesDialog';

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { notes, getNoteById, updateNote, deleteNote, tags, createTag } = useNotes();
  
  const note = id ? getNoteById(id) : null;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');

  // Unsaved changes tracking
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [originalData, setOriginalData] = useState<{ title: string; content: string; tags: string[] } | null>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setSelectedTags(note.tags);
      setOriginalData({
        title: note.title,
        content: note.content,
        tags: [...note.tags]
      });
    } else if (id) {
      navigate('/notes');
    }
  }, [note, id, navigate]);

  useEffect(() => {
    if (!id && notes.length > 0) {
      const latestNote = notes[notes.length - 1];
      navigate(`/notes/${latestNote.id}`);
    }
  }, [notes, id, navigate]);

  // Track unsaved changes
  useEffect(() => {
    if (originalData) {
      const hasChanges = 
        title !== originalData.title ||
        content !== originalData.content ||
        JSON.stringify(selectedTags.sort()) !== JSON.stringify(originalData.tags.sort());
      
      setHasUnsavedChanges(hasChanges);
    }
  }, [title, content, selectedTags, originalData]);

  // Handle browser beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Tem alterações não salvas. Deseja realmente sair?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleUnsavedChanges = (action: () => void) => {
    if (hasUnsavedChanges) {
      setPendingAction(() => action);
      setShowUnsavedDialog(true);
    } else {
      action();
    }
  };

  const handleSaveChanges = () => {
    handleSave();
    setShowUnsavedDialog(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleDiscardChanges = () => {
    setHasUnsavedChanges(false);
    setShowUnsavedDialog(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleCancelUnsaved = () => {
    setShowUnsavedDialog(false);
    setPendingAction(null);
  };

  const handleSave = () => {
    if (!note) return;
    
    updateNote(note.id, {
      title,
      content,
      tags: selectedTags
    });
    
    setOriginalData({
      title,
      content,
      tags: [...selectedTags]
    });
    
    setHasUnsavedChanges(false);
    
    toast({
      title: "Nota salva",
      description: "Suas alterações foram salvas com sucesso.",
    });
  };

  const handleDelete = () => {
    if (!note) return;
    
    if (window.confirm('Tem certeza que deseja excluir esta nota?')) {
      deleteNote(note.id);
      navigate('/notes');
      
      toast({
        title: "Nota excluída",
        description: "A nota foi excluída com sucesso.",
      });
    }
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    
    createTag({
      name: newTagName,
      color: newTagColor
    });
    
    setNewTagName('');
    setIsCreateTagOpen(false);
    
    toast({
      title: "Tag criada",
      description: `A tag "${newTagName}" foi criada com sucesso.`,
    });
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleNavigation = (path: string) => {
    handleUnsavedChanges(() => navigate(path));
  };

  if (!note && id) {
    return (
      <Layout>
        <div className="p-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-foreground mb-2">Nota não encontrada</h2>
            <p className="text-muted-foreground mb-4">A nota que você está procurando não existe.</p>
            <Button onClick={() => navigate('/notes')}>
              Voltar para Notas
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => handleNavigation('/notes')}>
              <ArrowLeft size={16} className="mr-2" />
              Voltar
            </Button>
            {hasUnsavedChanges && (
              <div className="flex items-center gap-1 text-amber-600">
                <AlertCircle size={14} />
                <span className="text-sm">Alterações não salvas</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleSave}>
              <Save size={16} className="mr-2" />
              Salvar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 size={16} className="mr-2" />
              Excluir
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Input
              placeholder="Título da nota..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold border-none px-0 focus-visible:ring-0 placeholder:text-muted-foreground"
            />
          </div>

          {/* Tags */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Tag size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Tags</span>
              <Dialog open={isCreateTagOpen} onOpenChange={setIsCreateTagOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus size={14} className="mr-1" />
                    Nova Tag
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Tag</DialogTitle>
                    <DialogDescription>
                      Crie uma nova tag para organizar suas notas
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="tagName">Nome da Tag</Label>
                      <Input
                        id="tagName"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="Digite o nome da tag..."
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
                      />
                    </div>
                    <ColorPicker
                      value={newTagColor}
                      onChange={setNewTagColor}
                      label="Cor da Tag"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateTagOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateTag}>
                        Criar Tag
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  style={{
                    backgroundColor: selectedTags.includes(tag.id) ? tag.color : 'transparent',
                    borderColor: tag.color,
                    color: selectedTags.includes(tag.id) ? 'white' : tag.color
                  }}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                  {selectedTags.includes(tag.id) && <X size={12} className="ml-1" />}
                </Badge>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <Textarea
              placeholder="Escreva sua nota aqui..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[500px] border-none px-0 focus-visible:ring-0 resize-none text-base"
            />
          </div>

          {/* Footer */}
          {note && (
            <div className="mt-6 pt-6 border-t border-border text-sm text-muted-foreground">
              <p>Criado em {note.createdAt.toLocaleDateString('pt-BR')} às {note.createdAt.toLocaleTimeString('pt-BR')}</p>
              <p>Última atualização em {note.updatedAt.toLocaleDateString('pt-BR')} às {note.updatedAt.toLocaleTimeString('pt-BR')}</p>
            </div>
          )}
        </div>

        {/* Unsaved Changes Dialog */}
        <UnsavedChangesDialog
          open={showUnsavedDialog}
          onSave={handleSaveChanges}
          onDiscard={handleDiscardChanges}
          onCancel={handleCancelUnsaved}
        />
      </div>
    </Layout>
  );
}
