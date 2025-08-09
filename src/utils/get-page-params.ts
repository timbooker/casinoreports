import { Request } from "express";

const MAX_SIZE = 100;
const MAX_DURATION = 30 * 24;

export function getPageParams(req: Request, maxSize: number = MAX_SIZE, maxDuration: number = MAX_DURATION) {
    let size = Number(req.query.size) || 10;
    let duration = Number(req.query.duration) || 12;
    let page = Number(req.query.page) || 0;

    if (size > maxSize) {
        size = maxSize;
    }

    if (duration > maxDuration) {
        duration = maxDuration;
    }

    if (page < 0) {
        page = 0;
    }

    return { size, duration, page };
}
