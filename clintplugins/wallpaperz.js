import fetch from 'node-fetch';
import { zokou } from '../framework/zokou.js';

zokou(
  {
    nomCom: 'wallpaper',
    categorie: 'Search',
    reaction: '🖼️',
    description: 'Search for high-quality wallpapers'
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg } = commandeOptions;

    try {
      console.log('DEBUG - wallpaper triggered:', { arg });

      // Validate input
      if (!arg[0]) {
        return repondre(`TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Please provide a search query!\n│❒ Example: .wallpaper nature sunset\n◈━━━━━━━━━━━━━━━━◈`);
      }

      const query = arg.join(' ').trim();
      
      // Validate query length
      if (query.length > 50) {
        return repondre(`TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Query too long! Max 50 characters\n◈━━━━━━━━━━━━━━━━◈`);
      }

      const apiUrl = `https://api.giftedtech.web.id/api/search/wallpaper?apikey=gifted&query=${encodeURIComponent(query)}`;

      await repondre(`TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Searching for "${query}" wallpapers... 🔍\n◈━━━━━━━━━━━━━━━━◈`);

      // Fetch with timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Validate API response
      if (!data?.results?.length) {
        return repondre(`TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ No wallpapers found for "${query}"\n│❒ Try different keywords\n◈━━━━━━━━━━━━━━━━◈`);
      }

      // Filter for valid image URLs
      const validResults = data.results.filter(result => 
        result.image && result.image.length > 0
      );

      if (validResults.length === 0) {
        return repondre(`TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ No valid wallpapers available\n◈━━━━━━━━━━━━━━━━◈`);
      }

      // Select random result and best quality image
      const randomResult = validResults[Math.floor(Math.random() * validResults.length)];
      const imageUrl = randomResult.image.find(url => url.includes('_w635')) || 
                      randomResult.image.find(url => url.includes('_w480')) || 
                      randomResult.image[0];

      await zk.sendMessage(
        dest,
        {
          image: { url: imageUrl },
          caption: `TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ ${query.toUpperCase()} WALLPAPER\n│❒ Type: ${randomResult.type || 'Unknown'}\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`
        },
        { quoted: ms }
      );

    } catch (error) {
      console.error('Wallpaper command error:', error);
      
      let errorMsg = `TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Error: `;
      
      if (error.name === 'AbortError') {
        errorMsg += 'Request timed out (15s)';
      } else {
        errorMsg += error.message || 'Failed to fetch wallpapers';
      }
      
      errorMsg += `\n◈━━━━━━━━━━━━━━━━◈`;
      
      await repondre(errorMsg);
    }
  }
);