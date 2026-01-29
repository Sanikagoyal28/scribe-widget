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

    this.root.render(<App config={this.config} onClose={() => this.hide()} />);
  }

  public mount(target?: HTMLElement | string): void {
    const targetEl =
      typeof target === 'string' ? document.querySelector(target) : target || document.body;

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

// Global initialization function
let widgetInstance: ScribeWidget | null = null;

function init(config: ScribeWidgetConfig = {} as ScribeWidgetConfig): ScribeWidget {
  if (widgetInstance) {
    widgetInstance.unmount();
  }

  console.log(config, 'config - WIDGET');
  widgetInstance = new ScribeWidget(config);
  widgetInstance.mount();
  return widgetInstance;
}

function getInstance(): ScribeWidget | null {
  return widgetInstance;
}

// Named exports - these become window.EkaScribe.init, window.EkaScribe.getInstance, etc. in UMD
export { ScribeWidget, init, getInstance };

// Default export for ES module convenience
const EkaScribe = {
  init,
  getInstance,
  Widget: ScribeWidget,
};

export default EkaScribe;

// Auto-initialize when script loads in browser
// Widget will show config form since no apiKey/baseUrl provided
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const autoInit = () => {
    // Don't auto-init if already initialized or if data-no-auto-init attribute is present
    const scriptTag =
      document.currentScript || document.querySelector('script[src*="scribe-widget"]');
    if (scriptTag?.hasAttribute('data-no-auto-init')) {
      return;
    }

    console.log(widgetInstance, 'widget instance');
    if (!widgetInstance) {
      init({});
    }
  };

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded - WIDGET', autoInit);
  } else {
    // DOM already loaded, init immediately

    console.log('load document - WIDGET');
    autoInit();
  }
}
