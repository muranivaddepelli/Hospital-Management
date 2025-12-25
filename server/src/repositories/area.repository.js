const { Area } = require('../models');

class AreaRepository {
  async create(data) {
    const area = new Area(data);
    return await area.save();
  }

  async findAll(params = {}) {
    const { search, page = 1, limit = 50 } = params;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const [areas, total] = await Promise.all([
      Area.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email'),
      Area.countDocuments(query)
    ]);

    return {
      areas,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findActive() {
    return await Area.find({ isActive: true }).sort({ name: 1 });
  }

  async findById(id) {
    return await Area.findById(id).populate('createdBy', 'name email');
  }

  async findByCode(code) {
    return await Area.findOne({ code: code.toUpperCase() });
  }

  async update(id, data) {
    return await Area.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
  }

  async delete(id) {
    return await Area.findByIdAndDelete(id);
  }
}

module.exports = new AreaRepository();
