# Eka Scribe Widget

A floating panel widget for medical transcription using the eka.scribe SDK. This widget can be embedded into any website as a Shadow DOM component, providing complete style isolation.

## What is this?

Eka Scribe Widget is a **drop-in recording widget** that:

1. **Records audio** from the user's microphone
2. **Transcribes** the recording using the med-scribe-alliance SDK
3. **Returns structured data** (transcript, SOAP notes, etc.) via callbacks

The widget handles:
- Microphone permission requests
- Recording controls (start, pause, resume, stop)
- Timer display during recording
- Processing state with loading indicator
- Results display with transcript
- Error handling

## Features

- **Shadow DOM isolation** - Styles don't leak in or out
- **Draggable panel** - Users can reposition the widget
- **Built-in configuration UI** - If no API credentials are provided, the widget shows a form to enter them
- **Responsive states** - Idle, Recording, Paused, Processing, Results, Error
- **Callbacks** - Get notified when recording completes or errors occur

## Installation

### Option 1: Script Tag (Recommended for quick integration)

```html
<script src="https://your-cdn.com/scribe-widget.umd.js"></script>
<script>
  // With API credentials (widget starts in idle state)
  const widget = EkaScribe.init({
    apiKey: 'your-api-key',
    baseUrl: 'https://api.eka.care',
    onResult: (result) => {
      console.log('Transcript:', result.transcript);
    }
  });

  // Without API credentials (widget shows config form)
  const widget = EkaScribe.init({
    onResult: (result) => {
      console.log('Transcript:', result.transcript);
    }
  });
</script>
```

### Option 2: ES Module

```javascript
import EkaScribe from 'eka-scribe-widget';

const widget = EkaScribe.init({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.eka.care',
  templates: ['soap'],
  onResult: (result) => {
    console.log(result);
  }
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | string | - | API key for authentication (optional - can be entered in widget) |
| `baseUrl` | string | - | Base URL of the scribe API (optional - can be entered in widget) |
| `templates` | string[] | `['soap']` | Templates to use for transcription |
| `languageHint` | string[] | `['en']` | Language hints for transcription |
| `position` | object | `{ bottom: 20, right: 20 }` | Widget position on screen |
| `onResult` | function | - | Callback when transcription completes |
| `onError` | function | - | Callback when an error occurs |
| `debug` | boolean | `false` | Enable debug logging |

## Widget Methods

```javascript
const widget = EkaScribe.init(config);

// Show/hide the widget
widget.show();
widget.hide();

// Check visibility
widget.isVisible(); // returns boolean

// Remove widget from DOM
widget.unmount();

// Get the current widget instance
const instance = EkaScribe.getInstance();
```

## Widget States

1. **Config** - Shown when no API credentials provided. User enters apiKey and baseUrl.
2. **Idle** - Initial state with "Start Recording" button
3. **Permission** - Requesting microphone access
4. **Recording** - Active recording with timer, pause, and stop buttons
5. **Paused** - Recording paused, can resume or stop
6. **Processing** - Recording stopped, waiting for transcription
7. **Results** - Shows transcript with option to start new recording
8. **Error** - Shows error message with retry button

## Usage Examples

### Basic Integration (No Pre-configured Credentials)

```html
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
</head>
<body>
  <h1>My Healthcare App</h1>

  <!-- Widget appears as floating panel -->
  <script src="scribe-widget.umd.js"></script>
  <script>
    // Widget will show config form first
    EkaScribe.init({
      debug: true,
      onResult: (result) => {
        // Do something with the result
        document.getElementById('notes').value = result.transcript;
      }
    });
  </script>
</body>
</html>
```

### Pre-configured Integration

```html
<script src="scribe-widget.umd.js"></script>
<script>
  // Widget starts ready to record
  EkaScribe.init({
    apiKey: 'abc123',
    baseUrl: 'https://api.eka.care',
    templates: ['eka_emr_template'],
    languageHint: ['en-IN'],
    onResult: (result) => {
      console.log('Full result:', result);
    },
    onError: (error) => {
      console.error('Recording failed:', error);
    }
  });
</script>
```

### Custom Position

```javascript
EkaScribe.init({
  apiKey: 'your-key',
  baseUrl: 'https://api.eka.care',
  position: {
    top: 20,    // or bottom
    left: 20    // or right
  }
});
```

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck
```

## Build Output

- `dist/scribe-widget.umd.js` - UMD bundle for script tags
- `dist/scribe-widget.es.js` - ES module for bundlers

## Architecture

```
src/
├── index.tsx              # Entry point, Shadow DOM wrapper, global API
├── App.tsx                # Main component with state routing
├── types.ts               # TypeScript interfaces
├── components/
│   ├── FloatingPanel.tsx  # Draggable container with header
│   ├── ConfigState.tsx    # API credential form
│   ├── IdleState.tsx      # Start recording button
│   ├── RecordingState.tsx # Timer + controls
│   ├── ProcessingState.tsx# Loading spinner
│   ├── ResultsState.tsx   # Transcript display
│   ├── ErrorState.tsx     # Error display
│   └── Icons.tsx          # SVG icons
├── hooks/
│   └── useScribeSession.ts# SDK integration & state management
└── styles/
    └── widget.css         # All widget styles
```

## How It Works

1. **Injection**: When `EkaScribe.init()` is called, it creates a `<div>` and attaches a Shadow DOM to isolate styles.

2. **React Rendering**: The React app renders inside the Shadow DOM with all styles injected.

3. **SDK Integration**: The `useScribeSession` hook manages the med-scribe-alliance SDK:
   - Initializes the client
   - Handles recording start/pause/resume/stop
   - Polls for completion after recording ends
   - Returns transcription results

4. **Callbacks**: Results are passed back via the `onResult` callback, allowing the host page to use the data.

