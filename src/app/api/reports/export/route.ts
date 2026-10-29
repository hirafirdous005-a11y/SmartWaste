import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
  try {
    const { reports } = await req.json();

    if (!Array.isArray(reports) || reports.length === 0) {
      return NextResponse.json({ error: 'No reports provided for export.' }, { status: 400 });
    }

    const headers = [
      'Complaint Number',
      'Status',
      'Priority',
      'AI Category',
      'Verified Category',
      'AI Confidence (%)',
      'Citizen Name',
      'Phone',
      'Address',
      'Latitude',
      'Longitude',
      'Assigned Worker',
      'Created Date',
      'Updated Date',
    ];

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = reports.map((r) => [
      escapeCsv(r.complaint_number),
      escapeCsv(r.status),
      escapeCsv(r.priority),
      escapeCsv(r.predicted_category),
      escapeCsv(r.verified_category || 'Pending Verification'),
      escapeCsv(r.ai_confidence),
      escapeCsv(r.citizen_name),
      escapeCsv(r.citizen_phone || 'N/A'),
      escapeCsv(r.address),
      escapeCsv(r.latitude),
      escapeCsv(r.longitude),
      escapeCsv(r.assigned_worker_name || 'Unassigned'),
      escapeCsv(r.created_at),
      escapeCsv(r.updated_at),
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="smart-waste-reports-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Export error' }, { status: 500 });
  }
}
