import dbConnect from '../../../lib/mongodb';
import Target from '../../../models/Target';
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

    const { userId, page = 1, limit = 50 } = req.query;
    const query = userId ? { userId } : {};

    const targets = await Target.find(query)
      .sort({ timestamp: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Target.countDocuments(query);

    return res.status(200).json({
      success: true,
      targets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get targets error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
