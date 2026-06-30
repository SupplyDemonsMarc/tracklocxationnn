import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import { verifyToken, getTokenFromRequest } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = getTokenFromRequest(req);
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.type !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await dbConnect();
    const { username, password, limit } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const userLimit = limit !== undefined ? parseInt(limit) : 0;

    const user = new User({
      username,
      password,
      limit: userLimit,
      usedCount: 0,
      isActive: true,
      createdBy: decoded.username
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: 'User created',
      user: {
        userId: user.userId,
        username: user.username,
        limit: user.limit,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Add user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
