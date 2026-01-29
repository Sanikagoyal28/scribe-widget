import { useRef, useEffect, useCallback, ReactNode } from 'react';
import { CloseIcon, MinimizeIcon } from './Icons';

interface FloatingPanelProps {
  children: ReactNode;
  position?: { bottom?: number; right?: number; top?: number; left?: number };
  onClose: () => void;
  onMinimize: () => void;
}

export function FloatingPanel({ children, position, onClose, onMinimize }: FloatingPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0, right: 20, bottom: 20 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;

    isDraggingRef.current = true;
    const panel = panelRef.current;
    if (panel) {
      startPosRef.current = {
        x: e.clientX,
        y: e.clientY,
        right: parseInt(panel.style.right || '20'),
        bottom: parseInt(panel.style.bottom || '20'),
      };
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !panelRef.current) return;

      const deltaX = startPosRef.current.x - e.clientX;
      const deltaY = startPosRef.current.y - e.clientY;

      panelRef.current.style.right = `${startPosRef.current.right + deltaX}px`;
      panelRef.current.style.bottom = `${startPosRef.current.bottom + deltaY}px`;
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const panelStyle: React.CSSProperties = {
    bottom: position?.bottom ?? 20,
    right: position?.right ?? 20,
    ...(position?.top !== undefined && { top: position.top, bottom: 'auto' }),
    ...(position?.left !== undefined && { left: position.left, right: 'auto' }),
  };

  return (
    <div ref={panelRef} className="scribe-panel" style={panelStyle}>
      <div className="panel-header" onMouseDown={handleMouseDown}>
        <div className="drag-handle">
          <span /><span /><span />
          <span /><span /><span />
        </div>
        <div className="header-actions">
          <button className="header-btn" onClick={onMinimize} title="Minimize">
            <MinimizeIcon />
          </button>
          <button className="header-btn" onClick={onClose} title="Close">
            <CloseIcon />
          </button>
        </div>
      </div>
      <div className="panel-content">
        {children}
      </div>
    </div>
  );
}
