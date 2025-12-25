const { Task } = require('../models');

class TaskRepository {
  async create(data) {
    const task = new Task(data);
    return await task.save();
  }

  async findAll(params = {}) {
    const { search, areaId, page = 1, limit = 100 } = params;
    
    const query = {};
    if (search) {
      query.$or = [
        { taskId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (areaId) {
      query.area = areaId;
    }

    const skip = (page - 1) * limit;
    
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('area', 'name code')
        .sort({ area: 1, order: 1, taskId: 1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(query)
    ]);

    return {
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id) {
    return await Task.findById(id)
      .populate('area', 'name code')
      .populate('createdBy', 'name email');
  }

  async findByTaskId(taskId) {
    return await Task.findOne({ taskId });
  }

  async findByArea(areaId) {
    return await Task.find({ area: areaId, isActive: true })
      .sort({ order: 1, taskId: 1 });
  }

  async countByArea(areaId) {
    return await Task.countDocuments({ area: areaId });
  }

  async update(id, data) {
    return await Task.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('area', 'name code');
  }

  async delete(id) {
    return await Task.findByIdAndDelete(id);
  }
}

module.exports = new TaskRepository();
