import { useState, useEffect } from 'react';
import { Note } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { NoteEditor } from './NoteEditor';
import { MarkdownRenderer } from './MarkdownRenderer';
import { 
  Plus, 
  Search, 
  Folder, 
  FileText, 
  Trash2, 
  Edit,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function NotebookView() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const loadedNotes: Note[] = (data || []).map((n: any) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        taskId: n.task_id,
        folder: n.folder,
        tags: n.tags || [],
        createdAt: n.created_at,
        updatedAt: n.updated_at,
      }));

      setNotes(loadedNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
      toast.error('Failed to load notes');
    }
  };

  const handleSaveNote = async (noteData: Partial<Note>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to save notes');
        return;
      }

      if (editingNote) {
        const { error } = await supabase
          .from('notes')
          .update({
            title: noteData.title,
            content: noteData.content,
            folder: noteData.folder,
            tags: noteData.tags,
          })
          .eq('id', editingNote.id);

        if (error) throw error;
        toast.success('Note updated!');
      } else {
        const { error } = await supabase
          .from('notes')
          .insert({
            title: noteData.title,
            content: noteData.content,
            folder: noteData.folder,
            tags: noteData.tags,
            task_id: noteData.taskId,
            user_id: user.id,
          });

        if (error) throw error;
        toast.success('Note created!');
      }

      setEditingNote(null);
      setIsCreating(false);
      loadNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      
      setNotes(notes.filter(n => n.id !== noteId));
      setSelectedNote(null);
      toast.success('Note deleted');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const folders = ['all', ...new Set(notes.map(n => n.folder))];
  
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder === 'all' || note.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  if (isCreating || editingNote) {
    return (
      <NoteEditor
        note={editingNote || undefined}
        onSave={handleSaveNote}
        onCancel={() => {
          setIsCreating(false);
          setEditingNote(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Notebook</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {folders.map((folder) => (
          <Button
            key={folder}
            variant={selectedFolder === folder ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFolder(folder)}
            className="gap-2 whitespace-nowrap"
          >
            <Folder className="h-4 w-4" />
            {folder}
          </Button>
        ))}
      </div>

      {selectedNote ? (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{selectedNote.title}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Folder className="h-4 w-4" />
                    {selectedNote.folder}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(selectedNote.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                {selectedNote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingNote(selectedNote)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteNote(selectedNote.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedNote(null)}
                >
                  Back
                </Button>
              </div>
            </div>
            <MarkdownRenderer content={selectedNote.content} />
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No notes found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try a different search term' : 'Create your first note to get started'}
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </Button>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <Card
                key={note.id}
                className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedNote(note)}
              >
                <div className="space-y-2">
                  <h4 className="font-semibold line-clamp-1">{note.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Folder className="h-3 w-3" />
                      {note.folder}
                    </div>
                    <div>{new Date(note.updatedAt).toLocaleDateString()}</div>
                  </div>
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{note.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
