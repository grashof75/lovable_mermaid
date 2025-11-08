import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Eye, MessageCircle, ChevronRight, ChevronLeft, Clock, GripVertical, Save } from 'lucide-react';
import { SavedView } from '@/components/ViewSidebar';
import { Comment } from '@/types/comments';

interface QuickNavigationBarProps {
  savedViews: SavedView[];
  comments: Comment[];
  onLoadView: (view: SavedView) => void;
  onJumpToComment: (comment: Comment) => void;
  onQuickSaveComment?: () => void;
  currentDiagram?: any;
  className?: string;
}

export const QuickNavigationBar: React.FC<QuickNavigationBarProps> = ({
  savedViews,
  comments,
  onLoadView,
  onJumpToComment,
  onQuickSaveComment,
  currentDiagram,
  className = ""
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const barRef = useRef<HTMLDivElement>(null);

  // Load position from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('quickNavBar-position');
    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition);
        setPosition(parsed);
      } catch (e) {
        // Default position if parsing fails
        setPosition({ x: window.innerWidth - 320, y: window.innerHeight / 2 - 200 });
      }
    } else {
      // Default position (center-right)
      const defaultX = Math.max(window.innerWidth - 320, 0);
      const defaultY = Math.max(window.innerHeight / 2 - 200, 0);
      setPosition({ x: defaultX, y: defaultY });
    }
  }, []);

  // Save position to localStorage
  useEffect(() => {
    localStorage.setItem('quickNavBar-position', JSON.stringify(position));
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!barRef.current) return;
    
    setIsDragging(true);
    const rect = barRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep within screen bounds
    const maxX = window.innerWidth - 288; // 288px = w-72
    const maxY = window.innerHeight - 400; // max height
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isCollapsed) {
    return (
      <div 
        ref={barRef}
        className={`fixed z-20 ${className}`}
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        <div 
          onMouseDown={handleMouseDown}
          className="bg-background/90 backdrop-blur-sm border rounded-lg shadow-lg p-2"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(false)}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={barRef}
      className={`fixed w-72 max-h-96 z-20 ${className}`}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'auto'
      }}
    >
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg">
        {/* Header - Draggable area */}
        <div 
          className="flex items-center justify-between p-3 border-b cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Navigazione Rapida</h3>
          </div>
          <div className="flex items-center gap-1">
            {/* Quick Save & Comment button in header */}
            {currentDiagram && onQuickSaveComment && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickSaveComment();
                    }}
                    className="h-7 px-2 bg-primary/90 hover:bg-primary"
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    <Save className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <div className="space-y-1">
                    <div className="font-medium text-sm">🎮 Salva Vista</div>
                    <div className="text-xs">
                      Salva rapidamente la vista corrente (commento opzionale)
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(true)}
              className="h-6 w-6 p-0"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-80">
          <div className="p-3 space-y-4">
            {/* Empty state */}
            {savedViews.length === 0 && comments.length === 0 && (
              <div className="text-center text-muted-foreground py-6">
                <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nessuna vista o commento</p>
                <p className="text-xs mt-1">
                  Salva una vista o aggiungi un commento per iniziare
                </p>
              </div>
            )}
            
            {/* Viste Salvate */}
            {savedViews.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Viste</span>
                  <Badge variant="secondary" className="text-xs">
                    {savedViews.length}
                  </Badge>
                </div>
              
                <div className="space-y-1">
                  {savedViews.slice(0, 5).map((view) => (
                    <Tooltip key={view.id}>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => onLoadView(view)}
                          className="flex items-center justify-between p-2 text-xs bg-accent/30 hover:bg-accent/50 rounded cursor-pointer transition-colors group"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">{view.name}</div>
                            <div className="text-muted-foreground">
                              {view.zoom.toFixed(1)}x • {formatTime(view.timestamp)}
                            </div>
                          </div>
                          <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <div className="text-xs">
                          <div><strong>{view.name}</strong></div>
                          <div>Zoom: {view.zoom.toFixed(1)}x</div>
                          <div>Pan: ({view.pan.x.toFixed(0)}, {view.pan.y.toFixed(0)})</div>
                          <div className="text-muted-foreground">
                            Salvata: {new Date(view.timestamp).toLocaleString('it-IT')}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  
                  {savedViews.length > 5 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      ...e {savedViews.length - 5} altre viste
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Commenti Recenti */}
            {comments.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Commenti</span>
                  <Badge variant="secondary" className="text-xs">
                    {comments.length}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  {comments
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, 4)
                    .map((comment) => (
                      <Tooltip key={comment.id}>
                        <TooltipTrigger asChild>
                          <div
                            onClick={() => onJumpToComment(comment)}
                            className="flex items-start gap-2 p-2 text-xs bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/30 dark:hover:bg-orange-950/50 rounded cursor-pointer transition-colors group"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="line-clamp-2 leading-tight">
                                {comment.text}
                              </div>
                              <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatTime(comment.timestamp)}
                                {comment.linkedViewId && (
                                  <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                                    vista
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs">
                          <div className="text-xs">
                            <div className="font-medium mb-1">Commento completo:</div>
                            <div className="mb-2">{comment.text}</div>
                            <div className="text-muted-foreground">
                              {new Date(comment.timestamp).toLocaleString('it-IT')}
                            </div>
                            {comment.linkedViewId && (
                              <div className="text-primary text-xs mt-1">
                                Collegato a una vista salvata
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  
                  {comments.length > 4 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      ...e {comments.length - 4} altri commenti
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};