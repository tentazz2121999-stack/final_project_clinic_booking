import { asyncHandler } from "../utils/asyncHandler";
import statsService from "../services/stats.service";

const overview = asyncHandler(async (req, res) => {
  const data = await statsService.overview();
  res.json({ success: true, data });
});

export default { overview };
