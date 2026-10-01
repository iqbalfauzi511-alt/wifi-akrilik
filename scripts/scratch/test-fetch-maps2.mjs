async function test() {
  const url = 'https://maps.app.goo.gl/Zq3M1c4s2L7c2MvE9'; 
  try {
    const res = await fetch(url, { 
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    const finalUrl = res.url;
    console.log('Final URL:', finalUrl);
  } catch (e) {
    console.error(e);
  }
}
test();
