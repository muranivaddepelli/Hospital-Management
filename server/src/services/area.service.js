const { areaRepository } = require('../repositories');
const { AppError } = require('../middlewares/errorHandler');

class AreaService {
  async getAll(params = {}) {
    return await areaRepository.findAll(params);
  }

  async getActive() {
    return await areaRepository.findActive();
  }

  async getById(id) {
    const area = await areaRepository.findById(id);
    if (!area) {
      throw new AppError('Area not found', 404);
    }
    return area;
  }

  async create(data, userId) {
    // Check for duplicate code
    const existing = await areaRepository.findByCode(data.code);
    if (existing) {
      throw new AppError('Area with this code already exists', 400);
    }

    return await areaRepository.create({
      ...data,
      createdBy: userId
    });
  }

  async update(id, data) {
    const area = await areaRepository.findById(id);
    if (!area) {
      throw new AppError('Area not found', 404);
    }

    // Check for duplicate code if code is being changed
    if (data.code && data.code !== area.code) {
      const existing = await areaRepository.findByCode(data.code);
      if (existing) {
        throw new AppError('Area with this code already exists', 400);
      }
    }

    return await areaRepository.update(id, data);
  }

  async delete(id) {
    const area = await areaRepository.findById(id);
    if (!area) {
      throw new AppError('Area not found', 404);
    }

    return await areaRepository.delete(id);
  }

  async toggleStatus(id) {
    const area = await areaRepository.findById(id);
    if (!area) {
      throw new AppError('Area not found', 404);
    }

    return await areaRepository.update(id, { isActive: !area.isActive });
  }
}

module.exports = new AreaService();
