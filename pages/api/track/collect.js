import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import Target from '../../../models/Target';
import UAParser from 'ua-parser-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { userId, ...data } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const user = await User.findOne({ userId });
    
    if (!user || !user.isActive) {
      return res.status(403).json({ error: 'Invalid or inactive user' });
    }

    if (user.limit !== -1 && user.usedCount >= user.limit) {
      return res.status(429).json({ error: 'Limit exceeded' });
    }

    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0].trim() : 
               req.socket?.remoteAddress || 'Unknown';

    const ua = req.headers['user-agent'] || 'Unknown';
    const parser = new UAParser(ua);
    const uaResult = parser.getResult();

    const locationData = await getLocationFromIP(ip);

    const target = new Target({
      userId,
      ip,
      userAgent: ua,
      browser: uaResult.browser?.name || 'Unknown',
      os: uaResult.os?.name || 'Unknown',
      device: uaResult.device?.type || 'desktop',
      referrer: req.headers['referer'] || 'Direct',
      location: locationData,
      screenResolution: data.screenResolution || 'Unknown',
      language: req.headers['accept-language'] || 'Unknown',
      platform: uaResult.os?.name || 'Unknown',
      cookies: data.cookies || {}
    });

    await target.save();

    await User.updateOne(
      { userId },
      { 
        $inc: { usedCount: 1 },
        lastUsed: new Date()
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Data collected',
      remaining: user.limit === -1 ? 'unlimited' : user.limit - (user.usedCount + 1)
    });

  } catch (error) {
    console.error('Track error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getLocationFromIP(ip) {
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=country,regionName,city,isp,timezone`);
    const data = await response.json();
    return {
      country: data.country || 'Unknown',
      region: data.regionName || 'Unknown',
      city: data.city || 'Unknown',
      isp: data.isp || 'Unknown',
      timezone: data.timezone || 'Unknown'
    };
  } catch {
    return {
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      isp: 'Unknown',
      timezone: 'Unknown'
    };
  }
}
