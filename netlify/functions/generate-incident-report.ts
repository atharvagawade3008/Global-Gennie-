interface IncidentReportRequest {
  incident_id: string;
  incident_code: string;
  reporter_name: string;
  category: string;
  status: string;
  address?: string;
  resolution_notes?: string;
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
    const data: IncidentReportRequest = event.body ? JSON.parse(event.body) : {};

    const reportDocument = {
      official_case_id: data.incident_code || 'CASE-7890',
      issuing_authority: 'National Tourist Safety & Rapid Response Command',
      generated_at: new Date().toISOString(),
      case_details: {
        category: data.category || 'General Incident',
        status: data.status || 'Resolved',
        reporter: data.reporter_name || 'Anonymous',
        location: data.address || 'GPS Coordinates',
        resolution_statement: data.resolution_notes || 'Case processed according to standard protocols.',
      },
      digital_signature: `AUTH-SIG-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportDocument),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to generate incident report.' }),
    };
  }
};
