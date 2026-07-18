import { z, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Validation error response interface
interface ValidationError {
  field: string;
  message: string;
}

// Helper function to format validation errors
const formatValidationErrors = (error: ZodError): ValidationError[] => {
  return error.issues.map((err) => ({
    field: err.path.join('.') || 'unknown',
    message: err.message,
  }));
};

// Base validation middleware that returns structured error responses
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate request body against schema
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = formatValidationErrors(error);
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors,
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error during validation',
          timestamp: new Date().toISOString(),
        });
      }
    }
  };
};

// Common validation schemas
export const commonSchemas = {
  // Email validation
  email: z.string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .max(254, 'Email is too long')
    .transform((email) => email.toLowerCase().trim()),

  // Password validation
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[@$!%*?&]/, 'Password must contain at least one special character'),

  // Name validation
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s-]+$/, 'Name can only contain letters, spaces, and hyphens'),
};

// Auth validation schemas
export const authSchemas = {
  register: z.object({
    name: commonSchemas.name.optional(),
    email: commonSchemas.email,
    password: commonSchemas.password,
  }),

  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, 'Password is required'),
  }),
};

// Input sanitization middleware
// export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
//   if (req.body) {
//     // Create a deep copy of the body to avoid reference issues
//     req.body = JSON.parse(JSON.stringify(req.body));

//     // Sanitize string fields
//     Object.keys(req.body).forEach((key) => {
//       if (typeof req.body[key] === 'string') {
//         // Basic XSS prevention
//         req.body[key] = req.body[key]
//           .replace(/</g, '&lt;')
//           .replace(/>/g, '&gt;')
//           .replace(/"/g, '&quot;')
//           .replace(/'/g, '&#x27;')
//           .replace(/\//g, '&#x2F;')
//           .trim();
//       }
//     });
//   }
//   next();
// };