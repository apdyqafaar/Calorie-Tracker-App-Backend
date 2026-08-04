import e, { Request, Response } from 'express';
import {  authSchemas } from '../middleware';
import { authServices } from '../lib';
import { jwtService } from '../lib/services/jwt.service';

// register controller
export const register = async (req: Request, res: Response) => {
 try {
   // Implementation for registration
  const validationResult = authSchemas.register.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((err) => ({
      field: err.path.join('.') || 'unknown',
      message: err.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Registration validation failed',
      errors,
      timestamp: new Date().toISOString()
    });
  }

  const { name, email, password } = validationResult.data;
  
  const user=await authServices.register({  email, password,name:name||"" });
 
  // generate token here
  const token = jwtService.generateToken({ userId: user.id });
  

  return res.status(201).json({ message: 'User registered successfully' , user, token });

 } catch (error) {
  console.error('Registration error:', error);
  return res.status(500).json(error instanceof Error ? { message: error.message } : { message: 'An error occurred during registration' });
 }
};

// register controller
export const login = async (req: Request, res: Response) => {
 try {
   // Implementation for login
  const validationResult = authSchemas.login.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((err) => ({
      field: err.path.join('.') || 'unknown',
      message: err.message
    }));
    return res.status(400).json({
      success: false,
      message: 'login validation failed',
      errors,
      timestamp: new Date().toISOString()
    });
  }

  const {  email, password } = validationResult.data;
  
  const user=await authServices.login({email, password });

 
  // generate token here
  const token = jwtService.generateToken({ userId: user.id});
  

  return res.status(201).json({ message: 'User logged in successfully' , user, token });
 } catch (error) {
  console.error('Login error:', error);
  return res.status(401).json(error instanceof Error ? { message: error.message } : { message: 'An error occurred during login' });
 }

};

// get user
// register controller
export const getUser = async (req: Request, res: Response) => {
 try {
   // Implementation for getting user
  const { userId } = req.user!;
  const user = await authServices.getUserById(userId);
  return res.status(200).json({ user });
 } catch (error) {
  console.error('Get user error:', error);
  return res.status(500).json(error instanceof Error ? { message: error.message } : { message: 'An error occurred while fetching user details' });
 }
};

// register controller
export const updateProfile = async (req: Request, res: Response) => {
 try {
   // Implementation for login
  const validationResult = authSchemas.update.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((err) => ({
      field: err.path.join('.') || 'unknown',
      message: err.message
    }));
    return res.status(400).json({
      success: false,
      message: 'update-profile validation failed',
      errors,
      timestamp: new Date().toISOString()
    });
  }

  const { name,dailyCalorieGoal,onboardingCompleted } = validationResult.data;
   // Implementation for getting user
   const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
  const user = await authServices.updateProfile(userId,name, dailyCalorieGoal, onboardingCompleted);
  return res.status(201).json({ message: 'User updated in successfully' , user,  });
 } catch (error) {
  console.error('updating-profile error:', error);
  return res.status(401).json(error instanceof Error ? { message: error.message } : { message: 'An error occurred during updating-profile' });
 }

};

