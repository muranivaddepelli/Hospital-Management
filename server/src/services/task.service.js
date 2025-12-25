const { taskRepository, areaRepository } = require('../repositories');
const { AppError } = require('../middlewares/errorHandler');

class TaskService {
  async getAll(params = {}) {
    return await taskRepository.findAll(params);
  }

  async getById(id) {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    return task;
  }

  async create(data, userId) {
    // Verify area exists
    const area = await areaRepository.findById(data.area);
    if (!area) {
      throw new AppError('Area not found', 404);
    }

    // Generate task ID if not provided
    if (!data.taskId) {
      const count = await taskRepository.countByArea(data.area);
      data.taskId = `${area.code}${count + 1}`;
    } else {
      // Check for duplicate taskId
      const existing = await taskRepository.findByTaskId(data.taskId);
      if (existing) {
        throw new AppError('Task ID already exists', 400);
      }
    }

    return await taskRepository.create({
      ...data,
      createdBy: userId
    });
  }

  async update(id, data) {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // If taskId is being changed, check for duplicates
    if (data.taskId && data.taskId !== task.taskId) {
      const existing = await taskRepository.findByTaskId(data.taskId);
      if (existing) {
        throw new AppError('Task ID already exists', 400);
      }
    }

    // If area is being changed, verify it exists
    if (data.area && data.area !== task.area.toString()) {
      const area = await areaRepository.findById(data.area);
      if (!area) {
        throw new AppError('Area not found', 404);
      }
    }

    return await taskRepository.update(id, data);
  }

  async delete(id) {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    return await taskRepository.delete(id);
  }

  async toggleStatus(id) {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    return await taskRepository.update(id, { isActive: !task.isActive });
  }
}

module.exports = new TaskService();
