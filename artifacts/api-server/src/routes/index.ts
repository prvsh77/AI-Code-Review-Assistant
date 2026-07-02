import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import repositoriesRouter from "./repositories";
import pullRequestsRouter from "./pullRequests";
import reviewsRouter from "./reviews";
import securityRouter from "./security";
import analyticsRouter from "./analytics";
import userRouter from "./user";
import aiProxyRouter from "./aiProxy";
import { authenticateToken } from "../middlewares/auth";

const router: IRouter = Router();

// Public routes
router.use(healthRouter);
router.use(authRouter);

// Protected routes
router.use(authenticateToken);
router.use(repositoriesRouter);
router.use(pullRequestsRouter);
router.use(reviewsRouter);
router.use(securityRouter);
router.use(analyticsRouter);
router.use(userRouter);
router.use("/ai", aiProxyRouter);

export default router;
