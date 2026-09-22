export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('Cole uma URL válida.');
  }

  try {
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;

    // Busca o conteúdo da página externa
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    let html = await response.text();

    // Injeta <base> para que imagens e estilos relativos continuem funcionando
    const baseTag = `<base href="${targetUrl}">`;
    if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>${baseTag}`);
    } else {
      html = baseTag + html;
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (err) {
    return res.status(500).send(`Falha ao ler o site: ${err.message}`);
  }
}