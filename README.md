# Summaly server for Cloudflare Workers
Rewrite version of [summaly](https://github.com/misskey-dev/summaly).

# How to use
1. `pnpm i`
2. `pnpm wrangler login` (if needed)
3. `pnpm wrangler deploy`

# Restrcictments
- Some sites which uses non-standard encoding (ex. Shift_JIS, EUC-JP) will not be summarized correctly. We only support UTF-8 encoding.

# Copyright
Copyright (c) 2016-2019 syuilo, 2023 CyberRex<br>
MIT License

Hard forked from [misskey-dev/summaly](https://github.com/misskey-dev/summaly)