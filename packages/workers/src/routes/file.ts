import type { ConnectRouter } from "@connectrpc/connect";
import { FileService } from "@/gen/file/v1/file_pb";
import { getAuthInfo, getEnv } from "@/store-context";
import service from "@/services";
import services from "@/services";

export function getFileRoutes(router: ConnectRouter) {
	return router.service(FileService, {
		uploadFile: async (req, ctx) => {
			const env = getEnv(ctx);
			const key = `${crypto.randomUUID()}-${req.fileName}`;
			await env.BUCKET.put(key, req.content);
			const url = `${env.BUCKET_CDN}/${key}`;
			const file = await services.files.createFile(env, {
				url,
				fileName: req.fileName,
				mimeType: req.mimeType,
				userId: getAuthInfo(ctx).userId,
				size: BigInt(req.content.length),
			});
			return {
				file,
			};
		},
		getFile: async (req, ctx) => {
			const { fileId } = req;
			const env = getEnv(ctx);
			const file = await service.files.getFile(env, fileId);
			return {
				file,
			};
		},
		deleteFile: async (req, ctx) => {
			const { fileId } = req;
			const env = getEnv(ctx);
			await service.files.deleteFile(env, fileId);
			return {};
		},
		listFiles: async (req, ctx) => {
			const { userId } = getAuthInfo(ctx);
			const env = getEnv(ctx);
			const files = await service.files.listFiles(env, userId);
			return { files };
		},
	});
}
