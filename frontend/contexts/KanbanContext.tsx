import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Comment {
  id: string;
  text: string;
  createdAt: Date;
}

export interface KanbanCard {
  id: string;
  title: string;
  description: string;
  priority: 'baixa' | 'media' | 'alta';
  assignee: string;
  dueDate?: Date;
  tags: string[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  cards: KanbanCard[];
  order: number;
}

export interface KanbanBoard {
  id: string;
  title: string;
  columns: KanbanColumn[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KanbanTag {
  id: string;
  name: string;
  color: string;
}

interface KanbanContextProps {
  boards: KanbanBoard[];
  currentBoardId: string | null;
  tags: KanbanTag[];
  
  // Board operations
  createBoard: (title: string) => void;
  updateBoard: (id: string, updates: Partial<KanbanBoard>) => void;
  deleteBoard: (id: string) => void;
  setCurrentBoard: (id: string) => void;
  getCurrentBoard: () => KanbanBoard | null;
  
  // Column operations
  createColumn: (boardId: string, title: string, color: string) => void;
  updateColumn: (boardId: string, columnId: string, updates: Partial<KanbanColumn>) => void;
  deleteColumn: (boardId: string, columnId: string) => void;
  moveColumn: (boardId: string, sourceIndex: number, targetIndex: number) => void;
  
  // Card operations
  createCard: (boardId: string, columnId: string, card: Omit<KanbanCard, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => void;
  updateCard: (boardId: string, cardId: string, updates: Partial<KanbanCard>) => void;
  deleteCard: (boardId: string, cardId: string) => void;
  moveCard: (boardId: string, cardId: string, sourceColumnId: string, targetColumnId: string, targetIndex: number) => void;
  
  // Comment operations
  addComment: (boardId: string, cardId: string, text: string) => void;
  updateComment: (boardId: string, cardId: string, commentId: string, text: string) => void;
  deleteComment: (boardId: string, cardId: string, commentId: string) => void;
  
  // Tag operations
  createTag: (tag: Omit<KanbanTag, 'id'>) => void;
  updateTag: (id: string, updates: Partial<KanbanTag>) => void;
  deleteTag: (id: string) => void;
  
  // Helper functions
  getCardById: (boardId: string, cardId: string) => KanbanCard | null;
  getColumnStats: (boardId: string) => { [columnId: string]: { title: string; count: number; color: string } };
}

const KanbanContext = createContext<KanbanContextProps | undefined>(undefined);

export function KanbanProvider({ children }: { children: React.ReactNode }) {
  const [boards, setBoards] = useState<KanbanBoard[]>(() => {
    const saved = localStorage.getItem('planly-kanban-boards');
    if (saved) {
      return JSON.parse(saved).map((board: any) => ({
        ...board,
        createdAt: new Date(board.createdAt),
        updatedAt: new Date(board.updatedAt),
        columns: board.columns.map((column: any) => ({
          ...column,
          cards: column.cards.map((card: any) => ({
            ...card,
            createdAt: new Date(card.createdAt),
            updatedAt: new Date(card.updatedAt),
            dueDate: card.dueDate ? new Date(card.dueDate) : undefined,
            comments: card.comments.map((comment: any) => ({
              ...comment,
              createdAt: new Date(comment.createdAt)
            }))
          }))
        }))
      }));
    }
    
    // Create default board
    const defaultBoard: KanbanBoard = {
      id: crypto.randomUUID(),
      title: 'Quadro Principal',
      createdAt: new Date(),
      updatedAt: new Date(),
      columns: [
        { id: '1', title: 'A Fazer', color: '#ef4444', cards: [], order: 0 },
        { id: '2', title: 'Em Progresso', color: '#f59e0b', cards: [], order: 1 },
        { id: '3', title: 'Concluído', color: '#10b981', cards: [], order: 2 }
      ]
    };
    
    return [defaultBoard];
  });

  const [currentBoardId, setCurrentBoardId] = useState<string | null>(() => {
    const saved = localStorage.getItem('planly-kanban-current-board');
    return saved || (boards.length > 0 ? boards[0].id : null);
  });

  const [tags, setTags] = useState<KanbanTag[]>(() => {
    const saved = localStorage.getItem('planly-kanban-tags');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('planly-kanban-boards', JSON.stringify(boards));
  }, [boards]);

  useEffect(() => {
    if (currentBoardId) {
      localStorage.setItem('planly-kanban-current-board', currentBoardId);
    }
  }, [currentBoardId]);

  useEffect(() => {
    localStorage.setItem('planly-kanban-tags', JSON.stringify(tags));
  }, [tags]);

  // Board operations
  const createBoard = (title: string) => {
    const newBoard: KanbanBoard = {
      id: crypto.randomUUID(),
      title,
      columns: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setBoards(prev => [...prev, newBoard]);
    setCurrentBoardId(newBoard.id);
  };

  const updateBoard = (id: string, updates: Partial<KanbanBoard>) => {
    setBoards(prev => prev.map(board =>
      board.id === id 
        ? { ...board, ...updates, updatedAt: new Date() }
        : board
    ));
  };

  const deleteBoard = (id: string) => {
    setBoards(prev => {
      const filtered = prev.filter(board => board.id !== id);
      if (currentBoardId === id && filtered.length > 0) {
        setCurrentBoardId(filtered[0].id);
      } else if (filtered.length === 0) {
        setCurrentBoardId(null);
      }
      return filtered;
    });
  };

  const setCurrentBoard = (id: string) => {
    setCurrentBoardId(id);
  };

  const getCurrentBoard = () => {
    return boards.find(board => board.id === currentBoardId) || null;
  };

  // Column operations
  const createColumn = (boardId: string, title: string, color: string) => {
    setBoards(prev => prev.map(board => {
      if (board.id === boardId) {
        const newColumn: KanbanColumn = {
          id: crypto.randomUUID(),
          title,
          color,
          cards: [],
          order: board.columns.length
        };
        return {
          ...board,
          columns: [...board.columns, newColumn],
          updatedAt: new Date()
        };
      }
      return board;
    }));
  };

  const updateColumn = (boardId: string, columnId: string, updates: Partial<KanbanColumn>) => {
    setBoards(prev => prev.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          columns: board.columns.map(column =>
            column.id === columnId ? { ...column, ...updates } : column
          ),
          updatedAt: new Date()
        };
      }
      return board;
    }));
  };

  const deleteColumn = (boardId: string, columnId: string) => {
    setBoards(prev => prev.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          columns: board.columns.filter(column => column.id !== columnId),
          updatedAt: new Date()
        };
      }
      return board;
    }));
  };

  const moveColumn = (boardId: string, sourceIndex: number, targetIndex: number) => {
    setBoards(prev => prev.map(board => {
      if (board.id === boardId) {
        const columns = [...board.columns];
        const [movedColumn] = columns.splice(sourceIndex, 1);
        columns.splice(targetIndex, 0, movedColumn);
        
        // Update order
        const updatedColumns = columns.map((column, index) => ({
          ...column,
          order: index
        }));

        return {
          ...board,
          columns: updatedColumns,
          updatedAt: new Date()
        };
      }
      return board;
    }));
  };

  // Card operations
  const createCard = (boardId: string, columnId: string, cardData: Omit<KanbanCard, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => {
    setBoards(prev => prev.map(board => {
      if (board.id === boardId) {
        const newCard: KanbanCard = {
          ...cardData,
          id: crypto.randomUUID(),
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        return {
          ...board,
          columns: board.columns.map(column =>
            column.id === columnId
              ? { ...column, cards: [...column.cards, newCard] }
              : column
          ),
          updatedAt: new Date()
        };
      }
      return board;
    }));
  };

  const updateCard = (boardId: string, cardId: string, updates: Partial<KanbanCard>) => {
    setBoards(prev => prev.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          columns: board.columns.map(column => ({
            ...column,
            cards: column.cards.map(card =>
              card.id === cardId
                ? { ...card, ...updates, updatedAt: new Date() }
                : card
            )
          })),
          updatedAt: new Date()
        };
      }
      return board;
    }));
  };

  const deleteCard = (boardId: string, cardId: string) => {
    setBoards(prev => prev.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          columns: board.columns.map(column => ({
            ...column,
            cards: column.cards.filter(card => card.id !== cardId)
          })),
          updatedAt: new Date()
        };
      }
      return board;
    }));
  };

  const moveCard = (boardId: string, cardId: string, sourceColumnId: string, targetColumnId: string, targetIndex: number) => {
    setBoards(prev => prev.map(board => {
      if (board.id === boardId) {
        const newColumns = board.columns.map(col => ({ ...col, cards: [...col.cards] }));
        const sourceColumn = newColumns.find(col => col.id === sourceColumnId);
        const targetColumn = newColumns.find(col => col.id === targetColumnId);
        
        if (!sourceColumn || !targetColumn) return board;

        const cardIndex = sourceColumn.cards.findIndex(card => card.id === cardId);
        if (cardIndex === -1) return board;

        const [card] = sourceColumn.cards.splice(cardIndex, 1);
        targetColumn.cards.splice(targetIndex, 0, card);

        return {
          ...board,
          columns: newColumns,
          updatedAt: new Date()
        };
      }
      return board;
    }));
  };

  // Comment operations
  const addComment = (boardId: string, cardId: string, text: string) => {
    const newComment: Comment = {
      id: crypto.randomUUID(),
      text,
      createdAt: new Date()
    };

    setBoards(prev => prev.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          columns: board.columns.map(column => ({
            ...column,
            cards: column.cards.map(card =>
              card.id === cardId
                ? { ...card, comments: [...card.comments, newComment], updatedAt: new Date() }
                : card
            )
          })),
          updatedAt: new Date()
        };
      }
      return board;
    }));
  };

  const updateComment = (boardId: string, cardId: string, commentId: string, text: string) => {
    setBoards(prev => prev.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          columns: board.columns.map(column => ({
            ...column,
            cards: column.cards.map(card =>
              card.id === cardId
                ? {
                    ...card,
                    comments: card.comments.map(comment =>
                      comment.id === commentId ? { ...comment, text } : comment
                    ),
                    updatedAt: new Date()
                  }
                : card
            )
          })),
          updatedAt: new Date()
        };
      }
      return board;
    }));
  };

  const deleteComment = (boardId: string, cardId: string, commentId: string) => {
    setBoards(prev => prev.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          columns: board.columns.map(column => ({
            ...column,
            cards: column.cards.map(card =>
              card.id === cardId
                ? {
                    ...card,
                    comments: card.comments.filter(comment => comment.id !== commentId),
                    updatedAt: new Date()
                  }
                : card
            )
          })),
          updatedAt: new Date()
        };
      }
      return board;
    }));
  };

  // Tag operations
  const createTag = (tagData: Omit<KanbanTag, 'id'>) => {
    const newTag: KanbanTag = {
      ...tagData,
      id: crypto.randomUUID()
    };
    setTags(prev => [...prev, newTag]);
  };

  const updateTag = (id: string, updates: Partial<KanbanTag>) => {
    setTags(prev => prev.map(tag => 
      tag.id === id ? { ...tag, ...updates } : tag
    ));
  };

  const deleteTag = (id: string) => {
    setTags(prev => prev.filter(tag => tag.id !== id));
    
    // Remove tag from all cards
    setBoards(prev => prev.map(board => ({
      ...board,
      columns: board.columns.map(column => ({
        ...column,
        cards: column.cards.map(card => ({
          ...card,
          tags: card.tags.filter(tagId => tagId !== id)
        }))
      }))
    })));
  };

  // Helper functions
  const getCardById = (boardId: string, cardId: string): KanbanCard | null => {
    const board = boards.find(b => b.id === boardId);
    if (!board) return null;

    for (const column of board.columns) {
      const card = column.cards.find(c => c.id === cardId);
      if (card) return card;
    }
    return null;
  };

  const getColumnStats = (boardId: string) => {
    const board = boards.find(b => b.id === boardId);
    if (!board) return {};

    const stats: { [columnId: string]: { title: string; count: number; color: string } } = {};
    
    board.columns.forEach(column => {
      stats[column.id] = {
        title: column.title,
        count: column.cards.length,
        color: column.color
      };
    });

    return stats;
  };

  return (
    <KanbanContext.Provider value={{
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
    }}>
      {children}
    </KanbanContext.Provider>
  );
}

export function useKanban() {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error('useKanban deve ser usado dentro do KanbanProvider');
  }
  return context;
}
