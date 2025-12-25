const { User } = require('../models');

class UserRepository {
  async create(data) {
    const user = new User(data);
    return await user.save();
  }

  async findAll(params = {}) {
    const { search, role, page = 1, limit = 50 } = params;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      query.role = role;
    }

    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id) {
    return await User.findById(id).select('-password');
  }

  async findByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() });
  }

  async update(id, data) {
    // If password is provided, it will be hashed by the pre-save hook
    if (data.password) {
      const user = await User.findById(id);
      if (user) {
        user.password = data.password;
        delete data.password;
        Object.assign(user, data);
        return await user.save();
      }
    }
    
    return await User.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');
  }

  async delete(id) {
    return await User.findByIdAndDelete(id);
  }
}

module.exports = new UserRepository();
