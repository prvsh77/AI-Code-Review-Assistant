import { Router, type IRouter } from "express";
import healthRouter from "./health";
import repositoriesRouter from "./repositories";
import pullRequestsRouter from "./pullRequests";
import reviewsRouter from "./reviews";
import securityRouter from "./security";
import analyticsRouter from "./analytics";
import userRouter from "./user";

const router: IRouter = Router();

router.use(healthRouter);
router.use(repositoriesRouter);
router.use(pullRequestsRouter);
router.use(reviewsRouter);
router.use(securityRouter);
router.use(analyticsRouter);
router.use(userRouter);

export default router;
