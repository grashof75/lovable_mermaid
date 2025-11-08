import { GripVertical } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props}
  />
)

const ResizablePanel = ResizablePrimitive.Panel

const ResizableHandle = ({
  withHandle,
  className,
  children,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      "group relative flex w-6 items-center justify-center bg-border/50 hover:bg-border/80 border-x-2 border-border/30 hover:border-border/60 after:absolute after:inset-y-0 after:left-1/2 after:w-3 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[panel-group-direction=vertical]:h-6 data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:border-y-2 data-[panel-group-direction=vertical]:border-x-0 data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-3 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90 hover:bg-accent/50 transition-all duration-200 cursor-col-resize data-[panel-group-direction=vertical]:cursor-row-resize",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-20 flex h-8 w-5 items-center justify-center rounded-sm border bg-background/90 hover:bg-accent transition-all duration-200 cursor-col-resize data-[panel-group-direction=vertical]:cursor-row-resize shadow-sm hover:shadow-lg group-hover:scale-105">
        <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    )}
    {children}
  </ResizablePrimitive.PanelResizeHandle>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
