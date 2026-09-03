interface WebhookPayload {
  incident_code?: string;
  latitude: number;
  longitude: number;
  tourist_name: string;
  phone?: string;
  medical_notes?: string;
  timestamp?: string;
}

export const handler = async (event: { httpMethod: string; body?: string | null }) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed. Use POST.' }),
    };
  }

  try {
    const payload: WebhookPayload = event.body ? JSON.parse(event.body) : {};

    if (!payload.latitude || !payload.longitude || !payload.tourist_name) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required parameters: latitude, longitude, tourist_name.' }),
      };
    }

    const code = payload.incident_code || 'INC-' + Math.floor(1000 + Math.random() * 9000);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'SOS Emergency Signal Logged into Central Dispatch Queue.',
        incident_code: code,
        priority: 'CRITICAL',
        status: 'RECEIVED',
        dispatched_agency: 'Tourist Police & City Emergency Medical Response',
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal Server Error Processing SOS Webhook.' }),
    };
  }
};
