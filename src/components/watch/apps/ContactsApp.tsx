import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Star, Phone, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Contact {
  id: string;
  name: string;
  phone_number: string;
  relationship: string | null;
  is_primary: boolean;
}

export function ContactsApp() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone_number: '',
    relationship: ''
  });

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  const fetchContacts = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('is_primary', { ascending: false });

    if (data) {
      setContacts(data);
    }
    setLoading(false);
  };

  const addContact = async () => {
    if (!user || !newContact.name || !newContact.phone_number) {
      toast.error('Name and phone number required');
      return;
    }

    const { data, error } = await supabase
      .from('emergency_contacts')
      .insert({
        user_id: user.id,
        name: newContact.name,
        phone_number: newContact.phone_number,
        relationship: newContact.relationship || null,
        is_primary: contacts.length === 0
      })
      .select()
      .single();

    if (data) {
      setContacts(prev => [...prev, data]);
      setNewContact({ name: '', phone_number: '', relationship: '' });
      setShowAddForm(false);
      toast.success('Emergency contact added');
    } else if (error) {
      toast.error('Failed to add contact');
    }
  };

  const togglePrimary = async (id: string) => {
    // Set all to non-primary first
    await supabase
      .from('emergency_contacts')
      .update({ is_primary: false })
      .eq('user_id', user?.id);

    // Set selected as primary
    await supabase
      .from('emergency_contacts')
      .update({ is_primary: true })
      .eq('id', id);

    setContacts(prev => 
      prev.map(c => ({ ...c, is_primary: c.id === id }))
    );
    toast.success('Primary contact updated');
  };

  const deleteContact = async (id: string) => {
    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', id);

    if (!error) {
      setContacts(prev => prev.filter(c => c.id !== id));
      toast.success('Contact removed');
    }
  };

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <Users className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Sign in to manage emergency contacts</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Emergency Contacts</h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 bg-primary/20 hover:bg-primary/30 rounded-full text-primary"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="glass rounded-xl p-4 mb-4 space-y-3">
          <input
            type="text"
            value={newContact.name}
            onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Name"
            className="w-full bg-muted rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="tel"
            value={newContact.phone_number}
            onChange={(e) => setNewContact(prev => ({ ...prev, phone_number: e.target.value }))}
            placeholder="Phone number"
            className="w-full bg-muted rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={newContact.relationship}
            onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
            placeholder="Relationship (optional)"
            className="w-full bg-muted rounded-lg px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 bg-muted hover:bg-muted/80 rounded-lg px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={addContact}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center gap-1"
            >
              <UserPlus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>
      )}

      {/* Contacts list */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {loading ? (
          <div className="text-center text-muted-foreground py-8">Loading...</div>
        ) : contacts.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No emergency contacts</p>
            <p className="text-xs mt-1">Add trusted people who will be alerted</p>
          </div>
        ) : (
          contacts.map(contact => (
            <div
              key={contact.id}
              className={cn(
                "glass rounded-xl p-3 flex items-center gap-3",
                contact.is_primary && "border-primary/30"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                contact.is_primary ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {contact.is_primary ? (
                  <Star className="w-5 h-5" />
                ) : (
                  <span className="text-lg font-medium">{contact.name[0]}</span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{contact.name}</p>
                  {contact.is_primary && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                      Primary
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{contact.phone_number}</p>
                {contact.relationship && (
                  <p className="text-xs text-muted-foreground">{contact.relationship}</p>
                )}
              </div>

              <div className="flex gap-1">
                {!contact.is_primary && (
                  <button
                    onClick={() => togglePrimary(contact.id)}
                    className="text-muted-foreground hover:text-primary p-2"
                    title="Set as primary"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteContact(contact.id)}
                  className="text-muted-foreground hover:text-sos p-2"
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
