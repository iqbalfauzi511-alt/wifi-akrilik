const Jimp = require('jimp');

async function removeWhiteBg() {
  try {
    console.log('Loading logo.png...');
    const image = await Jimp.read('./public/logo.png');
    
    const targetColor = {r: 255, g: 255, b: 255, a: 255};
    const replaceColor = {r: 0, g: 0, b: 0, a: 0};
    const colorDistance = (c1, c2) => {
      return Math.sqrt(
        Math.pow(c1.r - c2.r, 2) + 
        Math.pow(c1.g - c2.g, 2) + 
        Math.pow(c1.b - c2.b, 2)
      );
    };

    console.log('Processing pixels...');
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const thisColor = {
        r: this.bitmap.data[idx + 0],
        g: this.bitmap.data[idx + 1],
        b: this.bitmap.data[idx + 2],
        a: this.bitmap.data[idx + 3]
      };
      
      // If color is close to white, make it transparent
      if (colorDistance(targetColor, thisColor) < 60) {
        // Create smooth alpha transition for anti-aliasing
        const dist = colorDistance(targetColor, thisColor);
        if (dist < 10) {
            this.bitmap.data[idx + 3] = 0;
        } else {
            this.bitmap.data[idx + 3] = Math.floor((dist / 60) * 255);
        }
      }
    });

    console.log('Saving as logo_transparent.png...');
    await image.writeAsync('./public/logo_transparent.png');
    
    // Backup original and replace
    const fs = require('fs');
    fs.renameSync('./public/logo.png', './public/logo_backup.png');
    fs.renameSync('./public/logo_transparent.png', './public/logo.png');
    
    console.log('Done! Background removed successfully.');
  } catch (error) {
    console.error('Error:', error);
  }
}

removeWhiteBg();
