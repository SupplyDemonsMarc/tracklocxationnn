import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import { verifyToken, getTokenFromRequest } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = getTokenFromRequest(req);
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.type !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await dbConnect();

    const users = await User.find({})
      .select('-password -__v')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      users: users.map(u => ({
        userId: u.userId,
        username: u.username,
        limit: u.limit,
        usedCount: u.usedCount,
        isActive: u.isActive,
        createdBy: u.createdBy,
        createdAt: u.createdAt,
        lastUsed: u.lastUsed
      }))
    });

  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
