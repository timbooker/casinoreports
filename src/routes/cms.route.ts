import { Request, Response, Router } from "express";
import cmsDocuments from "../payload/cms/documents1.json";
import navMenu from "../payload/cms/menu.json";

const CMSRouter = Router();

/**
 * @swagger
 * /api/menu:
 *   get:
 *     summary: Get navigation menu
 *     description: Retrieves the navigation menu structure for the casino application
 *     tags: [CMS]
 *     responses:
 *       200:
 *         description: Menu data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
CMSRouter.get("/menu", async (_req: Request, res: Response) => {
    res.json(navMenu);
});

/**
 * @swagger
 * /api/cms/documents:
 *   get:
 *     summary: Get CMS documents
 *     description: Retrieves CMS documents and content
 *     tags: [CMS]
 *     responses:
 *       200:
 *         description: CMS documents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
CMSRouter.get("/cms/documents", async (_req: Request, res: Response) => {
    res.json(cmsDocuments);
});

export default CMSRouter;