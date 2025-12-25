const { ChecklistEntry, Task } = require('../models');

class ChecklistRepository {
  async create(entryData) {
    const entry = new ChecklistEntry(entryData);
    return await entry.save();
  }

  async findById(id) {
    return await ChecklistEntry.findById(id)
      .populate({
        path: 'task',
        populate: { path: 'area', select: 'name code' }
      })
      .populate('completedBy', 'name email');
  }

  async findByTaskAndDate(taskId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await ChecklistEntry.findOne({
      task: taskId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });
  }

  async findByDate(date, areaId = null) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all active tasks first
    let taskFilter = { isActive: true };
    if (areaId) {
      taskFilter.area = areaId;
    }

    const tasks = await Task.find(taskFilter)
      .populate('area', 'name code')
      .sort({ area: 1, order: 1, taskId: 1 });

    // Get existing entries for the date
    const entries = await ChecklistEntry.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('completedBy', 'name email');

    // Create a map of entries by task ID
    const entryMap = new Map();
    entries.forEach(entry => {
      entryMap.set(entry.task.toString(), entry);
    });

    // Merge tasks with their entries
    const result = tasks.map(task => {
      const entry = entryMap.get(task._id.toString());
      return {
        task: {
          _id: task._id,
          taskId: task.taskId,
          name: task.name,
          description: task.description,
          area: task.area
        },
        entry: entry ? {
          _id: entry._id,
          status: entry.status,
          staffName: entry.staffName,
          completedAt: entry.completedAt,
          completedBy: entry.completedBy,
          notes: entry.notes
        } : null
      };
    });

    return result;
  }

  async upsert(taskId, date, updateData) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    return await ChecklistEntry.findOneAndUpdate(
      { task: taskId, date: startOfDay },
      { 
        ...updateData, 
        task: taskId, 
        date: startOfDay,
        updatedAt: new Date()
      },
      { new: true, upsert: true, runValidators: true }
    ).populate({
      path: 'task',
      populate: { path: 'area', select: 'name code' }
    });
  }

  async bulkUpsert(entries) {
    const operations = entries.map(entry => {
      const startOfDay = new Date(entry.date);
      startOfDay.setHours(0, 0, 0, 0);

      return {
        updateOne: {
          filter: { task: entry.taskId, date: startOfDay },
          update: {
            $set: {
              status: entry.status,
              staffName: entry.staffName,
              completedAt: entry.status ? new Date() : null,
              completedBy: entry.completedBy,
              updatedAt: new Date()
            },
            $setOnInsert: {
              task: entry.taskId,
              date: startOfDay
            }
          },
          upsert: true
        }
      };
    });

    return await ChecklistEntry.bulkWrite(operations);
  }

  async getEntriesForExport(date, areaId = null) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    let taskFilter = { isActive: true };
    if (areaId) {
      taskFilter.area = areaId;
    }

    const tasks = await Task.find(taskFilter)
      .populate('area', 'name code')
      .sort({ area: 1, order: 1, taskId: 1 });

    const entries = await ChecklistEntry.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    const entryMap = new Map();
    entries.forEach(entry => {
      entryMap.set(entry.task.toString(), entry);
    });

    return tasks.map(task => {
      const entry = entryMap.get(task._id.toString());
      return {
        taskId: task.taskId,
        area: task.area.name,
        taskName: task.name,
        description: task.description,
        status: entry ? (entry.status ? 'Yes' : 'No') : 'No',
        staffName: entry?.staffName || '',
        timestamp: entry?.completedAt ? 
          new Date(entry.completedAt).toLocaleString('en-US') : ''
      };
    });
  }

  async delete(id) {
    return await ChecklistEntry.findByIdAndDelete(id);
  }
}

module.exports = new ChecklistRepository();

