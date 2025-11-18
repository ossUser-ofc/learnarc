import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import { Tag } from '@/types/task';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface TagManagerProps {
  taskId: string;
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}

export function TagManager({ taskId, selectedTags, onTagsChange }: TagManagerProps) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error loading tags:', error);
      return;
    }

    const mappedTags = (data || []).map(tag => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      createdAt: tag.created_at,
    }));

    setAllTags(mappedTags);
  };

  const createTag = async () => {
    if (!newTagName.trim()) return;

    const { data, error } = await supabase
      .from('tags')
      .insert({ name: newTagName.trim() })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create tag');
      return;
    }

    const mappedTag: Tag = {
      id: data.id,
      name: data.name,
      color: data.color,
      createdAt: data.created_at,
    };

    setAllTags([...allTags, mappedTag]);
    await addTagToTask(mappedTag);
    setNewTagName('');
  };

  const addTagToTask = async (tag: Tag) => {
    // Check if already added
    if (selectedTags.some(t => t.id === tag.id)) {
      return;
    }

    const { error } = await supabase
      .from('task_tags')
      .insert({ task_id: taskId, tag_id: tag.id });

    if (error) {
      toast.error('Failed to add tag');
      return;
    }

    onTagsChange([...selectedTags, tag]);
    toast.success('Tag added');
  };

  const removeTagFromTask = async (tagId: string) => {
    const { error } = await supabase
      .from('task_tags')
      .delete()
      .eq('task_id', taskId)
      .eq('tag_id', tagId);

    if (error) {
      toast.error('Failed to remove tag');
      return;
    }

    onTagsChange(selectedTags.filter(t => t.id !== tagId));
    toast.success('Tag removed');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {selectedTags.map(tag => (
          <Badge key={tag.id} variant="secondary" className="gap-1">
            {tag.name}
            <button
              onClick={() => removeTagFromTask(tag.id)}
              className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="h-3 w-3" />
              Add Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TagIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">Manage Tags</span>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="New tag name..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      createTag();
                    }
                  }}
                  className="text-sm"
                />
                <Button size="sm" onClick={createTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-1 max-h-48 overflow-y-auto">
                {allTags
                  .filter(tag => !selectedTags.some(t => t.id === tag.id))
                  .map(tag => (
                    <Button
                      key={tag.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        addTagToTask(tag);
                        setIsOpen(false);
                      }}
                    >
                      {tag.name}
                    </Button>
                  ))}
                {allTags.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No tags yet. Create one above!
                  </p>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
