import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Star, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Note {
  id: string;
  title: string;
  content: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export function WatchNotesApp() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_notes')
      .select('*')
      .eq('user_id', user.id)
      .order('is_favorite', { ascending: false })
      .order('updated_at', { ascending: false });

    if (data) {
      setNotes(data);
    }
    setLoading(false);
  };

  const createNote = async () => {
    if (!user) {
      toast.error('Please sign in to create notes');
      return;
    }

    const { data, error } = await supabase
      .from('user_notes')
      .insert({
        user_id: user.id,
        title: 'New Note',
        content: ''
      })
      .select()
      .single();

    if (data) {
      setNotes(prev => [data, ...prev]);
      setSelectedNote(data);
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    const { error } = await supabase
      .from('user_notes')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setNotes(prev => 
        prev.map(n => n.id === id ? { ...n, ...updates } : n)
      );
      if (selectedNote?.id === id) {
        setSelectedNote(prev => prev ? { ...prev, ...updates } : null);
      }
    }
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase
      .from('user_notes')
      .delete()
      .eq('id', id);

    if (!error) {
      setNotes(prev => prev.filter(n => n.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
      toast.success('Note deleted');
    }
  };

  const toggleFavorite = async (id: string, current: boolean) => {
    await updateNote(id, { is_favorite: !current });
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(search.toLowerCase()) ||
    note.content?.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <FileText className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Sign in to save notes</p>
      </div>
    );
  }

  if (selectedNote) {
    return (
      <div className="h-full flex flex-col p-4">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setSelectedNote(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back
          </button>
          <input
            type="text"
            value={selectedNote.title}
            onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
            className="flex-1 bg-transparent text-lg font-semibold focus:outline-none"
          />
          <button
            onClick={() => toggleFavorite(selectedNote.id, selectedNote.is_favorite)}
            className={cn(
              "p-2",
              selectedNote.is_favorite ? "text-warning" : "text-muted-foreground"
            )}
          >
            <Star className="w-4 h-4" fill={selectedNote.is_favorite ? "currentColor" : "none"} />
          </button>
        </div>
        <textarea
          value={selectedNote.content || ''}
          onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
          placeholder="Write your note..."
          className="flex-1 bg-muted rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Notes</h2>
        </div>
        <button
          onClick={createNote}
          className="p-2 bg-primary/20 hover:bg-primary/30 rounded-full text-primary"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="w-full bg-muted rounded-lg pl-9 pr-3 py-2 text-sm"
        />
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {loading ? (
          <div className="text-center text-muted-foreground py-8">Loading...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>{search ? 'No notes found' : 'No notes yet'}</p>
          </div>
        ) : (
          filteredNotes.map(note => (
            <div
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className={cn(
                "glass rounded-xl p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                note.is_favorite && "border-warning/30"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{note.title}</p>
                    {note.is_favorite && <Star className="w-3 h-3 text-warning" fill="currentColor" />}
                  </div>
                  {note.content && (
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {note.content}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                  className="text-muted-foreground hover:text-sos p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
