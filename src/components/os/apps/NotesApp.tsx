import { useState } from "react";
import { 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Star,
  Clock,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  favorite: boolean;
  color: string;
}

const initialNotes: Note[] = [
  { 
    id: "1", 
    title: "Welcome to Dark Galaxy", 
    content: "This is your personal notes app. Use it to capture ideas, thoughts, and important information.\n\n✨ Features:\n- Create unlimited notes\n- Mark favorites with a star\n- Search through all notes\n- Color-coded organization", 
    date: "Today", 
    favorite: true,
    color: "purple"
  },
  { 
    id: "2", 
    title: "Meeting Notes", 
    content: "Project timeline discussion:\n- Phase 1: Research (2 weeks)\n- Phase 2: Design (3 weeks)\n- Phase 3: Development (4 weeks)\n- Phase 4: Testing (2 weeks)", 
    date: "Yesterday", 
    favorite: false,
    color: "blue"
  },
  { 
    id: "3", 
    title: "Ideas for Space Station", 
    content: "1. Solar panel array expansion\n2. New hydroponic garden module\n3. Observation deck with 360° view\n4. Emergency escape pods upgrade", 
    date: "3 days ago", 
    favorite: true,
    color: "green"
  },
  { 
    id: "4", 
    title: "Quantum Computing Research", 
    content: "Key concepts to explore:\n- Quantum entanglement\n- Superposition states\n- Qubit error correction\n- Quantum algorithms", 
    date: "1 week ago", 
    favorite: false,
    color: "cyan"
  },
];

const colorMap: Record<string, string> = {
  purple: "bg-purple-500/20 border-purple-500/40",
  blue: "bg-blue-500/20 border-blue-500/40",
  green: "bg-green-500/20 border-green-500/40",
  cyan: "bg-cyan-500/20 border-cyan-500/40",
  pink: "bg-pink-500/20 border-pink-500/40",
  amber: "bg-amber-500/20 border-amber-500/40",
};

const NotesApp = () => {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editContent, setEditContent] = useState(notes[0]?.content || "");

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createNote = () => {
    const colors = Object.keys(colorMap);
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      date: "Just now",
      favorite: false,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    setEditContent("");
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, ...updates } : note))
    );
    if (selectedNote?.id === id) {
      setSelectedNote({ ...selectedNote, ...updates });
    }
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(notes.find((n) => n.id !== id) || null);
      setEditContent(notes.find((n) => n.id !== id)?.content || "");
    }
  };

  const toggleFavorite = (id: string) => {
    updateNote(id, { favorite: !notes.find((n) => n.id === id)?.favorite });
  };

  const handleContentChange = (content: string) => {
    setEditContent(content);
    if (selectedNote) {
      updateNote(selectedNote.id, { content });
    }
  };

  const handleTitleChange = (title: string) => {
    if (selectedNote) {
      updateNote(selectedNote.id, { title });
    }
  };

  return (
    <div className="h-full flex bg-background/50">
      {/* Sidebar */}
      <div className="w-64 border-r border-border/50 flex flex-col">
        {/* Search */}
        <div className="p-3 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/50"
            />
          </div>
        </div>

        {/* Notes List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => {
                  setSelectedNote(note);
                  setEditContent(note.content);
                }}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedNote?.id === note.id
                    ? colorMap[note.color]
                    : "border-transparent hover:bg-white/5"
                }`}
              >
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium truncate">{note.title}</p>
                      {note.favorite && (
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {note.content.substring(0, 50)}...
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {note.date}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* New Note Button */}
        <div className="p-3 border-t border-border/50">
          <Button onClick={createNote} className="w-full" variant="secondary">
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            {/* Editor Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <Input
                value={selectedNote.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="text-lg font-semibold bg-transparent border-none p-0 focus-visible:ring-0"
              />
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavorite(selectedNote.id)}
                >
                  <Star
                    className={`w-4 h-4 ${
                      selectedNote.favorite ? "fill-yellow-400 text-yellow-400" : ""
                    }`}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteNote(selectedNote.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 p-4">
              <Textarea
                value={editContent}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Start writing..."
                className="h-full w-full resize-none bg-transparent border-none p-0 focus-visible:ring-0 text-sm"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Select a note or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesApp;
