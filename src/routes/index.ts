import { Router } from "express";
import { userRoutes } from "./user";
import { roomRoutes } from "./room";

const router = Router();

router.use("/user", userRoutes);
router.use("/room", roomRoutes);

export default router;