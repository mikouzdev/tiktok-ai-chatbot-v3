import express, { type Request, type Response } from "express";
import { handleAudioRequest } from "../ttsHandler";

const router = express.Router();
router.use(express.json());

router.get("/version", (_req: Request, res: Response) => {
    res.send({ version: "1.0.0" });
});

router.post("/audio", handleAudioRequest);

export default router;
