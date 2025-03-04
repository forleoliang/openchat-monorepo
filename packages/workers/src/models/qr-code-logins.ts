import { pgTable, text } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

export const qrCodeLogins = pgTable("qr_code_logins", {
	id: text()
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	status: text()
		.notNull()
		.$default(() => "PENDING"), // PENDING, SCANNED, CONFIRMED, EXPIRED, CANCELLED
	userId: text(), // 关联的用户 ID，在确认登录时设置
	content: text().notNull(), // 二维码内容
	expiresAt: text().notNull(), // 过期时间
	scannedAt: text(), // 扫码时间
	confirmedAt: text(), // 确认登录时间
	createdAt: text()
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
	updatedAt: text()
		.notNull()
		.$defaultFn(() => new Date().toISOString())
		.$onUpdate(() => new Date().toISOString()),
});

export type QrCodeLogin = typeof qrCodeLogins.$inferSelect;
export type NewQrCodeLogin = typeof qrCodeLogins.$inferInsert;
