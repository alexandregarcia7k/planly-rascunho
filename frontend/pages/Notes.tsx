import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Search, Tag, Grid, List } from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNotes } from '../contexts/NotesContext';

export default function Notes() {
  const { notes, tags, createNote } = useNotes();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || note.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleCreateNote = () => {
    createNote({
      title: '',
      content: '',
      tags: []
    });
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Notas</h1>
              <p className="text-muted-foreground">
                Organize suas ideias e pensamentos
              </p>
            </div>
            <Button onClick={handleCreateNote}>
              <Plus size={16} className="mr-2" />
              Nova Nota
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Buscar notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid size={16} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List size={16} />
              </Button>
            </div>
          </div>

          {/* Tags Filter */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={selectedTag === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTag(null)}
              >
                Todas
              </Button>
              {tags.map(tag => (
                <Button
                  key={tag.id}
                  variant={selectedTag === tag.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTag(tag.id)}
                  style={{
                    backgroundColor: selectedTag === tag.id ? tag.color : undefined,
                    borderColor: tag.color
                  }}
                >
                  <Tag size={14} className="mr-1" />
                  {tag.name}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Notes Grid/List */}
        {filteredNotes.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {filteredNotes.map((note) => (
              <Link key={note.id} to={`/notes/${note.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-2">
                      {note.title || 'Nota sem título'}
                    </CardTitle>
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.map(tagId => {
                          const tag = tags.find(t => t.id === tagId);
                          return tag ? (
                            <Badge
                              key={tag.id}
                              variant="secondary"
                              style={{ backgroundColor: tag.color + '20', color: tag.color }}
                              className="text-xs"
                            >
                              {tag.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-3 mb-4">
                      {note.content || 'Conteúdo vazio'}
                    </CardDescription>
                    <div className="text-xs text-muted-foreground">
                      Atualizado em {note.updatedAt.toLocaleDateString('pt-BR')}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="text-muted-foreground mb-4" size={64} />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm || selectedTag ? 'Nenhuma nota encontrada' : 'Nenhuma nota criada'}
              </h3>
              <p className="text-muted-foreground text-center mb-6">
                {searchTerm || selectedTag 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando sua primeira nota para organizar suas ideias'
                }
              </p>
              {!searchTerm && !selectedTag && (
                <Button onClick={handleCreateNote}>
                  <Plus size={16} className="mr-2" />
                  Criar Primeira Nota
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
