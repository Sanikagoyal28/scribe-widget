import { createRoot, Root } from 'react-dom/client';
import { App } from './App';
import { ScribeWidgetConfig } from './types';
import widgetStyles from './styles/widget.css?inline';

export type { ScribeWidgetConfig, WidgetState } from './types';

class ScribeWidget {
  private container: HTMLDivElement;
  private shadowRoot: ShadowRoot;
  private root: Root | null = null;
  private config: ScribeWidgetConfig;
  private visible: boolean = true;

  constructor(config: ScribeWidgetConfig) {
    this.config = {
      templates: ['soap'],
      languageHint: ['en'],
      position: { bottom: 20, right: 20 },
      ...config,
    };

    // Create container element
    this.container = document.createElement('div');
    this.container.id = 'eka-scribe-widget';

    // Attach shadow DOM
    this.shadowRoot = this.container.attachShadow({ mode: 'closed' });

    // Inject styles
    const styleEl = document.createElement('style');
    styleEl.textContent = widgetStyles;
    this.shadowRoot.appendChild(styleEl);

    // Create React mount point
    const mountPoint = document.createElement('div');
    mountPoint.id = 'eka-scribe-root';
    this.shadowRoot.appendChild(mountPoint);

    // Create React root
    this.root = createRoot(mountPoint);
  }

  private render(): void {
    if (!this.root || !this.visible) return;

    this.root.render(
      <App
        config={this.config}
        onClose={() => this.hide()}
      />
    );
  }

  public mount(target?: HTMLElement | string): void {
    const targetEl = typeof target === 'string'
      ? document.querySelector(target)
      : target || document.body;

    if (targetEl) {
      targetEl.appendChild(this.container);
      this.render();
    }
  }

  public unmount(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    this.container.remove();
  }

  public show(): void {
    this.visible = true;
    this.container.style.display = 'block';
    this.render();
  }

  public hide(): void {
    this.visible = false;
    this.container.style.display = 'none';
  }

  public isVisible(): boolean {
    return this.visible;
  }
}

// Global initialization function for script tag usage
let widgetInstance: ScribeWidget | null = null;

function initEkaScribe(config: ScribeWidgetConfig): ScribeWidget {
  if (widgetInstance) {
    widgetInstance.unmount();
  }
  widgetInstance = new ScribeWidget(config);
  widgetInstance.mount();
  return widgetInstance;
}

function getEkaScribe(): ScribeWidget | null {
  return widgetInstance;
}

// Expose to window for script tag usage
if (typeof window !== 'undefined') {
  (window as Window & { EkaScribe?: unknown }).EkaScribe = {
    init: initEkaScribe,
    getInstance: getEkaScribe,
    Widget: ScribeWidget,
  };
}

// Named exports for ES module usage
export { ScribeWidget, initEkaScribe as init, getEkaScribe as getInstance };

// Default export for module usage
export default {
  init: initEkaScribe,
  getInstance: getEkaScribe,
  Widget: ScribeWidget,
};
