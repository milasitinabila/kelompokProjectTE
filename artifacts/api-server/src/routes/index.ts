import { Router, type IRouter } from "express";
import healthRouter from "./health";
import customersRouter from "./customers";
import productsRouter from "./products";
import contractsRouter from "./contracts";
import posRouter from "./pos";
import transactionsRouter from "./transactions";
import securityRouter from "./security";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(customersRouter);
router.use(productsRouter);
router.use(contractsRouter);
router.use(posRouter);
router.use(transactionsRouter);
router.use(securityRouter);
router.use(dashboardRouter);

export default router;
