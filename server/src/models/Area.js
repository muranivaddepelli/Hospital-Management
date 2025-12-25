const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Area name is required'],
    trim: true,
    maxlength: [100, 'Area name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Area code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [10, 'Area code cannot exceed 10 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
areaSchema.index({ code: 1 });
areaSchema.index({ name: 1 });
areaSchema.index({ isActive: 1 });

module.exports = mongoose.model('Area', areaSchema);

