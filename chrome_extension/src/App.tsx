import { useState, useMemo, useCallback, useEffect } from 'react';
import { ConfigState } from './components/ConfigState';
import { IdleState } from './components/IdleState';
import { PermissionState } from './components/PermissionState';
import { RecordingState } from './components/RecordingState';
import { ProcessingState } from './components/ProcessingState';
import { ResultsState } from './components/ResultsState';
import { ErrorState } from './components/ErrorState';
import { PollingErrorState } from './components/PollingErrorState';
import { useScribeSession } from './hooks/useScribeSession';
import { ScribeConfig } from './types';
import { SettingsIcon } from './components/Icons';

export function App() {
  const [credentials, setCredentials] = useState<{ accessToken?: string; baseUrl: string } | null>(
    null
  );

  const config = useMemo<ScribeConfig>(() => {
    if (!credentials) {
      return { baseUrl: '' };
    }
    return {
      accessToken: credentials.accessToken,
      baseUrl: credentials.baseUrl,
      debug: true,
    };
  }, [credentials]);

  const needsConfig = !credentials;

  const {
    state,
    elapsedTime,
    result,
    errorMessage,
    initializeSDK,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    retryPolling,
    reset,
  } = useScribeSession(config);

  // Initialize SDK when credentials are set
  useEffect(() => {
    if (credentials?.baseUrl) {
      initializeSDK();
    }
  }, [credentials, initializeSDK]);

  // Start new recording - goes back to config screen
  const handleStartNewRecording = useCallback(() => {
    reset();
    setCredentials(null);
  }, [reset]);

  // Handle EMR selection
  const handleSelectEMR = useCallback((emrId: string) => {
    console.log('Selected EMR:', emrId);

    /**
     * TODO: if emrId is eka_emr
     * pass a message to background with the data
     *
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'ekascribe-data',
        value: JSON.stringify(originalStructuredSummary),
      });

    }

   originialStructuredSummary for now hard_code it as
   {
    "resourceType": "Bundle",
    "id": "32fd443c-66cf-477f-afc1-c0201bdd39b3",
    "type": "collection",
    "timestamp": "2026-01-19T16:43:56.661306Z",
    "entry": [
      {
        "fullUrl": "urn:uuid:453b137b-c574-4b70-ad06-d23e4b62ca1f",
        "resource": {
          "resourceType": "Patient",
          "id": "453b137b-c574-4b70-ad06-d23e4b62ca1f",
          "identifier": [
            {
              "type": {
                "coding": [
                  {
                    "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                    "code": "MR",
                    "display": "MR"
                  }
                ]
              },
              "value": "172951776740127"
            }
          ],
          "name": [
            {
              "text": "Durgesh Mukunda Mehar",
              "family": "Mehar",
              "given": [
                "Durgesh",
                "Mukunda"
              ]
            }
          ],
          "telecom": [
            {
              "system": "phone",
              "value": "+919359230721",
              "use": "mobile"
            }
          ],
          "gender": "male",
          "birthDate": "2004-10-21"
        }
      },
      {
        "fullUrl": "urn:uuid:bdf85b61-e095-4257-b22d-d2a8aeb11d71",
        "resource": {
          "resourceType": "Encounter",
          "id": "bdf85b61-e095-4257-b22d-d2a8aeb11d71",
          "status": "finished",
          "class": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                  "code": "AMB",
                  "display": "ambulatory"
                }
              ]
            }
          ],
          "type": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/encounter-type",
                  "code": "consultation",
                  "display": "Consultation"
                }
              ],
              "text": "Consultation"
            }
          ],
          "subject": {
            "reference": "Patient/453b137b-c574-4b70-ad06-d23e4b62ca1f",
            "display": "Durgesh Mukunda Mehar"
          },
          "actualPeriod": {
            "start": "2025-01-22T06:57:59.479000Z"
          }
        }
      },
      {
        "fullUrl": "urn:uuid:ec50f799-8076-4ca1-aaef-5709c12c2f70",
        "resource": {
          "resourceType": "Observation",
          "id": "ec50f799-8076-4ca1-aaef-5709c12c2f70",
          "status": "final",
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                  "code": "symptom",
                  "display": "Symptom"
                }
              ],
              "text": "symptom"
            }
          ],
          "code": {
            "text": "Nausea"
          },
          "subject": {
            "reference": "Patient/453b137b-c574-4b70-ad06-d23e4b62ca1f",
            "display": "Durgesh Mukunda Mehar"
          },
          "encounter": {
            "reference": "Encounter/bdf85b61-e095-4257-b22d-d2a8aeb11d71"
          },
          "note": [
            {
              "text": "Since: 2 days ago. nausea cause itching"
            }
          ],
          "component": [
            {
              "code": {
                "coding": [
                  {
                    "system": "http://snomed.info/sct",
                    "code": "246112005",
                    "display": "Severity"
                  }
                ]
              },
              "valueCodeableConcept": {
                "coding": [
                  {
                    "system": "http://snomed.info/sct",
                    "code": "24484000",
                    "display": "Severe"
                  }
                ],
                "text": "Severe"
              }
            },
            {
              "code": {
                "coding": [
                  {
                    "system": "http://snomed.info/sct",
                    "code": "408729009",
                    "display": "Finding context"
                  }
                ]
              },
              "valueCodeableConcept": {
                "text": "Present"
              }
            }
          ]
        }
      },
      {
        "fullUrl": "urn:uuid:61f24465-197c-4c31-bfb7-fe2e3da16ff4",
        "resource": {
          "resourceType": "Observation",
          "id": "61f24465-197c-4c31-bfb7-fe2e3da16ff4",
          "status": "final",
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                  "code": "symptom",
                  "display": "Symptom"
                }
              ],
              "text": "symptom"
            }
          ],
          "code": {
            "text": "Sneeze"
          },
          "subject": {
            "reference": "Patient/453b137b-c574-4b70-ad06-d23e4b62ca1f",
            "display": "Durgesh Mukunda Mehar"
          },
          "encounter": {
            "reference": "Encounter/bdf85b61-e095-4257-b22d-d2a8aeb11d71"
          },
          "note": [
            {
              "text": "Since: 1 days ago. Frequently comes this"
            }
          ],
          "component": [
            {
              "code": {
                "coding": [
                  {
                    "system": "http://snomed.info/sct",
                    "code": "246112005",
                    "display": "Severity"
                  }
                ]
              },
              "valueCodeableConcept": {
                "coding": [
                  {
                    "system": "http://snomed.info/sct",
                    "code": "6736007",
                    "display": "Moderate"
                  }
                ],
                "text": "Moderate"
              }
            },
            {
              "code": {
                "coding": [
                  {
                    "system": "http://snomed.info/sct",
                    "code": "408729009",
                    "display": "Finding context"
                  }
                ]
              },
              "valueCodeableConcept": {
                "text": "Present"
              }
            }
          ]
        }
      },
      {
        "fullUrl": "urn:uuid:78400def-45a9-4c32-9a29-76eca795befd",
        "resource": {
          "resourceType": "Condition",
          "id": "78400def-45a9-4c32-9a29-76eca795befd",
          "clinicalStatus": {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                "code": "active",
                "display": "Active"
              }
            ]
          },
          "verificationStatus": {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                "code": "confirmed",
                "display": "Confirmed"
              }
            ]
          },
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/condition-category",
                  "code": "encounter-diagnosis",
                  "display": "Encounter Diagnosis"
                }
              ]
            }
          ],
          "severity": {
            "coding": [
              {
                "system": "http://snomed.info/sct",
                "code": "6736007",
                "display": "Moderate"
              }
            ],
            "text": "Moderate"
          },
          "code": {
            "text": "Viral illness"
          },
          "subject": {
            "reference": "Patient/453b137b-c574-4b70-ad06-d23e4b62ca1f",
            "display": "Durgesh Mukunda Mehar"
          },
          "encounter": {
            "reference": "Encounter/bdf85b61-e095-4257-b22d-d2a8aeb11d71"
          },
          "note": [
            {
              "text": "Since: 2 days"
            }
          ]
        }
      },
      {
        "fullUrl": "urn:uuid:7e1ce43e-686a-4dab-b3b3-d667e2e830f7",
        "resource": {
          "resourceType": "Condition",
          "id": "7e1ce43e-686a-4dab-b3b3-d667e2e830f7",
          "clinicalStatus": {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                "code": "active",
                "display": "Active"
              }
            ]
          },
          "verificationStatus": {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                "code": "confirmed",
                "display": "Confirmed"
              }
            ]
          },
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/condition-category",
                  "code": "encounter-diagnosis",
                  "display": "Encounter Diagnosis"
                }
              ]
            }
          ],
          "severity": {
            "coding": [
              {
                "system": "http://snomed.info/sct",
                "code": "6736007",
                "display": "Moderate"
              }
            ],
            "text": "Moderate"
          },
          "code": {
            "text": "Typhoid fever"
          },
          "subject": {
            "reference": "Patient/453b137b-c574-4b70-ad06-d23e4b62ca1f",
            "display": "Durgesh Mukunda Mehar"
          },
          "encounter": {
            "reference": "Encounter/bdf85b61-e095-4257-b22d-d2a8aeb11d71"
          },
          "note": [
            {
              "text": "Since: 1 hours"
            }
          ]
        }
      },
      {
        "fullUrl": "urn:uuid:72da1fe4-8858-427a-9ff1-5e2b364c9af0",
        "resource": {
          "resourceType": "Appointment",
          "id": "72da1fe4-8858-427a-9ff1-5e2b364c9af0",
          "status": "booked",
          "serviceType": [
            {
              "concept": {
                "text": "Follow-up"
              }
            }
          ],
          "start": "2025-01-27T18:30:00Z",
          "note": [
            {
              "text": "Come to check again"
            }
          ],
          "participant": [
            {
              "actor": {
                "reference": "Patient/453b137b-c574-4b70-ad06-d23e4b62ca1f",
                "display": "Durgesh Mukunda Mehar"
              },
              "status": "accepted"
            }
          ]
        }
      },
      {
        "fullUrl": "urn:uuid:52557bb1-dbc7-4f38-a3e4-5c5e1f65a200",
        "resource": {
          "resourceType": "CarePlan",
          "id": "52557bb1-dbc7-4f38-a3e4-5c5e1f65a200",
          "status": "active",
          "intent": "plan",
          "description": "Inform Lab results&nbsp;",
          "subject": {
            "reference": "Patient/453b137b-c574-4b70-ad06-d23e4b62ca1f",
            "display": "Durgesh Mukunda Mehar"
          },
          "encounter": {
            "reference": "Encounter/bdf85b61-e095-4257-b22d-d2a8aeb11d71"
          },
          "activity": [
            {
              "progress": [
                {
                  "text": "Inform Lab results&nbsp;"
                }
              ]
            }
          ]
        }
      },
      {
        "fullUrl": "urn:uuid:1becbfed-c9d5-407b-85e8-6cffa042b42a",
        "resource": {
          "resourceType": "CarePlan",
          "id": "1becbfed-c9d5-407b-85e8-6cffa042b42a",
          "status": "active",
          "intent": "plan",
          "description": "Montior Vitals and Inform SOS",
          "subject": {
            "reference": "Patient/453b137b-c574-4b70-ad06-d23e4b62ca1f",
            "display": "Durgesh Mukunda Mehar"
          },
          "encounter": {
            "reference": "Encounter/bdf85b61-e095-4257-b22d-d2a8aeb11d71"
          },
          "activity": [
            {
              "progress": [
                {
                  "text": "Montior Vitals and Inform SOS"
                }
              ]
            }
          ]
        }
      }
    ]
  }

     *  */

    // TODO: Handle EMR selection logic
  }, []);

  const handleConfigSubmit = (accessToken: string, baseUrl: string) => {
    setCredentials({ accessToken, baseUrl });
  };

  const handleSettings = () => {
    setCredentials(null);
    reset();
  };

  const renderContent = () => {
    if (needsConfig) {
      return <ConfigState onSubmit={handleConfigSubmit} />;
    }

    switch (state) {
      case 'idle':
        return <IdleState onStartRecording={startRecording} />;

      case 'permission':
        return <PermissionState onRequestPermission={startRecording} />;

      case 'recording':
      case 'paused':
        return (
          <RecordingState
            elapsedTime={elapsedTime}
            isPaused={state === 'paused'}
            onPause={pauseRecording}
            onResume={resumeRecording}
            onStop={stopRecording}
          />
        );

      case 'processing':
        return <ProcessingState />;

      case 'results':
        return result ? (
          <ResultsState
            result={result}
            onNewRecording={handleStartNewRecording}
            onSelectEMR={handleSelectEMR}
          />
        ) : null;

      case 'polling_error':
        return (
          <PollingErrorState
            message={errorMessage}
            onRetry={retryPolling}
            onStartNew={handleStartNewRecording}
          />
        );

      case 'error':
        return <ErrorState message={errorMessage} onRetry={handleStartNewRecording} />;

      default:
        return <IdleState onStartRecording={startRecording} />;
    }
  };

  return (
    <div className="side-panel">
      <header className="panel-header">
        <div className="header-brand">
          <span className="brand-text">eka.scribe</span>
        </div>
        {!needsConfig && (
          <button className="settings-btn" onClick={handleSettings} title="Settings">
            <SettingsIcon />
          </button>
        )}
      </header>
      <main className="panel-content">{renderContent()}</main>
    </div>
  );
}
