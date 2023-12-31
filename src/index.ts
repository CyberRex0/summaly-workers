/**
 * summaly
 * https://github.com/syuilo/summaly
 */

import tracer from './utils/redirect-tracer.js';
import { SummalyResult } from './summary.js';
import { SummalyPlugin } from './iplugin.js';
export * from './iplugin.js';
import general from './general.js';
import { plugins as builtinPlugins } from './plugins/index.js';
import { Hono, Context } from "hono";

const app = new Hono();

export type SummalyOptions = {
	/**
	 * Accept-Language for the request
	 */
	lang?: string | null;

	/**
	 * Whether follow redirects
	 */
	followRedirects?: boolean;

	/**
	 * Custom Plugins
	 */
	plugins?: SummalyPlugin[];
};

const summalyDefaultOptions = {
	lang: null,
	followRedirects: true,
	plugins: [],
} as SummalyOptions;

/**
 * Summarize an web page
 */
export const summaly = async (url: string, options?: SummalyOptions): Promise<SummalyResult> => {

	const opts = Object.assign(summalyDefaultOptions, options);

	const plugins = builtinPlugins.concat(opts.plugins || []);

	let actualUrl = url;
	if (opts.followRedirects) {
		// .catch(() => url)にすればいいけど、jestにtrace-redirectを食わせるのが面倒なのでtry-catch
		try {
			actualUrl = await tracer(url);
		} catch (e) {
			actualUrl = url;
		}
	}
 
	const _url = new URL(actualUrl);

	// Find matching plugin
	const match = plugins.filter(plugin => plugin.test(_url))[0];

	// Get summary
	const summary = await (match ? match.summarize : general)(_url, opts.lang || undefined);

	if (summary == null) {
		throw new Error('failed summarize');
	}

	return Object.assign(summary, {
		url: actualUrl,
	});
};

async function process(context: Context) {
	const url = context.req.query('url') as string;
	if (url == null) {
		return context.json({
			error: 'url is required'
		});
	}

	try {
		const summary = await summaly(url, {
			lang: context.req.query('lang') as string,
			followRedirects: false
		});

		return context.json(summary);
	} catch (e) {
		return context.json({
			error: e.toString()
		});
	}
}

app.get('/', process);
app.get('/url', process);

export default app;