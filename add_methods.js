const fs = require('fs');
const file = 'd:/app/src/app/api/od-applications/route.ts';
let content = fs.readFileSync(file, 'utf8');

const additionalMethods = `

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'student') {
      return NextResponse.json({ success: false, message: 'Unauthorized session' }, { status: 401 });
    }

    const rawBody = await request.json().catch(() => ({}));
    const { auditLogId, fromDate, toDate, applicationType, eventName, reason } = rawBody;

    if (!auditLogId || !fromDate || !toDate || !applicationType) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Verify ownership and status
    const targetAudit = await prisma.auditLog.findUnique({
      where: { id: auditLogId }
    });

    if (!targetAudit) {
      return NextResponse.json({ success: false, message: 'Application not found' }, { status: 404 });
    }

    if (!targetAudit.userName.includes(session.registerNumber.toUpperCase())) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    if (targetAudit.status !== 'pending_advisor_approval') {
      return NextResponse.json({ success: false, message: 'Application cannot be edited at this stage' }, { status: 400 });
    }

    const computedAcademicDays = calculateAcademicDays(fromDate, toDate);
    const days = computedAcademicDays > 0 ? computedAcademicDays : 1;
    const eventSummary = eventName || 'Academic Activity';

    // Keep proofs string roughly the same, extracting from old details
    const oldProofsMatch = targetAudit.details.match(/Proofs:\\s*([^|]+)/i);
    const attachedProofsList = oldProofsMatch ? oldProofsMatch[1].trim() : 'No digital attachments';

    const newDetails = \`OD Type: \${applicationType} | Duration: \${fromDate} to \${toDate} (\${days} days) | Event: \${eventSummary} | Proofs: \${attachedProofsList} | Reason: \${reason || 'N/A'}\`;

    await prisma.auditLog.update({
      where: { id: auditLogId },
      data: { details: newDetails }
    });

    // We could try to update Notifications but for simplicity, the GET endpoint relies on AuditLog primarily
    // To keep dashboards clean, we update matching notifications' message
    const regUpper = session.registerNumber.toUpperCase();
    const name = session.name || 'Student';
    await prisma.notification.updateMany({
      where: {
        createdByName: \`\${name} (\${regUpper})\`,
        title: { contains: regUpper },
        createdAt: { gte: new Date(targetAudit.createdAt.getTime() - 60000), lte: new Date(targetAudit.createdAt.getTime() + 60000) }
      },
      data: {
        message: \`Updated application from student \${name} (\${regUpper}). New Dates: \${fromDate} to \${toDate} (\${days} days). Event: \${eventSummary}.\`
      }
    });

    return NextResponse.json({ success: true, message: 'Application updated successfully' });

  } catch (error) {
    console.error('Error updating OD application:', error);
    return NextResponse.json({ success: false, message: 'Failed to update application' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const session = await getSession();

    if (!session || session.role !== 'student') {
      return NextResponse.json({ success: false, message: 'Unauthorized session' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing application ID' }, { status: 400 });
    }

    const targetAudit = await prisma.auditLog.findUnique({
      where: { id }
    });

    if (!targetAudit) {
      return NextResponse.json({ success: false, message: 'Application not found' }, { status: 404 });
    }

    if (!targetAudit.userName.includes(session.registerNumber.toUpperCase())) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    if (targetAudit.status !== 'pending_advisor_approval') {
      return NextResponse.json({ success: false, message: 'Application cannot be deleted at this stage' }, { status: 400 });
    }

    await prisma.auditLog.delete({
      where: { id }
    });

    // Delete corresponding notifications
    const regUpper = session.registerNumber.toUpperCase();
    const name = session.name || 'Student';
    await prisma.notification.deleteMany({
      where: {
        createdByName: \`\${name} (\${regUpper})\`,
        title: { contains: regUpper },
        createdAt: { gte: new Date(targetAudit.createdAt.getTime() - 60000), lte: new Date(targetAudit.createdAt.getTime() + 60000) }
      }
    });

    return NextResponse.json({ success: true, message: 'Application deleted successfully' });

  } catch (error) {
    console.error('Error deleting OD application:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete application' }, { status: 500 });
  }
}
`;

if (!content.includes('export async function PUT')) {
    fs.appendFileSync(file, additionalMethods);
    console.log('Appended PUT and DELETE methods successfully.');
} else {
    console.log('Methods already exist.');
}
