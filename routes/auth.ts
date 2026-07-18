
import express from 'express';
import { getUser, login, register } from '../controller';
import { protect } from '../middleware';
import { validate, authSchemas } from '../middleware';

const router=express.Router();

// Apply validation middleware before route handlers
router.post("/register", validate(authSchemas.register), register);
router.post("/login", validate(authSchemas.login), login);
router.get("/me", protect, getUser);

export default router;