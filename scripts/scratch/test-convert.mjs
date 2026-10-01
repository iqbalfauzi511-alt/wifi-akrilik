async function autoConvertMapsUrl(url) {
  if (!url) return url;
  
  // If it's already a review URL, do nothing
  if (url.includes('search.google.com/local/writereview') || url.includes('/review')) {
    return url;
  }
  
  const gPageMatch = url.match(/g\.page\/r\/([a-zA-Z0-9_-]+)/i);
  if (gPageMatch) {
    return `https://g.page/r/${gPageMatch[1]}/review`;
  }
  
  const cidHexMatch = url.match(/!1s(0x[a-f0-9]+):(0x[a-f0-9]+)/i);
  if (cidHexMatch) {
    try {
      const cidHex = cidHexMatch[2];
      const cid = BigInt(cidHex).toString();
      return `https://search.google.com/local/writereview?cid=${cid}`;
    } catch (e) {}
  }

  if (url.includes('goo.gl') || url.includes('maps.app.goo.gl')) {
    try {
       const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0' } });
       const html = await res.text();
       
       const cidHexMatchHtml = html.match(/!1s(0x[a-f0-9]+):(0x[a-f0-9]+)/i);
       if (cidHexMatchHtml) {
         const cidHex = cidHexMatchHtml[2];
         const cid = BigInt(cidHex).toString();
         return `https://search.google.com/local/writereview?cid=${cid}`;
       }
    } catch (e) {}
  }

  return url;
}

async function run() {
  const urls = [
    'https://maps.app.goo.gl/Zq3M1c4s2L7c2MvE9',
    'https://www.google.com/maps/place/Kopi+Kenangan+-+Epicentrum+Walk/@-6.2195244,106.8329618,17z/data=!3m1!4b1!4m6!3m5!1s0x2e69f4083a24180d:0x2d1f736636737f19!8m2!3d-6.2195244!4d106.8355367!16s%2Fg%2F11h9_55yv3?entry=ttu',
    'https://g.page/r/CUc123456789',
    'https://g.page/r/CUc123456789/review'
  ];
  for (let u of urls) {
    console.log(u, '=>', await autoConvertMapsUrl(u));
  }
}
run();
