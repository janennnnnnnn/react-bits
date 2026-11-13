export async function posterImageResponse(request, apiKey) {
  if (request.method === 'GET') return Response.json({ available: Boolean(apiKey) });
  if (request.method !== 'POST') return Response.json({}, { status: 405 });
  if (!apiKey) return Response.json({ error: '请在 ChatGPT 中生成图片后上传。' }, { status: 503 });

  try {
    const { prompt } = await request.json();
    if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 4000) {
      return Response.json({ error: '请输入 1–4000 字的生图提示词。' }, { status: 400 });
    }
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: process.env.POSTER_IMAGE_MODEL || 'gpt-image-1', prompt, size: '1024x1536' }),
      signal: AbortSignal.timeout(120000)
    });
    if (!response.ok) return Response.json({ error: '生图服务请求失败（' + response.status + '）。' }, { status: 502 });
    const result = await response.json();
    const image = result.data?.[0]?.b64_json;
    if (!image) throw new Error('Missing image');
    return Response.json({ image: 'data:image/png;base64,' + image });
  } catch {
    return Response.json({ error: '未能取得生成图片，请重试或在 ChatGPT 中生成后上传。' }, { status: 502 });
  }
}
