import { asyncHandler } from "../utils/asyncHandler";
import aiService from "../services/ai.service";

const suggestSpecialty = asyncHandler(async (req, res) => {
  const result = await aiService.suggestSpecialty(req.body.symptoms);
  res.json({ success: true, data: result });
});

export default { suggestSpecialty };
