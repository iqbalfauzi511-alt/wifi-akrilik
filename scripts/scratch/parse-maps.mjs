const url = 'https://maps.app.goo.gl/Zq3M1c4s2L7c2MvE9'; // Random shortlink if I can find one? I'll use a known one or just search for coffee shop in maps.
// Let's use a real full url
const fullUrl = 'https://www.google.com/maps/place/Kopi+Kenangan+-+Epicentrum+Walk/@-6.2195244,106.8329618,17z/data=!3m1!4b1!4m6!3m5!1s0x2e69f4083a24180d:0x2d1f736636737f19!8m2!3d-6.2195244!4d106.8355367!16s%2Fg%2F11h9_55yv3?entry=ttu';
console.log('Hex CID part:', fullUrl.match(/0x[a-fA-F0-9]+/g));
