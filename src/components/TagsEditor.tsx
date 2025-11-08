import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';

interface TagsEditorProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  availableTags?: string[];
}

export const TagsEditor: React.FC<TagsEditorProps> = ({ 
  tags, 
  onChange, 
  maxTags = 5,
  availableTags = []
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const addTag = () => {
    const trimmedTag = newTag.trim();
    if (!trimmedTag) return;
    
    // Check if there's an exact match in available tags first (case insensitive)
    const exactMatch = availableTags.find(tag => 
      tag.toLowerCase() === trimmedTag.toLowerCase()
    );
    const tagToAdd = exactMatch || trimmedTag;
    
    if (tagToAdd && !tags.includes(tagToAdd) && tags.length < maxTags) {
      onChange([...tags, tagToAdd]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setNewTag('');
      setShowSuggestions(false);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      // Handle arrow navigation for suggestions if needed
    }
  };

  // Get filtered suggestions based on current input
  const filteredSuggestions = availableTags
    .filter(tag => 
      tag.toLowerCase().includes(newTag.toLowerCase()) && 
      !tags.includes(tag) &&
      tag.toLowerCase() !== newTag.trim().toLowerCase()
    )
    .slice(0, 5);

  const selectSuggestion = (suggestion: string) => {
    if (!tags.includes(suggestion) && tags.length < maxTags) {
      onChange([...tags, suggestion]);
      setNewTag('');
      setShowSuggestions(false);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1">
      {tags.map((tag, index) => (
        <Badge 
          key={index} 
          variant="secondary" 
          className="text-xs px-2 py-0.5 group hover:bg-destructive/20"
        >
          {tag}
          <Button
            onClick={() => removeTag(tag)}
            size="sm"
            variant="ghost"
            className="h-auto p-0 ml-1 text-xs opacity-0 group-hover:opacity-100 hover:bg-transparent"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      
      {isEditing ? (
        <div className="relative flex items-center gap-1">
          <Input
            ref={inputRef}
            value={newTag}
            onChange={(e) => {
              setNewTag(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onKeyDown={handleKeyPress}
            onBlur={() => {
              // Delay to allow clicking on suggestions
              setTimeout(() => {
                if (newTag.trim()) addTag();
                setIsEditing(false);
                setShowSuggestions(false);
              }, 200);
            }}
            onFocus={() => setShowSuggestions(newTag.length > 0)}
            placeholder="Nuovo tag..."
            className="h-6 text-xs px-2 w-24"
            maxLength={20}
          />
          
          {/* Suggestions dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-32 bg-popover border rounded-md shadow-md z-50">
              {filteredSuggestions.map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => selectSuggestion(suggestion)}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Badge variant="secondary" className="text-xs">
                    {suggestion}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        tags.length < maxTags && (
          <Button
            onClick={() => setIsEditing(true)}
            size="sm"
            variant="ghost"
            className="h-5 w-5 p-0 rounded-full border border-dashed border-muted-foreground/50 hover:border-muted-foreground"
          >
            <Plus className="h-3 w-3" />
          </Button>
        )
      )}
    </div>
  );
};