import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '@/components/Header';
import Editor from '@/components/Editor';
import Preview, { PreviewRef } from '@/components/Preview';
import AIPrompt from '@/components/AIPrompt';
import ViewSidebar, { SavedView } from '@/components/ViewSidebar';
import CommentsPanel from '@/components/CommentsPanel';
import { DiagramsList } from '@/components/DiagramsList';
import { QuickCommentModal } from '@/components/QuickCommentModal';
import { QuickNavigationBar } from '@/components/QuickNavigationBar';
import { Comment, ProvisionalView } from '@/types/comments';
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PanelLeftClose, PanelLeftOpen, ChevronDown, ChevronUp, MessageSquare, Save } from 'lucide-react';
import { saveAs } from 'file-saver';
import { debounce } from 'lodash';
import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { db } from '@/utils/supabase';

const DEFAULT_DIAGRAM = `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action]
    B -->|No| D[Alternative Action]
    C --> E[Result]
    D --> E`;

interface Diagram {
  id: string;
  title: string;
  mermaid_code: string;
  description?: string;
  is_public: boolean;
  version: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  user_id?: string;
}

interface UserPreferences {
  theme_preference: string;
  toast_notifications_enabled: boolean;
  keyboard_shortcuts_enabled: boolean;
  auto_save_interval: number;
  default_zoom_level: number;
  ui_layout_config: any;
}

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  
  // Original state (kept identical)
  const [code, setCode] = useState<string>(DEFAULT_DIAGRAM);
  const [prompt, setPrompt] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [provisionalViews, setProvisionalViews] = useState<ProvisionalView[]>([]);
  const [currentView, setCurrentView] = useState({ zoom: 1, pan: { x: 0, y: 0 } });
  const [showLeftPanel, setShowLeftPanel] = useState<boolean>(true);
  const [showFooterPanel, setShowFooterPanel] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("views");
  const [pendingCommentViewId, setPendingCommentViewId] = useState<string | null>(null);
  const [showQuickCommentModal, setShowQuickCommentModal] = useState<boolean>(false);
  const [selectedComponentText, setSelectedComponentText] = useState<string>('');
  const previewRef = useRef<PreviewRef>(null);

  // New database state
  const [currentDiagram, setCurrentDiagram] = useState<Diagram | null>(null);
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    theme_preference: 'system',
    toast_notifications_enabled: true,
    keyboard_shortcuts_enabled: true,
    auto_save_interval: 30,
    default_zoom_level: 1.00,
    ui_layout_config: {}
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Database functions
  const loadUserPreferences = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error);
      } else if (data) {
        setUserPreferences(data);
        
        // Apply theme preference
        if (data.theme_preference === 'dark') {
          setIsDarkMode(true);
          document.documentElement.classList.add('dark');
        } else if (data.theme_preference === 'light') {
          setIsDarkMode(false);
          document.documentElement.classList.remove('dark');
        }
      } else {
        // Create default preferences
        await saveUserPreferences(userPreferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const saveUserPreferences = async (preferences: Partial<UserPreferences>) => {
    if (!user) return;
    
    try {
      const updatedPrefs = { ...userPreferences, ...preferences };
      
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...updatedPrefs
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error saving preferences:', error);
      } else if (data) {
        setUserPreferences(data);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const saveDiagram = async (title?: string, diagramCode?: string, description?: string) => {
    if (!user) return;
    
    const codeToSave = diagramCode || code;
    if (!codeToSave?.trim()) return;

    try {
      const diagramData = {
        user_id: user.id,
        title: title || currentDiagram?.title || 'Untitled Diagram',
        mermaid_code: codeToSave,
        description: description || currentDiagram?.description,
        tags: currentDiagram?.tags || [],
        version: (currentDiagram?.version || 0) + 1,
        is_public: currentDiagram?.is_public || false
      };

      if (currentDiagram?.id) {
        // Update existing
        const { data, error } = await supabase
          .from('diagrams')
          .update(diagramData)
          .eq('id', currentDiagram.id)
          .eq('user_id', user.id)
          .select()
          .single();
        
        if (error) {
          throw error;
        } else if (data) {
          setCurrentDiagram(data);
          setHasUnsavedChanges(false);
          if (userPreferences.toast_notifications_enabled) {
            toast({
              title: "Diagramma aggiornato",
              description: "Il diagramma è stato salvato con successo",
            });
          }
        }
      } else {
        // Create new
        const { data, error } = await supabase
          .from('diagrams')
          .insert(diagramData)
          .select()
          .single();
        
        if (error) {
          throw error;
        } else if (data) {
          setCurrentDiagram(data);
          setHasUnsavedChanges(false);
          // Load views and comments for the newly created diagram (should be empty)
          await loadViewsForDiagram(data.id);
          await loadCommentsForDiagram(data.id);
          if (userPreferences.toast_notifications_enabled) {
            toast({
              title: "Diagramma salvato",
              description: "Nuovo diagramma creato con successo",
            });
          }
        }
      }
    } catch (error) {
      console.error('Error saving diagram:', error);
      if (userPreferences.toast_notifications_enabled) {
        toast({
          title: "Errore salvataggio",
          description: "Impossibile salvare il diagramma",
          variant: "destructive",
        });
      }
    }
  };

  const loadDiagram = async (diagram: Diagram) => {
    setCurrentDiagram(diagram);
    setCode(diagram.mermaid_code);
    setHasUnsavedChanges(false);
    
    // Load views and comments for this diagram
    if (user) {
      await loadViewsForDiagram(diagram.id);
      await loadCommentsForDiagram(diagram.id);
    }
    
    if (userPreferences.toast_notifications_enabled) {
      toast({
        title: "Diagramma caricato",
        description: `"${diagram.title}" caricato con successo`,
      });
    }
  };

  const loadViewsForDiagram = async (diagramId: string) => {
    if (!user) return;
    
    try {
      const views = await db.savedViews.getAll(diagramId, user.id);
      
      // Convert database format to local format
      const localViews: SavedView[] = views.map(view => ({
        id: view.id,
        name: view.name,
        zoom: view.zoom_level,
        pan: { x: view.pan_x, y: view.pan_y },
        timestamp: new Date(view.created_at).getTime()
      }));
      
      setSavedViews(localViews);
    } catch (error) {
      console.error('Error loading views:', error);
      setSavedViews([]);
    }
  };

  const loadCommentsForDiagram = async (diagramId: string) => {
    if (!user) return;
    
    try {
      const comments = await db.comments.getAll(diagramId);
      
      // Convert database format to local format
      const localComments: Comment[] = comments.map(comment => ({
        id: comment.id,
        text: comment.text,
        timestamp: new Date(comment.created_at).getTime(),
        viewId: comment.linked_view_id,
        linkedViewId: comment.linked_view_id,
        isProvisional: false
      }));
      
      setComments(localComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    }
  };

  const setAllDiagrams = (diagrams: Diagram[]) => {
    setDiagrams(diagrams);
  };

  const createNewDiagram = () => {
    setCurrentDiagram(null);
    setCode(DEFAULT_DIAGRAM);
    setHasUnsavedChanges(false);
    setSavedViews([]); // Clear views when creating new diagram
    setComments([]); // Clear comments when creating new diagram
    
    if (userPreferences.toast_notifications_enabled) {
      toast({
        title: "Nuovo diagramma",
        description: "Nuovo diagramma creato",
      });
    }
  };

  // Auto-save debounced function
  const debouncedSave = useCallback(
    debounce(async (title: string, diagramCode: string) => {
      if (user && diagramCode.trim() && diagramCode !== DEFAULT_DIAGRAM) {
        await saveDiagram(title, diagramCode);
      }
    }, userPreferences.auto_save_interval * 1000),
    [user, userPreferences.auto_save_interval, currentDiagram]
  );

  // Initialize user data when user changes
  useEffect(() => {
    if (user && !authLoading) {
      loadUserPreferences();
    } else if (!user) {
      // Reset to defaults when logged out
      setCurrentDiagram(null);
      setDiagrams([]);
      setCode(DEFAULT_DIAGRAM);
      setHasUnsavedChanges(false);
      setSavedViews([]);
      setComments([]);
    }
  }, [user, authLoading]);

  // Auto-save when code changes
  useEffect(() => {
    if (code !== currentDiagram?.mermaid_code && code !== DEFAULT_DIAGRAM) {
      setHasUnsavedChanges(true);
      
      if (user) {
        const title = currentDiagram?.title || 'Auto-saved Diagram';
        debouncedSave(title, code);
      }
    }
  }, [code, currentDiagram, debouncedSave, user]);

  // Cleanup debounced function
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  // Update theme preference when theme changes
  const toggleTheme = async () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save theme preference
    if (user) {
      await saveUserPreferences({
        theme_preference: newDarkMode ? 'dark' : 'light'
      });
    }
    
    // Re-render the diagram with the new theme
    const currentCode = code;
    setCode('');
    setTimeout(() => setCode(currentCode), 10);
  };

  const handleExport = () => {
    try {
      const svgElement = document.querySelector('.diagram-container svg');
      if (!svgElement) {
        toast({
          title: "Export failed",
          description: "No diagram to export",
          variant: "destructive",
        });
        return;
      }
      
      // Get SVG content
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
      
      // Generate filename from first line of diagram or use default
      let filename = 'mermaid-diagram.svg';
      const firstLine = code.split('\n')[0];
      if (firstLine) {
        const cleanName = firstLine
          .replace(/[^\w\s]/gi, '')
          .trim()
          .replace(/\s+/g, '-')
          .toLowerCase();
        if (cleanName) {
          filename = `${cleanName}.svg`;
        }
      }
      
      saveAs(svgBlob, filename);
      
      toast({
        title: "Export successful",
        description: `Saved as ${filename}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "Failed to export diagram",
        variant: "destructive",
      });
    }
  };

  const handleDiagramGenerated = (generatedCode: string) => {
    setCode(generatedCode);
  };

  // View management functions
  const handleViewChange = (zoom: number, pan: { x: number; y: number }) => {
    setCurrentView({ zoom, pan });
  };

  const handleSaveView = async (name: string) => {
    if (!user || !currentDiagram?.id) {
      toast({
        title: "Errore",
        description: "Devi essere autenticato e avere un diagramma selezionato per salvare una vista",
        variant: "destructive",
      });
      return;
    }

    try {
      const newView = await db.savedViews.create({
        name,
        diagram_id: currentDiagram.id,
        user_id: user.id,
        zoom_level: currentView.zoom,
        pan_x: currentView.pan.x,
        pan_y: currentView.pan.y,
        sort_order: savedViews.length
      });

      // Convert database format to local format
      const localView: SavedView = {
        id: newView.id,
        name: newView.name,
        zoom: newView.zoom_level,
        pan: { x: newView.pan_x, y: newView.pan_y },
        timestamp: new Date(newView.created_at).getTime()
      };

      setSavedViews(prev => [...prev, localView]);
      
      if (userPreferences.toast_notifications_enabled) {
        toast({
          title: "Vista salvata",
          description: `Vista "${name}" salvata con successo`,
        });
      }
    } catch (error) {
      console.error('Error saving view:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare la vista",
        variant: "destructive",
      });
    }
  };

  const handleLoadView = (view: SavedView) => {
    previewRef.current?.setView(view.zoom, view.pan);
    setCurrentView({ zoom: view.zoom, pan: view.pan });
  };

  const handleDeleteView = async (id: string) => {
    if (!user) return;

    try {
      // Prima trova tutti i commenti collegati a questa vista
      const linkedComments = comments.filter(comment => comment.linkedViewId === id || comment.viewId === id);
      
      console.log(`Deleting view ${id} with ${linkedComments.length} linked comments`);
      
      // Elimina prima i commenti collegati
      for (const comment of linkedComments) {
        try {
          await db.comments.delete(comment.id);
          console.log(`Deleted comment ${comment.id}`);
        } catch (commentError) {
          console.error(`Error deleting comment ${comment.id}:`, commentError);
          // Continua anche se un commento fallisce
        }
      }
      
      // Poi elimina la vista
      await db.savedViews.delete(id);
      
      // Aggiorna lo stato locale
      setSavedViews(prev => prev.filter(view => view.id !== id));
      setComments(prev => prev.filter(comment => 
        comment.linkedViewId !== id && comment.viewId !== id
      ));
      
      if (userPreferences.toast_notifications_enabled) {
        const deletedCount = linkedComments.length;
        toast({
          title: "Vista eliminata",
          description: deletedCount > 0 
            ? `Vista e ${deletedCount} commento${deletedCount > 1 ? 'i' : ''} collegat${deletedCount > 1 ? 'i' : 'o'} eliminat${deletedCount > 1 ? 'i' : 'o'}`
            : "Vista eliminata con successo",
        });
      }
    } catch (error) {
      console.error('Error deleting view:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare la vista",
        variant: "destructive",
      });
    }
  };

  const handleUpdateViews = async (views: SavedView[]) => {
    setSavedViews(views);
    
    // If we have a current diagram, sync the order to database
    if (user && currentDiagram?.id) {
      try {
        for (let i = 0; i < views.length; i++) {
          await db.savedViews.update(views[i].id, { sort_order: i });
        }
      } catch (error) {
        console.error('Error updating view order:', error);
      }
    }
  };

  const handleResetView = () => {
    previewRef.current?.resetView();
    setCurrentView({ zoom: 1, pan: { x: 0, y: 0 } });
  };

  // Comments management functions
  const handleAddComment = (commentData: Omit<Comment, 'id' | 'timestamp'>) => {
    const newComment: Comment = {
      ...commentData,
      id: `comment-${Date.now()}`,
      timestamp: Date.now(),
      // Se c'è un viewId in sospeso, collegalo
      viewId: pendingCommentViewId || commentData.viewId,
    };
    setComments(prev => [...prev, newComment]);
    setPendingCommentViewId(null); // Reset pending viewId
  };

  const handleCreateCommentForView = (viewId: string) => {
    // Imposta il viewId in sospeso e cambia alla tab commenti
    setPendingCommentViewId(viewId);
    setActiveTab("comments");
    
    // Se il pannello è collassato, espandilo
    if (!showFooterPanel) {
      setShowFooterPanel(true);
    }
  };

  const handleDeleteComment = (id: string) => {
    const comment = comments.find(c => c.id === id);
    if (comment?.linkedViewId && comment.isProvisional) {
      // Rimuovi anche la vista provvisoria collegata
      setProvisionalViews(prev => prev.filter(v => v.id !== comment.linkedViewId));
    }
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const handleCreateProvisionalView = (commentId: string, viewName: string) => {
    const newProvisionalView: ProvisionalView = {
      id: `provisional-${Date.now()}`,
      name: viewName,
      zoom: currentView.zoom,
      pan: currentView.pan,
      timestamp: Date.now(),
      commentId,
      isProvisional: true,
    };

    setProvisionalViews(prev => [...prev, newProvisionalView]);
    
    // Aggiorna il commento per collegarlo alla vista provvisoria
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, linkedViewId: newProvisionalView.id, isProvisional: true }
        : comment
    ));
  };

  const handleLoadProvisionalView = (view: SavedView | ProvisionalView) => {
    previewRef.current?.setView(view.zoom, view.pan);
  };

  const handleUpdateViewToCurrentState = (viewId: string) => {
    setSavedViews(prev => prev.map(view => 
      view.id === viewId 
        ? { ...view, zoom: currentView.zoom, pan: currentView.pan, timestamp: Date.now() }
        : view
    ));
  };

  const handleApplyProvisionalViewToSaved = (viewId: string, provisionalViewId: string) => {
    const provisionalView = provisionalViews.find(v => v.id === provisionalViewId);
    
    if (provisionalView) {
      setSavedViews(prev => prev.map(view => 
        view.id === viewId 
          ? { ...view, zoom: provisionalView.zoom, pan: provisionalView.pan, timestamp: Date.now() }
          : view
      ));
      
      toast({
        title: "Vista aggiornata",
        description: `Vista "${savedViews.find(v => v.id === viewId)?.name}" aggiornata con la vista provvisoria`,
      });
    }
  };

  const handleUnlinkView = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment?.linkedViewId && comment.isProvisional) {
      // Rimuovi la vista provvisoria
      setProvisionalViews(prev => prev.filter(v => v.id !== comment.linkedViewId));
    }
    
    // Rimuovi il collegamento dal commento
    setComments(prev => prev.map(c => 
      c.id === commentId 
        ? { ...c, linkedViewId: undefined, isProvisional: undefined }
        : c
    ));
    
    toast({
      title: "Vista scollegata",
      description: "La vista è stata scollegata dal commento",
    });
  };

  const handleEditComment = (commentId: string, newText: string) => {
    setComments(prev => prev.map(comment =>
      comment.id === commentId
        ? { ...comment, text: newText }
        : comment
    ));
    
    toast({
      title: "Commento aggiornato",
      description: "Il commento è stato modificato",
    });
  };

  // Quick navigation handlers
  const handleJumpToComment = (comment: Comment) => {
    // Se il commento è collegato a una vista, caricala prima
    if (comment.linkedViewId || comment.viewId) {
      const linkedView = savedViews.find(v => v.id === (comment.linkedViewId || comment.viewId));
      if (linkedView) {
        handleLoadView(linkedView);
      }
    }
    
    // Switcha al tab commenti e evidenzia il commento
    setActiveTab("comments");
    
    // Scroll al commento dopo un breve delay
    setTimeout(() => {
      const commentElement = document.querySelector(`[data-comment-id="${comment.id}"]`);
      if (commentElement) {
        commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        commentElement.classList.add('highlight-comment');
        setTimeout(() => {
          commentElement.classList.remove('highlight-comment');
        }, 2000);
      }
    }, 100);
  };

  // Component selection handler
  const handleComponentSelect = useCallback((componentId: string, bounds: { x: number; y: number; width: number; height: number }, nodeText: string) => {
    console.log('Component selected:', componentId, bounds, nodeText);
    
    // Store the selected component text and open the modal
    setSelectedComponentText(nodeText);
    setShowQuickCommentModal(true);
  }, []);

  // Quick comment handler
  const handleQuickSaveAndComment = async (viewName: string, commentText: string) => {
    if (!user || !currentDiagram?.id) {
      toast({
        title: "Errore",
        description: "Devi essere autenticato e avere un diagramma selezionato",
        variant: "destructive",
      });
      return;
    }

    console.log('Saving view with data:', {
      name: viewName,
      diagram_id: currentDiagram.id,
      user_id: user.id,
      zoom_level: currentView.zoom,
      pan_x: currentView.pan.x,
      pan_y: currentView.pan.y,
      sort_order: savedViews.length
    });

    let newView;
    let viewSaved = false;
    let commentSaved = false;

    try {
      // 1. Save the view first (this should always work)
      newView = await db.savedViews.create({
        name: viewName,
        diagram_id: currentDiagram.id,
        user_id: user.id,
        zoom_level: currentView.zoom,
        pan_x: currentView.pan.x,
        pan_y: currentView.pan.y,
        sort_order: savedViews.length
      });

      console.log('View saved successfully:', newView);

      // Convert to local format
      const localView: SavedView = {
        id: newView.id,
        name: newView.name,
        zoom: newView.zoom_level,
        pan: { x: newView.pan_x, y: newView.pan_y },
        timestamp: new Date(newView.created_at).getTime()
      };

      setSavedViews(prev => [...prev, localView]);
      viewSaved = true;

    } catch (viewError) {
      console.error('Error saving view:', viewError);
      toast({
        title: "Errore salvataggio vista",
        description: viewError instanceof Error ? viewError.message : "Impossibile salvare la vista",
        variant: "destructive",
      });
      return; // Exit if view saving fails
    }

    // 2. Try to save comment separately (don't fail the whole operation if this fails)
    if (commentText.trim() && newView) {
      try {
        const commentData = {
          user_id: user.id,
          diagram_id: currentDiagram.id,
          text: commentText,
          linked_view_id: newView.id,
          is_resolved: false
        };
        
        console.log('Saving comment with data:');
        console.log('- user_id:', user.id);
        console.log('- diagram_id:', currentDiagram.id);
        console.log('- text:', commentText);
        console.log('- linked_view_id:', newView.id);
        console.log('- is_resolved:', false);
        console.log('Full object:', JSON.stringify(commentData, null, 2));

        // Save comment to database
        const newDbComment = await db.comments.create(commentData);

        console.log('Comment saved successfully:', newDbComment);

        // Convert to local format
        const newComment: Comment = {
          id: newDbComment.id,
          text: newDbComment.text,
          timestamp: new Date(newDbComment.created_at).getTime(),
          viewId: newView.id,
          linkedViewId: newView.id,
          isProvisional: false
        };

        setComments(prev => [...prev, newComment]);
        commentSaved = true;

      } catch (commentError) {
        console.error('Error saving comment (but view was saved):', commentError);
        console.error('Comment error details:');
        
        if (commentError instanceof Error) {
          console.error('- Message:', commentError.message);
          console.error('- Stack:', commentError.stack);
        }
        
        // Log additional error details if available
        if (commentError && typeof commentError === 'object') {
          console.error('- Full error object:', JSON.stringify(commentError, null, 2));
        }
        
        // Don't show error toast for comment failure if view succeeded
      }
    }

    // Show success message based on what was saved
    if (userPreferences.toast_notifications_enabled) {
      if (viewSaved && commentSaved) {
        toast({
          title: "Vista e commento salvati",
          description: `Vista "${viewName}" salvata con commento`,
        });
      } else if (viewSaved && commentText.trim()) {
        toast({
          title: "Vista salvata, commento fallito",
          description: `Vista "${viewName}" salvata, ma il commento non è stato salvato`,
          variant: "destructive",
        });
      } else if (viewSaved) {
        toast({
          title: "Vista salvata",
          description: `Vista "${viewName}" salvata con successo`,
        });
      }
    }

  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-slate-100 dark:from-slate-900 dark:to-slate-800 animate-fade-in">
      <Header 
        onExport={handleExport}
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
      />
      
      <div className="flex-1 flex flex-col relative">
        <ResizablePanelGroup direction="vertical" className="flex-1">
          <ResizablePanel defaultSize={75} minSize={50}>
            <ResizablePanelGroup direction="horizontal" className="rounded-lg border bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm m-6">
              {showLeftPanel && (
                <>
                  <ResizablePanel defaultSize={35} minSize={25}>
                    <div className="glass-panel p-4 flex flex-col h-full animate-slide-in border-0">
                      <Editor 
                        value={code} 
                        onChange={setCode} 
                        className="flex-1"
                        promptValue={prompt}
                        onPromptChange={setPrompt}
                      />
                      <Separator className="my-4" />
                      <AIPrompt 
                        prompt={prompt} 
                        onDiagramGenerated={handleDiagramGenerated} 
                      />
                    </div>
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                </>
              )}
              
              <ResizablePanel defaultSize={showLeftPanel ? 65 : 100} minSize={30}>
                <div className="glass-panel p-4 flex flex-col h-full animate-slide-in border-0 relative" style={{ animationDelay: '100ms' }}>
                  <Preview 
                    ref={previewRef}
                    code={code} 
                    className="flex-1" 
                    onViewChange={handleViewChange}
                    onComponentSelect={handleComponentSelect}
                  />
                  {/* Toggle panel button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFooterPanel(!showFooterPanel)}
                    className="absolute right-2 bottom-2 z-10 bg-background/80 backdrop-blur-sm"
                  >
                    {showFooterPanel ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </Button>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          
          <ResizableHandle withHandle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => previewRef.current?.fitToView()}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-background/90 backdrop-blur-sm border hover:bg-accent/50 transition-all duration-200 shadow-sm"
              title="Adatta diagramma alla vista (100%)"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
              </svg>
            </Button>
          </ResizableHandle>
          
          <ResizablePanel defaultSize={25} minSize={15} maxSize={50}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="diagrams">Diagrammi</TabsTrigger>
                <TabsTrigger value="views">Viste</TabsTrigger>
                <TabsTrigger value="comments">Commenti</TabsTrigger>
              </TabsList>
              
              <TabsContent value="diagrams" className="h-full mt-0">
                <DiagramsList
                  currentDiagram={currentDiagram}
                  onLoadDiagram={loadDiagram}
                  onCreateNew={createNewDiagram}
                  onSave={() => saveDiagram()}
                  onDiagramsChange={setDiagrams}
                  onUpdateDiagram={(updatedDiagram) => {
                    if (currentDiagram?.id === updatedDiagram.id) {
                      setCurrentDiagram(updatedDiagram);
                    }
                  }}
                  hasUnsavedChanges={hasUnsavedChanges}
                />
              </TabsContent>
              
              <TabsContent value="views" className="h-full mt-0">
                <ViewSidebar
                  savedViews={savedViews}
                  onSaveView={handleSaveView}
                  onLoadView={handleLoadView}
                  onDeleteView={handleDeleteView}
                  onResetView={handleResetView}
                  onUpdateViews={handleUpdateViews}
                  setSavedViews={setSavedViews}
                  currentZoom={previewRef.current?.getView()?.zoom || 1}
                  currentPan={previewRef.current?.getView()?.pan || { x: 0, y: 0 }}
                  isCollapsed={!showFooterPanel}
                  onToggleCollapse={() => setShowFooterPanel(!showFooterPanel)}
                  comments={comments}
                  provisionalViews={provisionalViews}
                  onCreateCommentForView={handleCreateCommentForView}
                  onUpdateViewToCurrentState={handleUpdateViewToCurrentState}
                  onApplyProvisionalViewToSaved={handleApplyProvisionalViewToSaved}
                />
              </TabsContent>
              
              <TabsContent value="comments" className="h-full mt-0">
                <CommentsPanel
                  comments={comments}
                  provisionalViews={provisionalViews}
                  savedViews={savedViews}
                  currentView={currentView}
                  onAddComment={handleAddComment}
                  onDeleteComment={handleDeleteComment}
                  onEditComment={handleEditComment}
                  onCreateProvisionalView={handleCreateProvisionalView}
                  onLoadView={handleLoadProvisionalView}
                  onUnlinkView={handleUnlinkView}
                  pendingViewId={pendingCommentViewId}
                />
              </TabsContent>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
        
        {/* Toggle buttons */}
        <div className="absolute top-10 left-10 z-20 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLeftPanel(!showLeftPanel)}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-border/50"
          >
            {showLeftPanel ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Quick Comment Modal */}
      <QuickCommentModal
        isOpen={showQuickCommentModal}
        onClose={() => {
          setShowQuickCommentModal(false);
          setSelectedComponentText('');
        }}
        onSave={handleQuickSaveAndComment}
        currentZoom={currentView.zoom}
        currentPan={currentView.pan}
        selectedComponentText={selectedComponentText}
      />

      {/* Quick Navigation Bar - Always visible when logged in */}
      {user && (
        <QuickNavigationBar
          savedViews={savedViews}
          comments={comments}
          onLoadView={handleLoadView}
          onJumpToComment={handleJumpToComment}
          onQuickSaveComment={() => setShowQuickCommentModal(true)}
          currentDiagram={currentDiagram}
        />
      )}
    </div>
  );
};

export default Index;