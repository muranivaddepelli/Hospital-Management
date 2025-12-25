const { checklistRepository } = require('../repositories');
const { AppError } = require('../middlewares/errorHandler');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

class ChecklistService {
  async getChecklistByDate(date, areaId = null) {
    const checklistDate = new Date(date);
    if (isNaN(checklistDate.getTime())) {
      throw new AppError('Invalid date format', 400);
    }

    return await checklistRepository.findByDate(checklistDate, areaId);
  }

  async updateChecklistEntry(taskId, date, updateData, userId) {
    const checklistDate = new Date(date);
    if (isNaN(checklistDate.getTime())) {
      throw new AppError('Invalid date format', 400);
    }

    const entryData = {
      ...updateData,
      completedBy: userId
    };

    if (updateData.status === true) {
      entryData.completedAt = new Date();
    } else if (updateData.status === false) {
      entryData.completedAt = null;
    }

    return await checklistRepository.upsert(taskId, checklistDate, entryData);
  }

  async saveChecklist(entries, date, userId) {
    const checklistDate = new Date(date);
    if (isNaN(checklistDate.getTime())) {
      throw new AppError('Invalid date format', 400);
    }

    const entriesToSave = entries.map(entry => ({
      taskId: entry.taskId,
      date: checklistDate,
      status: entry.status,
      staffName: entry.staffName,
      completedBy: userId
    }));

    await checklistRepository.bulkUpsert(entriesToSave);
    return { message: 'Checklist saved successfully' };
  }

  async exportToCSV(date, areaId = null) {
    const checklistDate = new Date(date);
    if (isNaN(checklistDate.getTime())) {
      throw new AppError('Invalid date format', 400);
    }

    const data = await checklistRepository.getEntriesForExport(checklistDate, areaId);
    
    if (data.length === 0) {
      throw new AppError('No data available for export', 404);
    }

    const fields = [
      { label: 'Task ID', value: 'taskId' },
      { label: 'Area', value: 'area' },
      { label: 'Task Name', value: 'taskName' },
      { label: 'Description', value: 'description' },
      { label: 'Status', value: 'status' },
      { label: 'Staff Name', value: 'staffName' },
      { label: 'Timestamp', value: 'timestamp' }
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    return {
      data: csv,
      filename: `checklist_${checklistDate.toISOString().split('T')[0]}.csv`,
      contentType: 'text/csv'
    };
  }

  async exportToPDF(date, areaId = null) {
    const checklistDate = new Date(date);
    if (isNaN(checklistDate.getTime())) {
      throw new AppError('Invalid date format', 400);
    }

    const data = await checklistRepository.getEntriesForExport(checklistDate, areaId);
    
    if (data.length === 0) {
      throw new AppError('No data available for export', 404);
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve({
          data: pdfBuffer,
          filename: `checklist_${checklistDate.toISOString().split('T')[0]}.pdf`,
          contentType: 'application/pdf'
        });
      });
      doc.on('error', reject);

      // Header
      doc.fontSize(20).font('Helvetica-Bold')
        .text('Sugar & Heart Clinic', { align: 'center' });
      doc.fontSize(16).font('Helvetica')
        .text('Daily Checklist Report', { align: 'center' });
      doc.fontSize(12)
        .text(`Date: ${checklistDate.toLocaleDateString('en-US', { 
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        })}`, { align: 'center' });
      
      doc.moveDown(2);

      // Table header
      const tableTop = doc.y;
      const colWidths = [60, 100, 100, 200, 50, 100, 120];
      const headers = ['Task ID', 'Area', 'Task Name', 'Description', 'Status', 'Staff Name', 'Timestamp'];
      
      doc.font('Helvetica-Bold').fontSize(9);
      let xPos = 30;
      headers.forEach((header, i) => {
        doc.text(header, xPos, tableTop, { width: colWidths[i], align: 'left' });
        xPos += colWidths[i];
      });

      // Draw header line
      doc.moveTo(30, tableTop + 15).lineTo(760, tableTop + 15).stroke();

      // Table rows
      doc.font('Helvetica').fontSize(8);
      let yPos = tableTop + 25;
      
      data.forEach((row, index) => {
        if (yPos > 520) {
          doc.addPage();
          yPos = 30;
        }

        xPos = 30;
        const values = [
          row.taskId,
          row.area.substring(0, 15),
          row.taskName.substring(0, 15),
          row.description.substring(0, 35),
          row.status,
          row.staffName.substring(0, 15),
          row.timestamp
        ];

        values.forEach((value, i) => {
          doc.text(value || '', xPos, yPos, { width: colWidths[i], align: 'left' });
          xPos += colWidths[i];
        });

        yPos += 18;
      });

      // Footer
      doc.fontSize(8).text(
        `Generated on ${new Date().toLocaleString()}`,
        30, 550,
        { align: 'center', width: 730 }
      );

      doc.end();
    });
  }

  async getStatistics(date) {
    const checklistDate = new Date(date);
    if (isNaN(checklistDate.getTime())) {
      throw new AppError('Invalid date format', 400);
    }

    const data = await checklistRepository.findByDate(checklistDate);
    
    const total = data.length;
    const completed = data.filter(item => item.entry?.status === true).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      completionRate
    };
  }
}

module.exports = new ChecklistService();

