import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Check } from 'lucide-react';
import maxstoreLogo from './pax/assets/116-26-imgLogoLogoMaxstoreVWhite.png';
import { useEffect, useRef, useState } from 'react';
import { empowerPoster } from './posterCatalog';

const products = [
  { name: 'AirLauncher', logo: '/poster/empower-devices/assets/airlauncher-wordmark.png' },
  { name: 'MAXSTORE', logo: maxstoreLogo }
];

const audiences = ['收单机构与支付服务商', '银行与金融机构', '终端部署与运维团队', '软件集成商与开发者', '零售与餐饮商户'];
const channels = ['LinkedIn', '微信公众号', '小红书', '官网', '展会'];
const sizes = [['3:4', 1080, 1440], ['1:1', 1080, 1080], ['4:5', 1080, 1350], ['9:16', 1080, 1920], ['16:9', 1920, 1080]];

function MultiChoice({ title, options, selected, onChange, labelFor = value => value }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger type="button" className="tl-action tl-workflow-select" aria-label={title}>
        <span>{title}{selected.length ? ' · ' + selected.length : ''}</span><ChevronDown size={14} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="tl-workflow-menu" align="start" sideOffset={5}>
          {options.map(option => (
            <DropdownMenu.CheckboxItem key={option} checked={selected.includes(option)}
              onSelect={event => event.preventDefault()}
              onCheckedChange={checked => onChange(checked ? [...selected, option] : selected.filter(value => value !== option))}>
              <span><DropdownMenu.ItemIndicator><Check size={14} /></DropdownMenu.ItemIndicator></span>{labelFor(option)}
            </DropdownMenu.CheckboxItem>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function imageData(bytes, type) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(new Blob([bytes], { type }));
  });
}

const initialPositions = [[28, 38], [308, 38], [588, 38], [868, 38], [1148, 38], [1428, 38], [1708, 38]];
const labels = ['确认需求', '核对素材', '设计计划', '生图与选图', '填写文案', '套版预览', '导出'];
const connections = labels.slice(1).map((_, index) => [index, index + 1, 0]);

export function PosterWorkflowThumbnail() {
  return (
    <div className="tl-workflow-thumbnail" aria-hidden="true">
      {labels.map(label => <span key={label}>{label}</span>)}
    </div>
  );
}

export default function PosterWorkflowCard({ assets }) {
  const [selectedProducts, setSelectedProducts] = useState(['AirLauncher']);
  const [selectedAudiences, setAudiences] = useState([]);
  const [selectedChannels, setChannels] = useState(['LinkedIn']);
  const [customChannels, setCustomChannels] = useState([]);
  const [channelInput, setChannelInput] = useState('');
  const [size, setSize] = useState({ preset: '3:4', width: 1080, height: 1440 });
  const [renderedSize, setRenderedSize] = useState(size);

  function addChannel() {
    const channel = channelInput.trim();
    if (!channel) return;
    const existing = [...channels, ...customChannels].find(value => value.toLowerCase() === channel.toLowerCase());
    if (!existing) setCustomChannels(current => [...current, channel]);
    setChannels(current => [...new Set([...current, existing || channel])]);
    setChannelInput('');
  }

  const [headline, setHeadline] = useState('Empower Devices');
  const [subtitle, setSubtitle] = useState('Effortlessly Customize Your Android Devices.');
  const [html, setHtml] = useState('');
  const [positions, setPositions] = useState(initialPositions);
  const [available, setAvailable] = useState(null);
  const [materials, setMaterials] = useState([{ id: 'background', prompt: '', image: '', busy: false }]);
  const [assetIds, setAssetIds] = useState([]);
  const [plan, setPlan] = useState({});
  const [exportStatus, setExportStatus] = useState('');
  const chosenAssets = assetIds.map(id => assets.find(asset => asset.id === id)).filter(Boolean);
  const updateMaterial = (id, patch) => setMaterials(current =>
    current.map(material => material.id === id ? { ...material, ...patch } : material));
  useEffect(() => {
    fetch('/api/poster/image').then(response => response.json())
      .then(result => setAvailable(Boolean(result.available))).catch(() => setAvailable(false));
  }, []);

  function imagePrompt(prompt) {
    return [
      prompt,
      '产品：' + selectedProducts.join('、'),
      '受众：' + selectedAudiences.join('、'),
      '渠道：' + selectedChannels.join('、'),
      '画布：' + size.width + ' × ' + size.height + ' px',
      ...Object.entries(plan).filter(([, value]) => value.trim()).map(([label, value]) => label + '：' + value),
      chosenAssets.length && '参考素材：' + chosenAssets.map(asset => asset.name).join('、')
    ].filter(Boolean).join('\n');
  }

  async function generate(material) {
    updateMaterial(material.id, { busy: true, error: '' });
    try {
      const response = await fetch('/api/poster/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt(material.prompt) })
      });
      const result = await response.json();
      if (!response.ok || !result.image) throw new Error(result.error || '未取得图片');
      updateMaterial(material.id, { image: result.image });
      setHtml('');
    } catch (error) {
      updateMaterial(material.id, { error: error.message });
    } finally {
      updateMaterial(material.id, { busy: false });
    }
  }

  async function loadMaterial(material, file) {
    if (!file) return;
    try {
      updateMaterial(material.id, { image: await imageData(await file.arrayBuffer(), file.type), error: '' });
      setHtml('');
    } catch {
      updateMaterial(material.id, { error: '图片读取失败' });
    }
  }

  const drag = useRef(null);
  const [status, setStatus] = useState('');

  async function run(event) {
    event.preventDefault();
    if (!selectedProducts.length) {
      setStatus('请至少选择一个产品。');
      return;
    }
    setStatus('正在生成预览…');
    setHtml('');
    try {
      const response = await fetch(empowerPoster.editor);
      if (!response.ok) throw new Error('模板加载失败');
      const document = new DOMParser().parseFromString(await response.text(), 'text/html');
      const title = document.querySelector('h1');
      const description = document.querySelector('.subtitle');
      if (!title || !description) throw new Error('找不到模板中的文案字段');
      title.firstChild.textContent = headline;
      description.textContent = subtitle;
      const brand = document.querySelector('.brand');
      const logos = await Promise.all(selectedProducts.map(async name => {
        const product = products.find(item => item.name === name);
        const response = await fetch(product.logo);
        if (!response.ok) throw new Error(name + ' Logo 加载失败');
        const blob = await response.blob();
        const logo = document.createElement('img');
        logo.alt = name;
        logo.src = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error(name + ' Logo 读取失败'));
          reader.readAsDataURL(blob);
        });
        return logo;
      }));
      brand.replaceChildren(...logos);
      const poster = document.querySelector('.poster');
      const ratio = Number(size.width) / Number(size.height);
      poster.style.width = 'min(100vw, ' + ratio * 100 + 'svh, ' + size.width + 'px)';
      poster.style.aspectRatio = size.width + ' / ' + size.height;
      poster.style.containerType = 'size';
      const styles = document.querySelector('style');
      styles.textContent = styles.textContent.replace(/([0-9.]+)cqw/g, (_, value) =>
        'min(' + value + 'cqw, ' + Number(value) * 0.75 + 'cqh)');
      const metadata = document.createElement('meta');
      metadata.name = 'poster-size';
      metadata.content = size.width + 'x' + size.height;
      document.head.append(metadata);
      setRenderedSize(size);
      const base = document.createElement('base');
      base.href = response.url;
      document.head.prepend(base);
      const hero = document.querySelector('.hero');
      const pictures = [
        ...materials.filter(item => item.image).map(item => item.image),
        ...chosenAssets.filter(asset => asset.media === 'image').map(asset => new URL(asset.url, window.location.href).href)
      ];
      const video = chosenAssets.find(asset => asset.media === 'video');
      if (video) hero.querySelector('video').src = new URL(video.url, window.location.href).href;
      pictures.forEach((source, index) => {
        const image = document.createElement('img');
        image.src = source;
        image.alt = '';
        image.style.cssText = index === 0
          ? 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover'
          : 'position:absolute;right:5%;width:22%;height:16%;object-fit:contain;top:' + (32 + (index - 1) % 4 * 16) + '%';
        hero.append(image);
      });
      setHtml('<!doctype html>\n' + document.documentElement.outerHTML);
      setStatus('预览已生成');
    } catch (error) {
      setStatus(error.message);
    }
  }

  function save(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function exportPoster(format) {
    setExportStatus('正在准备 ' + format + '…');
    try {
      if (format === 'HTML') {
        save(new Blob([html], { type: 'text/html' }), 'empower-devices.html');
      } else {
        const { default: html2canvas } = await import('html2canvas');
        const frame = document.createElement('iframe');
        frame.style.cssText = 'position:fixed;left:-10000px;top:0;border:0;width:' +
          renderedSize.width + 'px;height:' + renderedSize.height + 'px';
        try {
          await new Promise((resolve, reject) => {
            frame.onload = resolve;
            frame.onerror = reject;
            frame.srcdoc = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
            document.body.append(frame);
          });
          await frame.contentDocument.fonts.ready;
          const video = frame.contentDocument.querySelector('video');
          if (video && video.readyState < 2) {
            await new Promise(resolve => {
              video.addEventListener('loadeddata', resolve, { once: true });
              video.addEventListener('error', resolve, { once: true });
              setTimeout(resolve, 3000);
              video.preload = 'auto';
            });
          }
          const canvas = await html2canvas(frame.contentDocument.querySelector('.poster'), {
            scale: 1, useCORS: true, width: Number(renderedSize.width), height: Number(renderedSize.height)
          });
          const png = await new Promise(resolve => canvas.toBlob(resolve));
          if (!png) throw new Error('无法生成 PNG');
          if (format === 'PNG') save(png, 'empower-devices.png');
          else {
            const response = await fetch(empowerPoster.download);
            if (!response.ok) throw new Error('无法读取 Image to Frame 工具包');
            const { unzipSync, zipSync, strToU8 } = await import('fflate');
            const archive = unzipSync(new Uint8Array(await response.arrayBuffer()), {
              filter: file => file.name.startsWith('tools/image-to-frame/')
            });
            archive['poster.png'] = new Uint8Array(await png.arrayBuffer());
            archive['任务.md'] = strToU8('使用 tools/image-to-frame/SKILL.md 将 poster.png 重建为可编辑 ' + format +
              '。先检查 GPT Image 及目标设计工具能力。\n\n主标题：' + headline + '\n副标题：' + subtitle);
            save(new Blob([zipSync(archive)], { type: 'application/zip' }), 'empower-devices-' + format.toLowerCase() + '-handoff.zip');
          }
        } finally {
          frame.remove();
        }
      }
      setExportStatus(format === 'PNG' || format === 'HTML' ? '已导出 ' + format : '已下载转换包，请交给具备 GPT Image 能力的 Agent。');
    } catch (error) {
      setExportStatus(error.message);
    }
  }

  function move(event) {
    if (!drag.current) return;
    const { index, x, y } = drag.current;
    setPositions(current => current.map((position, i) => i === index
      ? [Math.max(16, Math.min(1720, event.clientX - x)), Math.max(16, Math.min(280, event.clientY - y))]
      : position));
  }

  const nodes = [
    [labels[0], <><MultiChoice title="产品（可多选）" options={products.map(product => product.name)} selected={selectedProducts} onChange={value => {
      setSelectedProducts(value);
      setHtml('');
    }} />
      <MultiChoice title="目标受众（可多选）" options={audiences} selected={selectedAudiences} onChange={setAudiences} />
      <MultiChoice title="发布渠道（可多选）" options={[...channels, ...customChannels]} selected={selectedChannels} onChange={setChannels} />
      <label>自定义渠道<input value={channelInput} maxLength={60} onChange={event => setChannelInput(event.target.value)} onKeyDown={event => {
        if (event.key === 'Enter') {
          event.preventDefault();
          addChannel();
        }
      }} /></label>
      <button type="button" className="tl-action" disabled={!channelInput.trim()} onClick={addChannel}>添加渠道</button>
      <label>海报比例<select value={size.preset} onChange={event => {
        const preset = sizes.find(([label]) => label === event.target.value);
        setSize(preset ? { preset: preset[0], width: preset[1], height: preset[2] } : { ...size, preset: 'custom' });
        setHtml('');
      }}>
        {sizes.map(([label, width, height]) => <option key={label} value={label}>{label} · {width} × {height}</option>)}
        <option value="custom">自定义像素</option>
      </select></label>
      {size.preset === 'custom' && ['width', 'height'].map(axis => (
        <label key={axis}>{axis === 'width' ? '宽度（px）' : '高度（px）'}
          <input type="number" min="1" max="8192" required value={size[axis]} onChange={event => {
            setSize({ ...size, [axis]: event.target.value });
            setHtml('');
          }} />
        </label>
      ))}</>],
    [labels[1], <>
      <MultiChoice title="从 Asset 勾选素材" options={assets.map(asset => asset.id)} selected={assetIds}
        labelFor={id => {
          const asset = assets.find(item => item.id === id);
          return asset.category + ' · ' + asset.name;
        }}
        onChange={ids => { setAssetIds(ids); setHtml(''); }} />
      {chosenAssets.map(asset => <div key={asset.id}>
        <a href={asset.url} target="_blank" rel="noreferrer">{asset.name}</a>
        <button type="button" className="tl-action" onClick={() => {
          setAssetIds(assetIds.filter(id => id !== asset.id)); setHtml('');
        }}>移除</button>
      </div>)}
      <a href="https://www.pax.com.cn/" target="_blank" rel="noreferrer">核对 PAX 产品资料</a>
    </>],
    [labels[2], <>{['传播目标与重点', '版式与视觉层级', '复用资产与来源', '待生成素材与留白', 'CTA 与交付要求'].map(label =>
      <label key={label}>{label}<textarea rows={2} value={plan[label] ?? ''} onChange={event =>
        setPlan({ ...plan, [label]: event.target.value })} /></label>)}
      <button type="button" className="tl-action" onClick={() => {
        setMaterials(current => [...current, { id: crypto.randomUUID(), prompt: '', image: '', busy: false }]);
      }}>添加生图分支</button>
    </>],
    [labels[3], null],
    [labels[4], <><label>主标题<input value={headline} onChange={event => setHeadline(event.target.value)} required /></label>
      <label>副标题<input value={subtitle} onChange={event => setSubtitle(event.target.value)} required /></label></>],
    [labels[5], <><p>Empower Devices</p>{html && <iframe style={{ aspectRatio: renderedSize.width + " / " + renderedSize.height, maxHeight: 380 }} title="海报预览" sandbox="allow-scripts" srcDoc={html} />}</>],
    [labels[6], <>
      {['HTML', 'PNG', 'Figma', 'PSD'].map(format => <button key={format} type="button" className="tl-action"
        disabled={!html || exportStatus.startsWith('正在准备')} onClick={() => exportPoster(format)}>
        {format === 'HTML' || format === 'PNG' ? '导出 ' : '准备转换包 · '}{format}
      </button>)}
      <span role="status">{exportStatus}</span>
    </>]
  ];

  const materialNodes = materials.map((material, index) => [
    index === 0 ? '背景素材' : '素材 ' + (index + 1),
    <>
      <label>提示词<textarea rows={3} value={material.prompt} onChange={event =>
        updateMaterial(material.id, { prompt: event.target.value })} /></label>
      {available && <button type="button" className="tl-action" disabled={material.busy || !material.prompt.trim()}
        onClick={() => generate(material)}>{material.busy ? '正在生图…' : '生成素材'}</button>}
      {available === false && <>
        <button type="button" className="tl-action" disabled={!material.prompt.trim()} onClick={async () => {
          try {
            await navigator.clipboard.writeText(imagePrompt(material.prompt));
            updateMaterial(material.id, { error: '', copied: true });
          } catch {
            updateMaterial(material.id, { error: '复制失败，请手动复制提示词' });
          }
        }}>{material.copied ? '已复制提示词' : '复制提示词'}</button>
        <a href="https://chatgpt.com/" target="_blank" rel="noreferrer">在 ChatGPT 生图后上传</a>
      </>}
      {material.error && <p role="alert">{material.error}</p>}
      {material.image && <img src={material.image} alt="素材预览" style={{ width: '100%', maxHeight: 160, objectFit: 'contain' }} />}
      <label>上传图片<input type="file" accept="image/png,image/jpeg,image/webp"
        disabled={material.busy} onChange={event => loadMaterial(material, event.target.files[0])} /></label>
      {index > 0 && <button type="button" className="tl-action" onClick={() => {
        setMaterials(current => current.filter(item => item.id !== material.id)); setHtml('');
      }}>移除节点</button>}
    </>,
    material.id
  ]);
  nodes[3] = materialNodes[0];
  const additionalNodes = materialNodes.slice(1);
  const graphNodes = [...nodes, ...additionalNodes];
  const graphPositions = [...positions, ...additionalNodes.map((_, index) => [positions[3][0], 580 + index * 490])];
  const graphConnections = [...connections, ...additionalNodes.flatMap((_, index) => [
    [2, nodes.length + index, 0], [nodes.length + index, 4, 0]
  ])];

  return (
    <section className="tl-workflow-card">
      <form onSubmit={run}>
        <div className="tl-workflow-toolbar">
          <h2>海报工作流</h2>
          <button className="tl-action" disabled={status === '正在生成预览…'}>运行工作流</button>
          <button type="button" className="tl-action" onClick={() => setPositions(initialPositions)}>重置节点位置</button>
          <span role="status">{status}</span>
        </div>
        <div className="tl-workflow-viewport" tabIndex={0} aria-label="海报节点画布，可横向滚动">
          <div className="tl-workflow-canvas" style={{ minHeight: Math.max(1050, 620 + additionalNodes.length * 490) }}>
            <svg width="100%" height="100%" aria-hidden="true">
              {graphConnections.map(([from, to, port]) => {
                const [x, y] = graphPositions[from];
                const [targetX, targetY] = graphPositions[to];
                const startX = x + 230;
                const startY = y + 56;
                const endY = targetY + 56 + port * 24;
                const bend = Math.max(48, Math.abs(targetX - startX) / 2);
                return <path key={from + "-" + to} d={`M ${startX} ${startY} C ${startX + bend} ${startY}, ${targetX - bend} ${endY}, ${targetX} ${endY}`} stroke={from === 3 ? '#72d6f1' : '#a894ff'} strokeWidth="2" fill="none" />;
              })}
            </svg>
            {graphNodes.map(([name, content, id], index) => (
              <section key={id ?? name} className="tl-workflow-node" style={{ left: graphPositions[index][0], top: graphPositions[index][1] }}>
                <h3 onPointerDown={event => {
                  if (index >= nodes.length) return;
                  event.currentTarget.setPointerCapture(event.pointerId);
                  drag.current = { index, x: event.clientX - positions[index][0], y: event.clientY - positions[index][1] };
                }} onPointerMove={move} onLostPointerCapture={() => { drag.current = null; }}>{name}</h3>
                {index > 0 && <i className="tl-workflow-port input" />}
                {index !== 6 && <i className={`tl-workflow-port output ${index === 3 ? 'media' : ''}`} />}
                <div className="tl-workflow-node-content">{content}</div>
              </section>
            ))}
          </div>
        </div>
      </form>
    </section>
  );
}
