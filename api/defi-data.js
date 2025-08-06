export default async function handler(req, res) {
  // Enable CORS for your dashboard
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
  
  try {
    const data = {
      timestamp: new Date().toISOString(),
      sources: {}
    };
    
    // Fetch rETH price from CoinGecko
    try {
      const cgResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=rocket-pool-eth,ethereum&vs_currencies=usd&include_market_cap=true'
      );
      if (cgResponse.ok) {
        data.sources.coingecko = await cgResponse.json();
      }
    } catch (e) {
      console.log('CoinGecko fetch failed:', e.message);
    }
    
    // Fetch DeFi yields (you can add more sources here)
    try {
      const defiResponse = await fetch('https://yields.llama.fi/pools');
      if (defiResponse.ok) {
        const pools = await defiResponse.json();
        // Filter for rETH related pools
        data.sources.defillama = pools.data?.filter(pool => 
          pool.symbol?.toLowerCase().includes('reth') || 
          pool.pool?.toLowerCase().includes('rocket')
        ).slice(0, 20); // Limit to 20 pools
      }
    } catch (e) {
      console.log('DeFiLlama fetch failed:', e.message);
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch data',
      message: error.message 
    });
  }
}