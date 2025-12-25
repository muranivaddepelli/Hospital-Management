const { userRepository } = require('../repositories');
const { AppError } = require('../middlewares/errorHandler');

class UserService {
  async getAll(params = {}) {
    return await userRepository.findAll(params);
  }

  async getById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async create(data) {
    // Check for duplicate email
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError('User with this email already exists', 400);
    }

    return await userRepository.create(data);
  }

  async update(id, data) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check for duplicate email if email is being changed
    if (data.email && data.email !== user.email) {
      const existing = await userRepository.findByEmail(data.email);
      if (existing) {
        throw new AppError('User with this email already exists', 400);
      }
    }

    return await userRepository.update(id, data);
  }

  async delete(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return await userRepository.delete(id);
  }

  async toggleStatus(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return await userRepository.update(id, { isActive: !user.isActive });
  }
}

module.exports = new UserService();
