import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { 
  Plus, 
  MoreHorizontal, 
  MessageSquare, 
  X, 
  Edit2, 
  Trash2,
  Calendar,
  User,
  AlertCircle,
  Tag as TagIcon,
  ChevronDown,
  Settings
} from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useKanban, KanbanCard, KanbanBoard } from '../contexts/KanbanContext';
import { ColorPicker } from '../components/ColorPicker';
import { UnsavedChangesDialog } from '../components/UnsavedChangesDialog';

const PRIORITY_OPTIONS = [
  { value: 'baixa', label: 'Baixa', color: '#10b981' },
  { value: 'media', label: 'Média', color: '#f59e0b' },
  { value: 'alta', label: 'Alta', color: '#ef4444' }
];

export default function Kanban() {
  const { toast } = useToast();
  const { 
    boards,
    currentBoardId,
    tags,
    createBoard,
    updateBoard,
    deleteBoard,
    setCurrentBoard,
    getCurrentBoard,
    createColumn,
    updateColumn,
    deleteColumn,
    moveColumn,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
    addComment,
    updateComment,
    deleteComment,
    createTag,
    updateTag,
    deleteTag,
    getCardById,
    getColumnStats
  } = useKanban();

  const currentBoard = getCurrentBoard();
  
  // Board management state
  const [isBoardDialogOpen, setIsBoardDialogOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [editingBoard, setEditingBoard] = useState<KanbanBoard | null>(null);

  // Column management state
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [newColumnColor, setNewColumnColor] = useState('#3b82f6');
  const [editingColumn, setEditingColumn] = useState<{ id: string; title: string; color: string } | null>(null);

  // Card management state
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [editingCard, setEditingCard] = useState<Partial<KanbanCard> | null>(null);

  // Comment state
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<{ id: string; text: string } | null>(null);

  // Tag management state
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');
  const [editingTag, setEditingTag] = useState<{ id: string; name: string; color: string } | null>(null);

  // Unsaved changes state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [originalCardData, setOriginalCardData] = useState<KanbanCard | null>(null);

  // Set default board if none selected
  useEffect(() => {
    if (!currentBoardId && boards.length > 0) {
      setCurrentBoard(boards[0].id);
    }
  }, [boards, currentBoardId, setCurrentBoard]);

  // Track unsaved changes for card editing
  useEffect(() => {
    if (originalCardData && editingCard) {
      const hasChanges = 
        editingCard.title !== originalCardData.title ||
        editingCard.description !== originalCardData.description ||
        editingCard.priority !== originalCardData.priority ||
        editingCard.assignee !== originalCardData.assignee ||
        editingCard.dueDate?.getTime() !== originalCardData.dueDate?.getTime() ||
        JSON.stringify(editingCard.tags?.sort()) !== JSON.stringify(originalCardData.tags?.sort());
      
      setHasUnsavedChanges(hasChanges);
    }
  }, [editingCard, originalCardData]);

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
    if (editingCard && selectedCard && currentBoard) {
      updateCard(currentBoard.id, selectedCard.id, editingCard);
      setHasUnsavedChanges(false);
      setShowUnsavedDialog(false);
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
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

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !currentBoard) return;

    const { source, destination, draggableId, type } = result;
    
    if (type === 'column') {
      moveColumn(currentBoard.id, source.index, destination.index);
    } else {
      moveCard(
        currentBoard.id,
        draggableId,
        source.droppableId,
        destination.droppableId,
        destination.index
      );
    }
  };

  // Board operations
  const handleCreateBoard = () => {
    if (!newBoardTitle.trim()) return;
    
    createBoard(newBoardTitle);
    setNewBoardTitle('');
    setIsBoardDialogOpen(false);
    
    toast({
      title: "Quadro criado",
      description: `O quadro "${newBoardTitle}" foi criado com sucesso.`,
    });
  };

  const handleUpdateBoard = () => {
    if (!editingBoard || !editingBoard.title.trim()) return;
    
    updateBoard(editingBoard.id, { title: editingBoard.title });
    setEditingBoard(null);
    
    toast({
      title: "Quadro atualizado",
      description: "O quadro foi atualizado com sucesso.",
    });
  };

  const handleDeleteBoard = (boardId: string) => {
    if (boards.length <= 1) {
      toast({
        title: "Erro",
        description: "Você deve ter pelo menos um quadro.",
        variant: "destructive"
      });
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir este quadro? Esta ação não pode ser desfeita.')) {
      deleteBoard(boardId);
      toast({
        title: "Quadro excluído",
        description: "O quadro foi excluído com sucesso.",
      });
    }
  };

  // Column operations
  const handleCreateColumn = () => {
    if (!newColumnTitle.trim() || !currentBoard) return;
    
    createColumn(currentBoard.id, newColumnTitle, newColumnColor);
    setNewColumnTitle('');
    setNewColumnColor('#3b82f6');
    setIsColumnDialogOpen(false);
    
    toast({
      title: "Coluna criada",
      description: `A coluna "${newColumnTitle}" foi criada com sucesso.`,
    });
  };

  const handleUpdateColumn = () => {
    if (!editingColumn || !editingColumn.title.trim() || !currentBoard) return;
    
    updateColumn(currentBoard.id, editingColumn.id, { 
      title: editingColumn.title,
      color: editingColumn.color 
    });
    setEditingColumn(null);
    
    toast({
      title: "Coluna atualizada",
      description: "A coluna foi atualizada com sucesso.",
    });
  };

  const handleDeleteColumn = (columnId: string) => {
    if (!currentBoard) return;
    
    const column = currentBoard.columns.find(col => col.id === columnId);
    if (column && column.cards.length > 0) {
      if (!window.confirm('Esta coluna contém tarefas. Tem certeza que deseja excluí-la? As tarefas serão perdidas.')) {
        return;
      }
    }

    deleteColumn(currentBoard.id, columnId);
    toast({
      title: "Coluna excluída",
      description: "A coluna foi excluída com sucesso.",
    });
  };

  // Card operations
  const handleCreateCard = () => {
    if (!editingCard?.title?.trim() || !selectedColumnId || !currentBoard) return;
    
    createCard(currentBoard.id, selectedColumnId, {
      title: editingCard.title,
      description: editingCard.description || '',
      priority: editingCard.priority || 'media',
      assignee: editingCard.assignee || '',
      dueDate: editingCard.dueDate,
      tags: editingCard.tags || []
    });
    
    resetCardForm();
    setIsCardDialogOpen(false);
    
    toast({
      title: "Tarefa criada",
      description: `A tarefa "${editingCard.title}" foi criada com sucesso.`,
    });
  };

  const handleUpdateCard = () => {
    if (!editingCard || !selectedCard || !currentBoard) return;
    
    updateCard(currentBoard.id, selectedCard.id, editingCard);
    resetCardForm();
    setIsCardDialogOpen(false);
    setHasUnsavedChanges(false);
    
    toast({
      title: "Tarefa atualizada",
      description: "A tarefa foi atualizada com sucesso.",
    });
  };

  const handleDeleteCard = (cardId: string) => {
    if (!currentBoard) return;
    
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      deleteCard(currentBoard.id, cardId);
      setIsCardDialogOpen(false);
      resetCardForm();
      
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi excluída com sucesso.",
      });
    }
  };

  const resetCardForm = () => {
    setEditingCard(null);
    setSelectedCard(null);
    setOriginalCardData(null);
    setSelectedColumnId('');
    setHasUnsavedChanges(false);
  };

  const openCardForEdit = (card: KanbanCard) => {
    setSelectedCard(card);
    setOriginalCardData({ ...card });
    setEditingCard({ ...card });
    setIsCardDialogOpen(true);
  };

  const openCardForCreate = (columnId: string) => {
    setSelectedColumnId(columnId);
    setSelectedCard(null);
    setOriginalCardData(null);
    setEditingCard({
      title: '',
      description: '',
      priority: 'media',
      assignee: '',
      tags: []
    });
    setIsCardDialogOpen(true);
  };

  // Comment operations
  const handleAddComment = () => {
    if (!newComment.trim() || !selectedCard || !currentBoard) return;
    
    addComment(currentBoard.id, selectedCard.id, newComment);
    setNewComment('');
    
    // Refresh selected card
    const updatedCard = getCardById(currentBoard.id, selectedCard.id);
    if (updatedCard) {
      setSelectedCard(updatedCard);
      setEditingCard({ ...updatedCard });
      setOriginalCardData({ ...updatedCard });
    }
    
    toast({
      title: "Comentário adicionado",
      description: "Seu comentário foi adicionado com sucesso.",
    });
  };

  const handleUpdateComment = () => {
    if (!editingComment || !selectedCard || !currentBoard) return;
    
    updateComment(currentBoard.id, selectedCard.id, editingComment.id, editingComment.text);
    setEditingComment(null);
    
    // Refresh selected card
    const updatedCard = getCardById(currentBoard.id, selectedCard.id);
    if (updatedCard) {
      setSelectedCard(updatedCard);
      setEditingCard({ ...updatedCard });
      setOriginalCardData({ ...updatedCard });
    }
    
    toast({
      title: "Comentário atualizado",
      description: "O comentário foi atualizado com sucesso.",
    });
  };

  const handleDeleteComment = (commentId: string) => {
    if (!selectedCard || !currentBoard) return;
    
    deleteComment(currentBoard.id, selectedCard.id, commentId);
    
    // Refresh selected card
    const updatedCard = getCardById(currentBoard.id, selectedCard.id);
    if (updatedCard) {
      setSelectedCard(updatedCard);
      setEditingCard({ ...updatedCard });
      setOriginalCardData({ ...updatedCard });
    }
    
    toast({
      title: "Comentário excluído",
      description: "O comentário foi excluído com sucesso.",
    });
  };

  // Tag operations
  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    
    createTag({
      name: newTagName,
      color: newTagColor
    });
    
    setNewTagName('');
    setNewTagColor('#3b82f6');
    setIsTagDialogOpen(false);
    
    toast({
      title: "Tag criada",
      description: `A tag "${newTagName}" foi criada com sucesso.`,
    });
  };

  const handleUpdateTag = () => {
    if (!editingTag || !editingTag.name.trim()) return;
    
    updateTag(editingTag.id, {
      name: editingTag.name,
      color: editingTag.color
    });
    
    setEditingTag(null);
    
    toast({
      title: "Tag atualizada",
      description: "A tag foi atualizada com sucesso.",
    });
  };

  const handleDeleteTag = (tagId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta tag? Ela será removida de todas as tarefas.')) {
      deleteTag(tagId);
      toast({
        title: "Tag excluída",
        description: "A tag foi excluída com sucesso.",
      });
    }
  };

  const toggleCardTag = (tagId: string) => {
    if (!editingCard) return;
    
    const currentTags = editingCard.tags || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId];
    
    setEditingCard({ ...editingCard, tags: newTags });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
  };

  const getPriorityColor = (priority: string) => {
    const option = PRIORITY_OPTIONS.find(p => p.value === priority);
    return option?.color || '#6b7280';
  };

  const getPriorityLabel = (priority: string) => {
    const option = PRIORITY_OPTIONS.find(p => p.value === priority);
    return option?.label || priority;
  };

  const isCardOverdue = (dueDate?: Date) => {
    if (!dueDate) return false;
    return dueDate < new Date();
  };

  const columnStats = currentBoard ? getColumnStats(currentBoard.id) : {};

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Quadro Kanban</h1>
                <p className="text-muted-foreground">
                  Visualize e gerencie suas tarefas de forma visual
                </p>
              </div>
              
              {/* Board Selector */}
              {boards.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="min-w-48">
                      {currentBoard?.title || 'Selecione um quadro'}
                      <ChevronDown size={16} className="ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {boards.map(board => (
                      <DropdownMenuItem
                        key={board.id}
                        onClick={() => setCurrentBoard(board.id)}
                        className={currentBoardId === board.id ? 'bg-accent' : ''}
                      >
                        {board.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="flex gap-2">
              <Dialog open={isBoardDialogOpen} onOpenChange={setIsBoardDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus size={16} className="mr-2" />
                    Novo Quadro
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Quadro</DialogTitle>
                    <DialogDescription>
                      Adicione um novo quadro Kanban para organizar suas tarefas
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="boardTitle">Título do Quadro</Label>
                      <Input
                        id="boardTitle"
                        value={newBoardTitle}
                        onChange={(e) => setNewBoardTitle(e.target.value)}
                        placeholder="Digite o título do quadro..."
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateBoard()}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsBoardDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateBoard}>
                        Criar Quadro
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isColumnDialogOpen} onOpenChange={setIsColumnDialogOpen}>
                <DialogTrigger asChild>
                  <Button disabled={!currentBoard}>
                    <Plus size={16} className="mr-2" />
                    Nova Coluna
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Coluna</DialogTitle>
                    <DialogDescription>
                      Adicione uma nova coluna ao quadro atual
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="columnTitle">Título da Coluna</Label>
                      <Input
                        id="columnTitle"
                        value={newColumnTitle}
                        onChange={(e) => setNewColumnTitle(e.target.value)}
                        placeholder="Digite o título da coluna..."
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateColumn()}
                      />
                    </div>
                    <ColorPicker
                      value={newColumnColor}
                      onChange={setNewColumnColor}
                      label="Cor da Coluna"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsColumnDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateColumn}>
                        Criar Coluna
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Board Settings */}
              {currentBoard && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setEditingBoard({ ...currentBoard })}>
                      <Edit2 size={16} className="mr-2" />
                      Renomear Quadro
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteBoard(currentBoard.id)}
                      className="text-destructive"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Excluir Quadro
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        {currentBoard && currentBoard.columns.length > 0 ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="board" type="column" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex gap-6 overflow-x-auto pb-4"
                >
                  {currentBoard.columns.sort((a, b) => a.order - b.order).map((column, index) => (
                    <Draggable key={column.id} draggableId={column.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`min-w-80 flex-shrink-0 ${
                            snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
                          }`}
                        >
                          <Card className="h-full">
                            <CardHeader 
                              {...provided.dragHandleProps}
                              className="pb-4 cursor-grab"
                              style={{ borderTop: `4px solid ${column.color}` }}
                            >
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: column.color }}
                                  />
                                  {column.title}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                                    {column.cards.length}
                                  </span>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal size={16} />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuItem
                                        onClick={() => openCardForCreate(column.id)}
                                      >
                                        <Plus size={16} className="mr-2" />
                                        Adicionar Tarefa
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => setEditingColumn({
                                          id: column.id,
                                          title: column.title,
                                          color: column.color
                                        })}
                                      >
                                        <Edit2 size={16} className="mr-2" />
                                        Editar Coluna
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteColumn(column.id)}
                                        className="text-destructive"
                                      >
                                        <Trash2 size={16} className="mr-2" />
                                        Excluir Coluna
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </CardHeader>
                            
                            <CardContent>
                              <Droppable droppableId={column.id}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`space-y-3 min-h-32 p-2 rounded-lg transition-colors ${
                                      snapshot.isDraggingOver ? 'bg-muted/50' : ''
                                    }`}
                                  >
                                    {column.cards.map((card, index) => (
                                      <Draggable key={card.id} draggableId={card.id} index={index}>
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={`bg-card border border-border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                                              snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                                            }`}
                                            onClick={() => openCardForEdit(card)}
                                          >
                                            <h4 className="font-medium text-foreground mb-2 line-clamp-2">
                                              {card.title}
                                            </h4>
                                            
                                            {card.description && (
                                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                {card.description}
                                              </p>
                                            )}

                                            {/* Card badges */}
                                            <div className="flex flex-wrap gap-1 mb-3">
                                              <Badge
                                                variant="outline"
                                                style={{ 
                                                  borderColor: getPriorityColor(card.priority),
                                                  color: getPriorityColor(card.priority)
                                                }}
                                                className="text-xs"
                                              >
                                                {getPriorityLabel(card.priority)}
                                              </Badge>
                                              
                                              {card.dueDate && (
                                                <Badge
                                                  variant={isCardOverdue(card.dueDate) ? "destructive" : "outline"}
                                                  className="text-xs"
                                                >
                                                  <Calendar size={10} className="mr-1" />
                                                  {formatDate(card.dueDate)}
                                                </Badge>
                                              )}

                                              {card.tags.map(tagId => {
                                                const tag = tags.find(t => t.id === tagId);
                                                return tag ? (
                                                  <Badge
                                                    key={tag.id}
                                                    variant="secondary"
                                                    style={{ 
                                                      backgroundColor: tag.color + '20', 
                                                      color: tag.color,
                                                      borderColor: tag.color
                                                    }}
                                                    className="text-xs"
                                                  >
                                                    {tag.name}
                                                  </Badge>
                                                ) : null;
                                              })}
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                              <div className="flex items-center gap-2">
                                                {card.assignee && (
                                                  <div className="flex items-center gap-1">
                                                    <User size={10} />
                                                    <span>{card.assignee}</span>
                                                  </div>
                                                )}
                                              </div>
                                              <div className="flex items-center gap-2">
                                                {card.comments.length > 0 && (
                                                  <div className="flex items-center gap-1">
                                                    <MessageSquare size={10} />
                                                    <span>{card.comments.length}</span>
                                                  </div>
                                                )}
                                                <span>{formatDate(card.updatedAt)}</span>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>

                              <Button
                                variant="ghost"
                                className="w-full mt-3"
                                onClick={() => openCardForCreate(column.id)}
                              >
                                <Plus size={16} className="mr-2" />
                                Adicionar Tarefa
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Settings className="text-muted-foreground mb-4" size={64} />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {!currentBoard ? 'Nenhum quadro selecionado' : 'Nenhuma coluna criada'}
              </h3>
              <p className="text-muted-foreground text-center mb-6">
                {!currentBoard 
                  ? 'Crie um novo quadro para começar a organizar suas tarefas'
                  : 'Comece criando colunas para organizar suas tarefas'
                }
              </p>
              <Button onClick={() => currentBoard ? setIsColumnDialogOpen(true) : setIsBoardDialogOpen(true)}>
                <Plus size={16} className="mr-2" />
                {!currentBoard ? 'Criar Primeiro Quadro' : 'Criar Primeira Coluna'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Summary Footer */}
        {currentBoard && currentBoard.columns.length > 0 && (
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Resumo do Quadro</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(columnStats).map(([columnId, stats]) => (
                <Card key={columnId} className="text-center">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stats.color }}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {stats.title}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {stats.count}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stats.count === 1 ? 'tarefa' : 'tarefas'}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Edit Board Dialog */}
        <Dialog open={!!editingBoard} onOpenChange={() => setEditingBoard(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Quadro</DialogTitle>
              <DialogDescription>
                Altere o nome do quadro
              </DialogDescription>
            </DialogHeader>
            {editingBoard && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editBoardTitle">Título do Quadro</Label>
                  <Input
                    id="editBoardTitle"
                    value={editingBoard.title}
                    onChange={(e) => setEditingBoard({ ...editingBoard, title: e.target.value })}
                    placeholder="Digite o título do quadro..."
                    onKeyPress={(e) => e.key === 'Enter' && handleUpdateBoard()}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingBoard(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleUpdateBoard}>
                    Salvar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Column Dialog */}
        <Dialog open={!!editingColumn} onOpenChange={() => setEditingColumn(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Coluna</DialogTitle>
              <DialogDescription>
                Altere o nome e a cor da coluna
              </DialogDescription>
            </DialogHeader>
            {editingColumn && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editColumnTitle">Título da Coluna</Label>
                  <Input
                    id="editColumnTitle"
                    value={editingColumn.title}
                    onChange={(e) => setEditingColumn({ ...editingColumn, title: e.target.value })}
                    placeholder="Digite o título da coluna..."
                    onKeyPress={(e) => e.key === 'Enter' && handleUpdateColumn()}
                  />
                </div>
                <ColorPicker
                  value={editingColumn.color}
                  onChange={(color) => setEditingColumn({ ...editingColumn, color })}
                  label="Cor da Coluna"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingColumn(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleUpdateColumn}>
                    Salvar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Card Edit Dialog */}
        <Dialog 
          open={isCardDialogOpen} 
          onOpenChange={(open) => {
            if (!open) {
              handleUnsavedChanges(() => {
                setIsCardDialogOpen(false);
                resetCardForm();
              });
            }
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {editingCard && (
              <>
                <DialogHeader>
                  <DialogTitle>
                    {selectedCard ? 'Editar Tarefa' : 'Criar Nova Tarefa'}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedCard ? 'Modifique os detalhes da tarefa' : 'Preencha os detalhes da nova tarefa'}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardTitle">Título *</Label>
                      <Input
                        id="cardTitle"
                        value={editingCard.title || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                        placeholder="Digite o título da tarefa..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="cardDescription">Descrição</Label>
                      <Textarea
                        id="cardDescription"
                        value={editingCard.description || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, description: e.target.value })}
                        placeholder="Digite a descrição da tarefa..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cardPriority">Prioridade</Label>
                        <Select
                          value={editingCard.priority || 'media'}
                          onValueChange={(value: 'baixa' | 'media' | 'alta') => 
                            setEditingCard({ ...editingCard, priority: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PRIORITY_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: option.color }}
                                  />
                                  {option.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="cardAssignee">Responsável</Label>
                        <Input
                          id="cardAssignee"
                          value={editingCard.assignee || ''}
                          onChange={(e) => setEditingCard({ ...editingCard, assignee: e.target.value })}
                          placeholder="Nome do responsável..."
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cardDueDate">Data Limite</Label>
                      <Input
                        id="cardDueDate"
                        type="date"
                        value={editingCard.dueDate ? editingCard.dueDate.toISOString().split('T')[0] : ''}
                        onChange={(e) => setEditingCard({ 
                          ...editingCard, 
                          dueDate: e.target.value ? new Date(e.target.value) : undefined 
                        })}
                      />
                    </div>

                    {/* Tags */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Tags</Label>
                        <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Plus size={14} className="mr-1" />
                              Nova Tag
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                {editingTag ? 'Editar Tag' : 'Criar Nova Tag'}
                              </DialogTitle>
                              <DialogDescription>
                                {editingTag ? 'Modifique a tag' : 'Crie uma nova tag para organizar suas tarefas'}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="tagName">Nome da Tag</Label>
                                <Input
                                  id="tagName"
                                  value={editingTag?.name || newTagName}
                                  onChange={(e) => editingTag 
                                    ? setEditingTag({ ...editingTag, name: e.target.value })
                                    : setNewTagName(e.target.value)
                                  }
                                  placeholder="Digite o nome da tag..."
                                />
                              </div>
                              <ColorPicker
                                value={editingTag?.color || newTagColor}
                                onChange={(color) => editingTag
                                  ? setEditingTag({ ...editingTag, color })
                                  : setNewTagColor(color)
                                }
                                label="Cor da Tag"
                              />
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    setIsTagDialogOpen(false);
                                    setEditingTag(null);
                                    setNewTagName('');
                                    setNewTagColor('#3b82f6');
                                  }}
                                >
                                  Cancelar
                                </Button>
                                <Button onClick={editingTag ? handleUpdateTag : handleCreateTag}>
                                  {editingTag ? 'Salvar' : 'Criar Tag'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                          <div key={tag.id} className="flex items-center gap-1">
                            <Checkbox
                              id={`tag-${tag.id}`}
                              checked={editingCard.tags?.includes(tag.id) || false}
                              onCheckedChange={() => toggleCardTag(tag.id)}
                            />
                            <label 
                              htmlFor={`tag-${tag.id}`}
                              className="cursor-pointer"
                            >
                              <Badge
                                variant="outline"
                                style={{ 
                                  backgroundColor: editingCard.tags?.includes(tag.id) ? tag.color + '20' : 'transparent',
                                  borderColor: tag.color,
                                  color: tag.color
                                }}
                                className="text-xs"
                              >
                                {tag.name}
                              </Badge>
                            </label>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreHorizontal size={12} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingTag({ id: tag.id, name: tag.name, color: tag.color });
                                    setIsTagDialogOpen(true);
                                  }}
                                >
                                  <Edit2 size={12} className="mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteTag(tag.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 size={12} className="mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Creation Date */}
                    {selectedCard && (
                      <div>
                        <Label>Data de Criação</Label>
                        <Input
                          value={formatDateTime(selectedCard.createdAt)}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    )}
                  </div>

                  {/* Right Column - Comments */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                        <MessageSquare size={16} />
                        Comentários ({selectedCard?.comments.length || 0})
                      </h4>
                      
                      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                        {selectedCard?.comments.map((comment) => (
                          <div key={comment.id} className="bg-muted rounded-lg p-3">
                            {editingComment?.id === comment.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editingComment.text}
                                  onChange={(e) => setEditingComment({ ...editingComment, text: e.target.value })}
                                  rows={2}
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={handleUpdateComment}>
                                    Salvar
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => setEditingComment(null)}
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm text-foreground mb-2">{comment.text}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">
                                    {formatDateTime(comment.createdAt)}
                                  </span>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingComment({ id: comment.id, text: comment.text })}
                                    >
                                      <Edit2 size={12} />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteComment(comment.id)}
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <Trash2 size={12} />
                                    </Button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {selectedCard && (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Adicionar comentário..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                          />
                          <Button onClick={handleAddComment}>
                            <Plus size={16} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Footer Actions */}
                <div className="flex justify-between pt-6 border-t border-border">
                  <div className="flex items-center gap-2">
                    {hasUnsavedChanges && (
                      <div className="flex items-center gap-1 text-amber-600">
                        <AlertCircle size={14} />
                        <span className="text-xs">Alterações não salvas</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {selectedCard && (
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteCard(selectedCard.id)}
                      >
                        <Trash2 size={16} className="mr-2" />
                        Excluir Tarefa
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleUnsavedChanges(() => {
                          setIsCardDialogOpen(false);
                          resetCardForm();
                        });
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={selectedCard ? handleUpdateCard : handleCreateCard}>
                      {selectedCard ? 'Salvar' : 'Criar Tarefa'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

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
