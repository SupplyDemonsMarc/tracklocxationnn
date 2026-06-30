import dbConnect from '../../../lib/mongodb';
import Admin from '../../../models/Admin';
import User from '../../../models/User';
import { generateToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { username, password, type } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    if (type === 'admin') {
      const admin = await Admin.findOne({ username }).select('+password');

      if (!admin) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isMatch = await admin.comparePassword(password);

      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      await Admin.updateOne(
        { _id: admin._id },
        { lastLogin: new Date() }
      );

      const token = generateToken({
        id: admin._id,
        username: admin.username,
        role: admin.role,
        type: 'admin'
      });

      res.setHeader('Set-Cookie', `admin_token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`);

      return res.status(200).json({
        success: true,
        token,
        user: {
          username: admin.username,
          role: admin.role
        }
      });
    }

    if (type === 'user') {
      const user = await User.findOne({ username });

      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!user.isActive) {
        return res.status(403).json({ error: 'Account deactivated' });
      }

      const token = generateToken({
        id: user._id,
        userId: user.userId,
        username: user.username,
        role: 'user',
        type: 'user'
      });

      return res.status(200).json({
        success: true,
        token,
        user: {
          userId: user.userId,
          username: user.username,
          limit: user.limit,
          usedCount: user.usedCount
        }
      });
    }

    return res.status(400).json({ error: 'Invalid login type' });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
