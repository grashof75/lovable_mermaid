
import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import mermaid from 'mermaid';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreviewProps {
  code: string;
  className?: string;
  onViewChange?: (zoom: number, pan: { x: number; y: number }) => void;
  onComponentSelect?: (componentId: string, bounds: { x: number; y: number; width: number; height: number }, nodeText: string) => void;
}

export interface PreviewRef {
  setView: (zoom: number, pan: { x: number; y: number }) => void;
  resetView: () => void;
  getView: () => { zoom: number; pan: { x: number; y: number } };
  focusOnComponent: (componentId: string) => void;
  fitToView: () => void;
}

const Preview = forwardRef<PreviewRef, PreviewProps>(({ code, className, onViewChange, onComponentSelect }, ref) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [lastMousePos, setLastMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Focus on component function with intelligent zoom
  const focusOnComponent = useCallback((componentId: string) => {
    if (!contentRef.current || !containerRef.current) return;

    const element = contentRef.current.querySelector(`[id*="${componentId}"], .node[id*="${componentId}"]`);
    if (!element) return;

    // Get the SVG element to calculate proper coordinates
    const svgElement = contentRef.current.querySelector('svg');
    if (!svgElement) return;

    const elementRect = element.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const svgRect = svgElement.getBoundingClientRect();
    
    // Get SVG viewBox or dimensions for intelligent scaling
    const viewBox = svgElement.getAttribute('viewBox');
    let svgWidth = svgRect.width;
    let svgHeight = svgRect.height;
    
    if (viewBox) {
      const [, , vbWidth, vbHeight] = viewBox.split(' ').map(Number);
      svgWidth = vbWidth || svgWidth;
      svgHeight = vbHeight || svgHeight;
    }
    
    // Calculate component position relative to SVG content
    const componentX = (elementRect.left + elementRect.width / 2 - svgRect.left) / svgRect.width * svgWidth;
    const componentY = (elementRect.top + elementRect.height / 2 - svgRect.top) / svgRect.height * svgHeight;
    
    // Calculate container center
    const containerCenterX = containerRect.width / 2;
    const containerCenterY = containerRect.height / 2;
    
    // Intelligent zoom calculation based on:
    // 1. Component size relative to container
    // 2. SVG total dimensions
    // 3. Available viewport space
    const componentArea = elementRect.width * elementRect.height;
    const containerArea = containerRect.width * containerRect.height;
    const targetComponentRatio = 0.3; // Component should occupy ~30% of viewport
    
    const idealZoom = Math.sqrt((containerArea * targetComponentRatio) / componentArea);
    const targetZoom = Math.min(Math.max(idealZoom, 2.0), 8.0); // Clamp between 2x and 8x
    
    // Calculate pan to center the component with spatial awareness
    const scaledComponentX = componentX * (svgRect.width / svgWidth);
    const scaledComponentY = componentY * (svgRect.height / svgHeight);
    
    const newPanX = containerCenterX - (scaledComponentX * targetZoom);
    const newPanY = containerCenterY - (scaledComponentY * targetZoom);
    
    console.log('Intelligent zoom calculation:', {
      componentArea,
      containerArea,
      idealZoom,
      targetZoom,
      svgDimensions: { svgWidth, svgHeight },
      componentPos: { componentX, componentY }
    });
    
    setZoom(targetZoom);
    setPan({ x: newPanX, y: newPanY });
    setSelectedComponent(componentId);
    onViewChange?.(targetZoom, { x: newPanX, y: newPanY });
  }, [zoom, onViewChange, onComponentSelect]);

  // Fit to view function - calculates optimal zoom to show entire diagram
  const fitToView = useCallback(() => {
    if (!contentRef.current || !containerRef.current) return;

    const svgElement = contentRef.current.querySelector('svg');
    if (!svgElement) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const svgRect = svgElement.getBoundingClientRect();
    
    // Get SVG viewBox or natural dimensions
    const viewBox = svgElement.getAttribute('viewBox');
    let svgWidth = svgRect.width;
    let svgHeight = svgRect.height;
    
    if (viewBox) {
      const [, , vbWidth, vbHeight] = viewBox.split(' ').map(Number);
      svgWidth = vbWidth || svgWidth;
      svgHeight = vbHeight || svgHeight;
    }
    
    // Calculate zoom to fit entire diagram in container with some padding
    const paddingFactor = 0.9; // 90% of container to leave some margin
    const scaleX = (containerRect.width * paddingFactor) / svgWidth;
    const scaleY = (containerRect.height * paddingFactor) / svgHeight;
    const optimalZoom = Math.min(scaleX, scaleY, 1.0); // Don't zoom in past 100%
    
    // Center the diagram
    const scaledWidth = svgWidth * optimalZoom;
    const scaledHeight = svgHeight * optimalZoom;
    const centerX = (containerRect.width - scaledWidth) / 2;
    const centerY = (containerRect.height - scaledHeight) / 2;
    
    console.log('Fit to view calculation:', {
      containerSize: { width: containerRect.width, height: containerRect.height },
      svgSize: { width: svgWidth, height: svgHeight },
      optimalZoom,
      centerPosition: { x: centerX, y: centerY }
    });
    
    setZoom(optimalZoom);
    setPan({ x: centerX, y: centerY });
    onViewChange?.(optimalZoom, { x: centerX, y: centerY });
  }, [onViewChange]);

  // Expose functions via ref
  useImperativeHandle(ref, () => ({
    setView: (newZoom: number, newPan: { x: number; y: number }) => {
      setZoom(newZoom);
      setPan(newPan);
    },
    resetView: () => {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setSelectedComponent(null);
      onViewChange?.(1, { x: 0, y: 0 });
    },
    getView: () => ({ zoom, pan }),
    focusOnComponent,
    fitToView
  }), [zoom, pan, onViewChange, focusOnComponent, fitToView]);
  
  useEffect(() => {
    // Initialize mermaid with custom config
    mermaid.initialize({
      startOnLoad: false,
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'Inter, sans-serif',
    });
  }, []);
  
  useEffect(() => {
    const renderDiagram = async () => {
      if (!code.trim()) {
        setSvg('');
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Add a small delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const { svg } = await mermaid.render('mermaid-diagram', code);
        setSvg(svg);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
        setSvg('');
      } finally {
        setLoading(false);
      }
    };

    renderDiagram();
  }, [code]);

  // Add click handlers to SVG elements after rendering
  useEffect(() => {
    if (!svg || !contentRef.current) return;

    const svgElement = contentRef.current.querySelector('svg');
    if (!svgElement) return;

    const handleSvgClick = (e: MouseEvent) => {
      // Stop propagation to prevent drag start
      e.stopPropagation();
      
      const target = e.target as Element;
      
      // Find the clickable node element with more comprehensive selectors
      let nodeElement = target.closest('g[class*="node"], g.node, g.cluster, g[id*="flowchart"], g[id*="node"], .edgeLabel');
      
      // If target is a text element, use its parent group
      if (!nodeElement && (target.tagName === 'text' || target.tagName === 'tspan')) {
        nodeElement = target.closest('g');
      }
      
      // If target is within a rect/path/polygon, find the parent group
      if (!nodeElement && (target.tagName === 'rect' || target.tagName === 'path' || target.tagName === 'polygon' || target.tagName === 'circle')) {
        nodeElement = target.closest('g');
      }
      
      if (!nodeElement) return;

      // Extract node text content with multiple strategies
      let nodeText = '';
      
      // Strategy 1: Find all text elements and combine their content
      const textElements = nodeElement.querySelectorAll('text, tspan');
      if (textElements.length > 0) {
        nodeText = Array.from(textElements)
          .map(el => el.textContent?.trim())
          .filter(text => text && text.length > 0)
          .join(' ');
      }
      
      // Strategy 2: If no text found, try to find text in child elements
      if (!nodeText) {
        const allTextNodes = nodeElement.querySelectorAll('*');
        for (const node of allTextNodes) {
          if (node.textContent && node.textContent.trim()) {
            nodeText = node.textContent.trim();
            break;
          }
        }
      }
      
      // Strategy 3: Extract from clicked element directly if it contains text
      if (!nodeText && target.textContent?.trim()) {
        nodeText = target.textContent.trim();
      }
      
      // Strategy 4: Try to extract text from innerHTML and clean it
      if (!nodeText) {
        const innerHTML = nodeElement.innerHTML;
        const textMatch = innerHTML.match(/>([^<]+)</g);
        if (textMatch) {
          nodeText = textMatch
            .map(match => match.replace(/[><]/g, '').trim())
            .filter(text => text && text.length > 0)
            .join(' ');
        }
      }

      // Extract component ID from various possible attributes
      let componentId = nodeElement.getAttribute('id') || 
                       nodeElement.getAttribute('data-id') ||
                       nodeElement.className?.toString().match(/flowchart-\w+-\w+/)?.[0] ||
                       nodeText;
      
      // Fallback for nodeText if still empty
      if (!nodeText) {
        nodeText = componentId || 'Nodo senza testo';
      }
      
      // If still no ID, use a generic identifier
      if (!componentId) {
        componentId = 'node-' + Date.now();
      }
      
      console.log('Debug - Node element:', nodeElement);
      console.log('Debug - Extracted text:', nodeText);
      console.log('Debug - Component ID:', componentId);
      
      if (componentId && nodeText) {
        // Focus on component but don't trigger callback yet
        const elementRect = nodeElement.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect();
        
        if (elementRect && containerRect) {
          // Call selection callback with node text
          onComponentSelect?.(componentId, {
            x: elementRect.left - containerRect.left,
            y: elementRect.top - containerRect.top,
            width: elementRect.width,
            height: elementRect.height
          }, nodeText);
        }
        
        focusOnComponent(componentId);
      }
    };

    svgElement.addEventListener('click', handleSvgClick);
    
    // Add visual feedback on hover for various node types
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .mermaid g[class*="node"]:hover,
      .mermaid g.node:hover,
      .mermaid g.cluster:hover,
      .mermaid g[id*="flowchart"]:hover,
      .mermaid g[id*="node"]:hover {
        cursor: pointer !important;
        filter: brightness(1.1) drop-shadow(0 0 5px rgba(59, 130, 246, 0.5));
        transition: filter 0.2s ease;
      }
      .mermaid g[class*="node"].selected,
      .mermaid g.node.selected,
      .mermaid g.cluster.selected {
        filter: brightness(1.2) drop-shadow(0 0 8px rgba(59, 130, 246, 0.8));
      }
      .mermaid g text {
        pointer-events: none;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      svgElement.removeEventListener('click', handleSvgClick);
      styleElement.remove();
    };
  }, [svg, focusOnComponent]);

  // Zoom and pan handlers
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.1), 20);

    // Calculate new pan to zoom towards mouse cursor
    const zoomRatio = newZoom / zoom;
    const newPanX = mouseX - (mouseX - pan.x) * zoomRatio;
    const newPanY = mouseY - (mouseY - pan.y) * zoomRatio;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
    onViewChange?.(newZoom, { x: newPanX, y: newPanY });
  }, [zoom, pan, onViewChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    setPan(prevPan => {
      const newPan = {
        x: prevPan.x + deltaX,
        y: prevPan.y + deltaY
      };
      onViewChange?.(zoom, newPan);
      return newPan;
    });

    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, [isDragging, lastMousePos, zoom, onViewChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    onViewChange?.(1, { x: 0, y: 0 });
  }, [onViewChange]);

  // Event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className={cn("h-full w-full overflow-hidden", className)}>
      <div 
        ref={containerRef} 
        className="diagram-container min-h-full flex items-center justify-center relative cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onDoubleClick={resetView}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm animate-fade-in z-10">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
        )}
        
        {error && !loading && (
          <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg animate-fade-in">
            <h3 className="text-red-600 dark:text-red-400 font-medium mb-2">Error</h3>
            <pre className="text-red-500 dark:text-red-300 text-sm whitespace-pre-wrap font-mono">{error}</pre>
          </div>
        )}
        
        {!loading && !error && svg ? (
          <div 
            ref={contentRef}
            className="animate-scale-in"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
            dangerouslySetInnerHTML={{ __html: svg }} 
          />
        ) : (
          !loading && !error && (
            <div className="text-center text-slate-400 dark:text-slate-500 animate-fade-in">
              <p>Your diagram will appear here</p>
              <p className="text-xs mt-2">Usa la rotellina del mouse per zoomare • Trascina per spostare • Doppio click per resettare</p>
            </div>
          )
        )}
        
        {/* Zoom indicator */}
        {zoom !== 1 && (
          <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
            {Math.round(zoom * 100)}%
          </div>
        )}
      </div>
    </div>
  );
});

Preview.displayName = 'Preview';

export default Preview;
