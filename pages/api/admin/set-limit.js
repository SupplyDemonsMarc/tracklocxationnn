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
    const { userId, limit } = req.body;

    if (!userId || limit === undefined) {
      return res.status(400).json({ error: 'User ID and limit required' });
    }

    const user = await User.findOneAndUpdate(
      { userId },
      { 
        limit: parseInt(limit),
        usedCount: 0
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Limit updated',
      user: {
        userId: user.userId,
        username: user.username,
        limit: user.limit,
        usedCount: user.usedCount
      }
    });

  } catch (error) {
    console.error('Set limit error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
