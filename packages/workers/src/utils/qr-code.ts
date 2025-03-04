import { v7 as uuidv7 } from "uuid";

export async function generateQrCodeContent() {
	// 生成一个随机的 UUID 作为二维码内容
	// 实际项目中可能需要加入更多信息，比如时间戳、应用标识等
	return uuidv7();
}
