async function test() {
  const url = 'https://maps.app.goo.gl/Zq3M1c4s2L7c2MvE9'; // Let's try to fetch this
  try {
    const res = await fetch(url, { redirect: 'follow' });
    const finalUrl = res.url;
    console.log('Final URL:', finalUrl);
    
    // Extract hex values
    const hexMatches = finalUrl.match(/0x[a-f0-9]+/ig);
    if (hexMatches && hexMatches.length >= 2) {
      // The CID is usually the last hex match in the !1s...:0x... block.
      // Better regex: /!1s(0x[a-f0-9]+):(0x[a-f0-9]+)/i
      const match = finalUrl.match(/!1s(0x[a-f0-9]+):(0x[a-f0-9]+)/i);
      if (match) {
         const cidHex = match[2];
         const cid = BigInt(cidHex).toString();
         console.log('Found CID:', cid);
         console.log('Review URL:', `https://search.google.com/local/writereview?cid=${cid}`);
      } else {
         console.log('Regex block not found. All hexes:', hexMatches);
      }
    }
  } catch (e) {
    console.error(e);
  }
}
test();
