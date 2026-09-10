import prisma from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { GEMINI_MODEL, getGeminiClient, isGeminiConfigured } from "../lib/gemini";

const DISCLAIMER =
  "Đây chỉ là gợi ý dựa trên mô tả bạn cung cấp, KHÔNG phải chẩn đoán y khoa. " +
  "Vui lòng đến khám trực tiếp để được bác sĩ chẩn đoán chính xác.";

const TIMEOUT_MS = 15000;

function buildPrompt(symptomsText: string, specialtyNames: string[]) {
  const list = specialtyNames.map((name) => `- ${name}`).join("\n");
  return [
    "Bạn là trợ lý hướng dẫn bệnh nhân chọn chuyên khoa phù hợp tại một phòng khám.",
    "",
    "DANH SÁCH CHUYÊN KHOA HIỆN CÓ CỦA PHÒNG KHÁM:",
    list,
    "",
    `MÔ TẢ TRIỆU CHỨNG CỦA BỆNH NHÂN: "${symptomsText}"`,
    "",
    "YÊU CẦU:",
    "1. Chọn tối đa 3 chuyên khoa PHÙ HỢP NHẤT, CHỈ được chọn trong danh sách trên, không được bịa thêm chuyên khoa khác.",
    "2. Trả lời theo đúng định dạng, mỗi dòng một chuyên khoa: TÊN CHUYÊN KHOA | lý do ngắn gọn (1 câu, tiếng Việt).",
    "3. Nếu mô tả quá mơ hồ hoặc không liên quan y tế, trả lời đúng 1 dòng: KHONG_RO | rồi nêu lý do ngắn gọn.",
    "4. Không thêm lời chào, không thêm markdown, không thêm ghi chú nào khác ngoài các dòng theo định dạng trên.",
  ].join("\n");
}

function parseResponse(text: string, specialties: { id: number; name: string }[]) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const suggestions: { specialty: { id: number; name: string }; reason: string }[] = [];

  for (const line of lines) {
    const [rawName, ...rest] = line.split("|");
    const name = rawName?.trim();
    const reason = rest.join("|").trim();
    if (!name || name === "KHONG_RO") continue;

    const matched = specialties.find((s) => s.name.toLowerCase() === name.toLowerCase());
    if (matched && !suggestions.some((s) => s.specialty.id === matched.id)) {
      suggestions.push({ specialty: matched, reason: reason || "" });
    }
  }

  return suggestions.slice(0, 3);
}

function classifyGeminiError(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();

  if (lower.includes("quota") || lower.includes("resource_exhausted")) {
    return ApiError.serviceUnavailable("Đã hết hạn mức sử dụng AI hôm nay, vui lòng thử lại sau");
  }
  if (lower.includes("429") || lower.includes("rate limit")) {
    return ApiError.tooManyRequests("Hệ thống AI đang bận, vui lòng thử lại sau vài giây");
  }
  if (lower.includes("timeout") || lower.includes("abort")) {
    return ApiError.gatewayTimeout("Yêu cầu tới AI bị quá thời gian chờ, vui lòng thử lại");
  }
  // Không trả nguyên message gốc từ Gemini ra ngoài (có thể lộ chi tiết nội bộ/API key).
  return ApiError.serviceUnavailable("Dịch vụ AI hiện không khả dụng, vui lòng thử lại sau");
}

async function suggestSpecialty(symptomsText: string) {
  if (!isGeminiConfigured()) {
    throw ApiError.serviceUnavailable("Tính năng AI chưa được cấu hình trên máy chủ");
  }

  const specialties = await prisma.specialty.findMany({ orderBy: { name: "asc" } });
  if (specialties.length === 0) {
    throw ApiError.serviceUnavailable("Chưa có dữ liệu chuyên khoa để gợi ý");
  }

  const prompt = buildPrompt(
    symptomsText,
    specialties.map((s) => s.name)
  );

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await getGeminiClient().models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        abortSignal: controller.signal,
        temperature: 0.3,
        maxOutputTokens: 300,
      },
    });

    const text = response.text?.trim();
    if (!text) throw ApiError.serviceUnavailable("AI không trả về kết quả, vui lòng thử lại");

    const suggestions = parseResponse(text, specialties);

    return {
      suggestions,
      disclaimer: DISCLAIMER,
      fallbackMessage:
        suggestions.length === 0
          ? "Không tìm được chuyên khoa phù hợp từ mô tả của bạn. Bạn có thể chọn 'Nội tổng quát' để được thăm khám và tư vấn thêm."
          : null,
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw classifyGeminiError(err);
  } finally {
    clearTimeout(timer);
  }
}

export default { suggestSpecialty };
