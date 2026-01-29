EkaScribe.init(config)
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  src/index.tsx - initEkaScribe()                             │
│  1. Creates new ScribeWidget(config)                         │
│  2. Calls widget.mount() → appends to document.body          │
└──────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  src/index.tsx - ScribeWidget class constructor              │
│  1. Creates <div id="eka-scribe-widget">                     │
│  2. Attaches Shadow DOM (closed mode)                        │
│  3. Injects CSS into shadow root                             │
│  4. Creates React root inside shadow DOM                     │
│  5. Renders <App config={config} />                          │
└──────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  src/App.tsx                                                 │
│  1. Checks: does config have baseUrl?                        │
│     - YES → credentials = { apiKey, baseUrl }                │
│     - NO  → credentials = null → shows ConfigState           │
│  2. Calls useScribeSession(config) hook                      │
│  3. Renders <FloatingPanel> with content based on state      │
└──────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  src/hooks/useScribeSession.ts - useEffect                   │
│  1. Checks: config.baseUrl exists?                           │
│     - YES → Creates ScribeClient, calls client.init()        │
│     - NO  → Skips SDK initialization                         │
│  2. Returns state='idle' initially                           │
└──────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  User sees: FloatingPanel with IdleState                     │
│  ┌─────────────────────────────────────────┐                 │
│  │ [:::] eka.scribe    [Start Recording 🎤]│                 │
│  └─────────────────────────────────────────┘                 │
└──────────────────────────────────────────────────────────────┘
       │
       │ User clicks "Start Recording"
       ▼
┌──────────────────────────────────────────────────────────────┐
│  useScribeSession.ts - startRecording()                      │
│  1. checkMicrophonePermission()                              │
│     - 'denied' → showError()                                 │
│     - 'prompt' → setState('permission'), request access      │
│     - 'granted' → continue                                   │
│  2. client.startRecording({ templates, languageHint })       │
│  3. setState('recording')                                    │
│  4. startTimer()                                             │
└──────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  User sees: RecordingState                                   │
│  ┌─────────────────────────────────────────┐                 │
│  │ [💬] 00:15      [Pause] [■ Stop]        │                 │
│  └─────────────────────────────────────────┘                 │
└──────────────────────────────────────────────────────────────┘
       │
       │ User clicks Stop
       ▼
┌──────────────────────────────────────────────────────────────┐
│  useScribeSession.ts - stopRecording()                       │
│  1. stopTimer()                                              │
│  2. setState('processing')                                   │
│  3. await client.endRecording()                              │
│  4. await client.pollForCompletion() ← waits for transcript  │
│  5. setState('results')                                      │
│  6. config.onResult(result) ← YOUR CALLBACK IS CALLED HERE   │
└──────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  User sees: ResultsState                                     │
│  Your onResult callback receives the transcript data         │
└──────────────────────────────────────────────────────────────┘


## Key Files in the Flow
Step	File	Function
1	index.tsx:81-87	initEkaScribe() - entry point
2	index.tsx:18-45	ScribeWidget constructor - Shadow DOM setup
3	App.tsx:17-24	Credential check
4	useScribeSession.ts:34-57	SDK initialization
5	useScribeSession.ts:98-138	startRecording()
6	useScribeSession.ts:167-202	stopRecording() → calls your onResult