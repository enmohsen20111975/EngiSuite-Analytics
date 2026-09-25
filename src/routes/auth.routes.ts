/**
 * Authentication Routes
 * auth router
 */

import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../services/database.service.js';
import { AppError, ValidationError, UnauthorizedError, ConflictError, NotFoundError } from '../middleware/error.middleware.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  UserResponse,
  GoogleOAuthRequest,
  TelegramOAuthRequest 
} from '../types/index.js';

const router = Router();

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

/**
 * Generate JWT tokens
 */
function generateTokens(userId: number): { token: string; refreshToken: string } {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  const refreshToken = jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, { 
    expiresIn: '30d' 
  });
  return { token, refreshToken };
}

// Keep auth queries compatible with legacy users table during migration.
const authUserSelect = {
  id: true,
  email: true,
  name: true,
  passwordHash: true,
  googleId: true,
  tier: true,
  subscriptionStatus: true,
  isVerified: true,
  isActive: true,
  createdAt: true,
} as const;

/**
 * Format user response
 */
function formatUserResponse(user: {
  id: number;
  email: string;
  name?: string | null;
  phone?: string | null;
  company?: string | null;
  country?: string | null;
  tier?: string | null;
  subscriptionStatus?: string | null;
  isVerified?: boolean | null;
  isAdmin?: boolean | null;
  createdAt?: Date;
}): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    phone: user.phone ?? null,
    company: user.company ?? null,
    country: user.country ?? null,
    tier: user.tier ?? 'free',
    subscriptionStatus: user.subscriptionStatus ?? 'active',
    isVerified: user.isVerified ?? false,
    isAdmin: user.isAdmin ?? false,
    createdAt: user.createdAt ?? new Date(),
  };
}

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', authRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, phone, company, country }: RegisterRequest = req.body;

    // Validation
    if (!email || !password || !name) {
      throw new ValidationError('Email, password, and name are required');
    }

    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictError('A user with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        tier: 'free',
        subscriptionStatus: 'active',
        isVerified: false,
      },
      select: authUserSelect,
    });

    // Generate tokens
    const { token, refreshToken } = generateTokens(user.id);

    // Log subscription history
    await prisma.subscriptionHistory.create({
      data: {
        userId: user.id,
        tier: 'free',
        action: 'subscribed',
      },
    });

    const response: AuthResponse = {
      user: formatUserResponse(user),
      token,
      refreshToken,
    };

    res.status(201).json({
      success: true,
      data: response,
      message: 'Registration successful',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', authRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validation
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: authUserSelect,
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError('Your account has been deactivated');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const { token, refreshToken } = generateTokens(user.id);

    const response: AuthResponse = {
      user: formatUserResponse(user),
      token,
      refreshToken,
    };

    res.json({
      success: true,
      data: response,
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/google
 * Google OAuth authentication
 */
router.post('/google', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idToken }: GoogleOAuthRequest = req.body;

    if (!idToken) {
      throw new ValidationError('Google ID token is required');
    }

    // Verify Google token (simplified - in production use google-auth-library)
    // For now, we'll decode the JWT and trust it
    const decoded = jwt.decode(idToken) as { email?: string; name?: string; sub?: string };
    
    if (!decoded?.email) {
      throw new UnauthorizedError('Invalid Google token');
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: decoded.email.toLowerCase() },
      select: authUserSelect,
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: decoded.email.toLowerCase(),
          name: decoded.name || decoded.email.split('@')[0],
          googleId: decoded.sub,
          tier: 'free',
          subscriptionStatus: 'active',
          isVerified: true, // Google verified the email
        },
        select: authUserSelect,
      });
    } else if (!user.googleId) {
      // Link Google account
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: decoded.sub, isVerified: true },
        select: authUserSelect,
      });
    }

    const { token, refreshToken } = generateTokens(user.id);

    const response: AuthResponse = {
      user: formatUserResponse(user),
      token,
      refreshToken,
    };

    res.json({
      success: true,
      data: response,
      message: 'Google authentication successful',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/telegram
 * Telegram OAuth authentication
 */
router.post('/telegram', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const telegramData: TelegramOAuthRequest = req.body;

    if (!telegramData.id || !telegramData.hash) {
      throw new ValidationError('Telegram authentication data is required');
    }

    // In production, verify the hash using bot token
    // For now, we trust the data

    const telegramId = telegramData.id.toString();
    const email = `telegram_${telegramId}@engisuite.temp`;

    // Find or create user
    let user = await prisma.user.findFirst({
      where: { telegramId },
      select: authUserSelect,
    });

    if (!user) {
      const name = [telegramData.first_name, telegramData.last_name]
        .filter(Boolean)
        .join(' ') || `Telegram User ${telegramId}`;

      user = await prisma.user.create({
        data: {
          email,
          name,
          telegramId,
          tier: 'free',
          subscriptionStatus: 'active',
          isVerified: true,
        },
        select: authUserSelect,
      });
    }

    const { token, refreshToken } = generateTokens(user.id);

    const response: AuthResponse = {
      user: formatUserResponse(user),
      token,
      refreshToken,
    };

    res.json({
      success: true,
      data: response,
      message: 'Telegram authentication successful',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: number; type: string };

    if (decoded.type !== 'refresh') {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive');
    }

    // Generate new tokens
    const tokens = generateTokens(user.id);

    res.json({
      success: true,
      data: tokens,
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client should discard tokens)
 */
router.post('/logout', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', authRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ValidationError('Email is required');
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      res.json({
        success: true,
        message: 'If an account with this email exists, a reset link has been sent',
      });
      return;
    }

    // Create reset token
    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt,
      },
    });

    // TODO: Send email with reset link
    // For now, return the token (in production, send via email)
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({
      success: true,
      message: 'If an account with this email exists, a reset link has been sent',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', authRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      throw new ValidationError('Token and new password are required');
    }

    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    // Find reset token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!resetToken) {
      throw new NotFoundError('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: authUserSelect,
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({
      success: true,
      data: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
