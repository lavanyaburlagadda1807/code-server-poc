import * as express from "express"
import { promises as fs } from "fs"
import * as path from "path"
import { rootPath } from "../constants"
import { relativeRoot } from "../http"

export const router = express.Router()

/**
 * Serve the IDE client page with proper template replacement
 */
router.get("/", async (req, res, next) => {
  try {
    // Import logger with field function for proper logging
    const { logger, field } = await import("@coder/logger")

    logger.info(
      "IDE Client page requested",
      field("userAgent", req.get("User-Agent")),
      field("ip", req.ip),
      field("referer", req.get("Referer")),
      field("originalUrl", req.originalUrl),
    )

    const resourcePath = path.resolve(rootPath, "src/browser/pages/ide-client.html")
    let content = await fs.readFile(resourcePath, "utf-8")

    // Replace template variables
    const base = relativeRoot(req.originalUrl)
    const staticBase = base + "/_static"

    content = content.replace(/{{CS_STATIC_BASE}}/g, staticBase).replace(/{{BASE}}/g, base)

    logger.info("Serving IDE Client page", field("base", base), field("staticBase", staticBase))

    res.set("Content-Type", "text/html")
    res.send(content)
  } catch (error) {
    // Import logger for error logging
    const { logger, field } = await import("@coder/logger")
    logger.error("Failed to serve IDE Client page", field("error", error))
    next(error)
  }
})
