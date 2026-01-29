/// <reference types="vite/client" />

declare namespace chrome {
  namespace storage {
    namespace local {
      function get(keys: string | string[] | null, callback: (items: { [key: string]: any }) => void): void;
      function set(items: { [key: string]: any }, callback?: () => void): void;
    }
  }
  namespace sidePanel {
    function open(options: { tabId?: number }): Promise<void>;
    function setPanelBehavior(options: { openPanelOnActionClick: boolean }): Promise<void>;
  }
  namespace action {
    const onClicked: {
      addListener(callback: (tab: { id?: number }) => void): void;
    };
  }
}
