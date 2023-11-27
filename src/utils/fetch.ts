import { StatusError } from './status-error.js';
import { Buffer } from 'node:buffer';
import { detectEncoding, toUtf8 } from './encoding.js';
import * as cheerio from 'cheerio';
import repo from '../../package.json';
import { streamToArrayBuffer, streamToString } from './misc';
import contentType from 'content-type';

const RESPONSE_TIMEOUT = 20 * 1000;
const OPERATION_TIMEOUT = 60 * 1000;
const MAX_RESPONSE_SIZE = 10 * 1024 * 1024;
const BOT_UA = `SummalyBot/${repo.version}`;

export async function scpaping(url: string, opts?: { lang?: string; }) {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'text/html,application/xhtml+xml',
            'User-Agent': BOT_UA,
            ... opts?.lang ? { 'Accept-Laungage': opts.lang } : {}
        }
    });

    if (!response.headers.get('Content-Type')) {
        throw new Error('Response type must be text/html or application/xhtml+xml');
    }

    if (!response.headers.get('Content-Type')?.match(/^(text\/html|application\/xhtml\+xml)/)) {
        throw new Error('Got wrong content type response');
    }

    let body = Buffer.from(await streamToArrayBuffer(response.body));
    let $ = cheerio.load(body);
    let foundCharset = null;

    // metaタグから文字エンコーディングを探す
    const metaCharsetTags = $('meta[charset]');
    if (metaCharsetTags) {
        const charset = metaCharsetTags.attr('charset');
        if (charset) {
            if (charset.toLowerCase() !== 'utf-8') {
                foundCharset = charset.toLowerCase();
            }
        }
    } else {
        // なければヘッダから探す
        if (response.headers.get('Content-Type') !== null) {
            const ct = contentType.parse(response.headers.get('Content-Type')!);
            if (ct.parameters.charset !== 'utf-8') {
                foundCharset = ct.parameters.charset;
            }
        }
    }
    
    if (foundCharset) {
        $ = cheerio.load(toUtf8(Buffer.from(body), foundCharset));
    }

    return {
        body,
        $,
        response,
    };
}

export async function get(url: string) {
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': '*/*',
        }
    });
    return await streamToString(res.body);
}

export async function head(url: string) {
    const res = await fetch(url, {
        method: 'HEAD',
        headers: {
            'Accept': '*/*',
        }
    });
    if (!res.ok) throw new Error('fetch failed');
    return true
}