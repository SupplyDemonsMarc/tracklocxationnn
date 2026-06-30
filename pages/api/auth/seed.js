import dbConnect from '../../../lib/mongodb';
import Admin from '../../../models/Admin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const existingAdmin = await Admin.findOne({ username: process.env.ADMIN_USERNAME || 'admin_master' });

    if (existingAdmin) {
      return res.status(200).json({ 
        message: 'Admin already exists',
        username: existingAdmin.username
      });
    }

    const admin = new Admin({
      username: process.env.ADMIN_USERNAME || 'admin_master',
      password: process.env.ADMIN_PASSWORD || 'rahasia123',
      role: 'superadmin'
    });

    await admin.save();

    return res.status(201).json({
      message: 'Admin created successfully',
      username: admin.username,
      password: process.env.ADMIN_PASSWORD || 'rahasia123'
    });

  } catch (error) {
    console.error('Seed error:', error);
    return res.status(500).json({ error: 'Seed failed', details: error.message });
  }
}
