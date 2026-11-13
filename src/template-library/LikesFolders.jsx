import { useEffect, useState } from 'react';

function PinImage({ item, fallback }) {
  const [attempt, setAttempt] = useState(0);
  if (attempt > 1) return <span className="tl-resource-label">Image unavailable · Open Pin</span>;
  return (
    <img
      className="tl-asset-image"
      src={attempt === 0 ? item.image : fallback}
      alt={item.name}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setAttempt(value => value + 1)}
    />
  );
}

export default function LikesFolders({ boards, query }) {
  const [selected, setSelected] = useState(boards[0]?.url);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('');
  const board = boards.find(item => item.url === selected) ?? boards[0];

  useEffect(() => {
    if (!board) return;
    const controller = new AbortController();
    fetch('/api/likes?board=' + encodeURIComponent(board.url), { signal: controller.signal })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setResult({ url: board.url, images: data });
      })
      .catch(error => {
        if (!controller.signal.aborted) setResult({ url: board.url, error: error.message });
      });
    return () => controller.abort();
  }, [board?.url]);

  async function copy(path) {
    try {
      const png = fetch(path).then(async response => {
        if (!response.ok) throw new Error();
        const bitmap = await createImageBitmap(await response.blob());
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        canvas.getContext('2d').drawImage(bitmap, 0, 0);
        bitmap.close();
        return canvas.convertToBlob({ type: 'image/png' });
      });
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
      setStatus('Image copied.');
    } catch {
      setStatus('Could not copy image. You can still download it.');
    }
  }

  const current = result?.url === board?.url ? result : null;
  const images = current?.images?.filter(item => item.name.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <section aria-label="Pinterest folders">
      <div className="tl-categories" aria-label="Folders">
        {boards.map(item => (
          <button key={item.id} aria-pressed={item.url === board?.url} onClick={() => {
            if (item.url === board?.url) return;
            setResult(null);
            setStatus('');
            setSelected(item.url);
          }}>{item.name}</button>
        ))}
      </div>
      <p role="status">{status || current?.error || (!current ? 'Loading images…' : images?.length ? '' : 'No images found.')}</p>
      <div className="tl-grid tl-likes-grid">
        {images?.map(item => {
          const path = '/api/likes/image?image=' + encodeURIComponent(item.image);
          return (
            <article key={item.url} className="tl-card tl-pin-card">
              <div className="tl-thumbnail"><PinImage key={item.image} item={item} fallback={path} /></div>
              <div className="tl-card-body">
                <h2 title={item.name}>{item.name}</h2>
                <div className="tl-resource-actions">
                  <button className="tl-action" onClick={() => copy(path)}>Copy image</button>
                  <a className="tl-action" href={path} download>Download</a>
                  <a className="tl-action" href={item.url} target="_blank" rel="noreferrer">Open Pin</a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
