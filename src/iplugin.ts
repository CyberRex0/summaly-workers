import Summary from './summary.js';

export interface IPlugin {
	test: (url: URL) => boolean;
	summarize: (url: URL, lang?: string) => Promise<Summary | null>;
}
