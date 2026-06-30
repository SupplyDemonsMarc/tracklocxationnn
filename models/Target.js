import mongoose from 'mongoose';

const TargetSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  ip: {
    type: String,
    default: 'Unknown'
  },
  userAgent: {
    type: String,
    default: 'Unknown'
  },
  browser: String,
  os: String,
  device: String,
  referrer: {
    type: String,
    default: 'Direct'
  },
  location: {
    country: String,
    region: String,
    city: String,
    isp: String,
    timezone: String
  },
  cookies: {
    type: Object,
    default: {}
  },
  screenResolution: String,
  language: String,
  platform: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  isNewVisit: {
    type: Boolean,
    default: true
  },
  visitCount: {
    type: Number,
    default: 1
  }
});

TargetSchema.index({ userId: 1, timestamp: -1 });
TargetSchema.index({ ip: 1 });

export default mongoose.models.Target || mongoose.model('Target', TargetSchema);
