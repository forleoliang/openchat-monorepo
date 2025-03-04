import { zodFunction } from "openai/helpers/zod";
import { z } from "zod";
import { load } from "cheerio";
import puppeteer, {
	launch,
	type Browser,
	type BrowserWorker,
	type Page,
} from "@cloudflare/puppeteer";

const BROWSER_CONFIG = {
	KEEP_ALIVE_TIME: 600000, // 10分钟的保活时间
	CONNECTION_RETRY_TIMES: 3, // 连接重试次数
	TIMEOUT: 10000, // 页面加载超时时间
} as const;

export const browserUrlTool = zodFunction({
	name: "browser_url",
	parameters: z.object({
		url: z.string().describe("the url to browse"),
	}),
	description: "browse the url and return the page content",
});

/**
 * 浏览URL并提取页面内容
 * @param env - 环境变量对象
 * @param url - 目标URL
 * @returns 返回页面的标题、描述和内容
 * @throws 如果无法连接到浏览器或页面访问失败则抛出错误
 */
export async function browseUrl(env: Env, url: string) {
	const browser = await getBrowser(env.BROWSER, env.BROWSER_URL);
	if (!browser) {
		throw new Error("无法连接到浏览器实例");
	}
	let page: Page | undefined;
	try {
		page = await browser.newPage();
		page.setDefaultNavigationTimeout(BROWSER_CONFIG.TIMEOUT);
		await page.goto(url);
		const content = await page.content();
		const $ = load(content);
		return {
			title: $("title").text().trim(),
			description: $('meta[name="description"]').attr("content") || "",
			content: $("body").text().trim(),
		};
	} catch (error) {
		throw new Error(`页面访问失败: ${(error as Error).message}`);
	} finally {
		// 确保关闭页面
		await page?.close().catch(console.error);
	}
}

/**
 * 获取浏览器实例，优先尝试复用现有会话，如果失败则创建新实例
 * @param BROWSER - 浏览器worker实例
 * @param wsEndpoint - 可选的WebSocket连接端点
 * @returns 返回浏览器实例，如果所有连接方式都失败则返回undefined
 */
export async function getBrowser(
	BROWSER: BrowserWorker,
	wsEndpoint?: string,
): Promise<Browser | undefined> {
	// 首先尝试获取现有的浏览器实例
	if (BROWSER) {
		const existingBrowser = await tryGetExistingBrowser(BROWSER);
		if (existingBrowser) {
			console.log("成功连接到现有浏览器会话");
			return existingBrowser;
		}
		// 如果没有可用的现有实例，尝试启动新的浏览器
		try {
			console.log("正在启动新的浏览器实例");
			return await launch(BROWSER, {
				keep_alive: BROWSER_CONFIG.KEEP_ALIVE_TIME,
			});
		} catch (error) {
			console.error("启动新浏览器失败:", error);
		}
	}
	// 如果提供了WebSocket端点，尝试通过WebSocket连接
	if (wsEndpoint) {
		try {
			console.log("正在通过WebSocket连接到浏览器:", wsEndpoint);
			return await puppeteer.connect({
				browserWSEndpoint: wsEndpoint,
			});
		} catch (error) {
			console.error("WebSocket连接失败:", error);
		}
	}
	return undefined;
}

/**
 * 尝试连接到现有的浏览器会话
 * @param BROWSER - 浏览器worker实例
 * @returns 返回浏览器实例，如果连接失败则返回undefined
 */
async function tryGetExistingBrowser(
	BROWSER: BrowserWorker,
): Promise<Browser | undefined> {
	try {
		// 获取所有会话信息
		const sessions = await puppeteer.sessions(BROWSER);
		// 首先尝试连接到不活跃的会话
		const inactiveSessions = sessions
			.filter(({ connectionId }) => !connectionId)
			.map(({ sessionId }) => sessionId);

		// 尝试连接不活跃会话
		for (const sessionId of inactiveSessions) {
			try {
				console.log("正在连接到不活跃会话:", sessionId);
				return await puppeteer.connect(BROWSER, sessionId);
			} catch (error) {
				console.error("连接不活跃会话失败:", error);
			}
		}

		// 如果没有可用的不活跃会话，尝试连接活跃会话
		const limitsResp = await puppeteer.limits(BROWSER);
		const activeSessions = limitsResp.activeSessions.map(({ id }) => id);

		for (const sessionId of activeSessions) {
			try {
				console.log("正在连接到活跃会话:", sessionId);
				return await puppeteer.connect(BROWSER, sessionId);
			} catch (error) {
				console.error("连接活跃会话失败:", error);
			}
		}
	} catch (error) {
		console.error("获取会话信息失败:", error);
	}

	return undefined;
}
