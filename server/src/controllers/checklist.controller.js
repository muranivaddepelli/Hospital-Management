const { checklistService } = require('../services');

class ChecklistController {
  async getChecklistByDate(req, res, next) {
    try {
      const { date, areaId } = req.query;
      const checklist = await checklistService.getChecklistByDate(date, areaId);
      res.json({
        success: true,
        data: { checklist }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateEntry(req, res, next) {
    try {
      const { taskId } = req.params;
      const { date, ...updateData } = req.body;
      const entry = await checklistService.updateChecklistEntry(
        taskId,
        date,
        updateData,
        req.user._id
      );
      res.json({
        success: true,
        message: 'Entry updated successfully',
        data: { entry }
      });
    } catch (error) {
      next(error);
    }
  }

  async saveChecklist(req, res, next) {
    try {
      const { date, entries } = req.body;
      const result = await checklistService.saveChecklist(
        entries,
        date,
        req.user._id
      );
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async exportCSV(req, res, next) {
    try {
      const { date, areaId } = req.query;
      const result = await checklistService.exportToCSV(date, areaId);
      
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.data);
    } catch (error) {
      next(error);
    }
  }

  async exportPDF(req, res, next) {
    try {
      const { date, areaId } = req.query;
      const result = await checklistService.exportToPDF(date, areaId);
      
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.data);
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const { date } = req.query;
      const statistics = await checklistService.getStatistics(date);
      res.json({
        success: true,
        data: { statistics }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChecklistController();

