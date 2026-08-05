
import express from 'express';
import { analyze, discardFood, getEntries, getUser, saveFood, scanFood } from '../controller';
import { protect } from '../middleware';
import upload from '../middleware/upload';

const router=express.Router();
router.post("/scan", protect,upload.single("image"), scanFood)
router.post("/analyze", protect,upload.single("image"), analyze)
router.post("/save", protect,saveFood)
router.post("/discard", protect,discardFood)
router.get("/entries", protect,getEntries)

export default router;

