// Netlify Function to get dashboard stats
// For persistence across devices, uses a JSON storage approach
// Falls back to default stats if no stored data is found
exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Default stats
    const defaultStats = {
      totalExperiences: '58851',
      totalProducts: '28475',
      totalGalleries: '26079',
      raptorDelivered: '21170',
      inProgress: '1538',
      failed: '636',
      readyForAutopost: '104',
      weeklyGoal: '5979',
      weeklyAvailable: '4922',
      weeklyRaptor: '2853',
      weeklyNonRaptor: '2070',
      qcReviewed: '4229',
      qcApproved: '1554',
      qcRejected: '2675',
      triageReviewed: '1600',
      triageNoPost: '18.6',
      triagePlatformPost: '67.7',
      triageStuck: '11.5',
      triageReshoots: '2.2',
    };

    let stats = defaultStats;

    // Try to read from GitHub repository file (public/data/stats.json)
    // Uses existing GitHub account - no new service needed!
    const githubToken = process.env.GITHUB_TOKEN;
    const githubRepo = process.env.GITHUB_REPO; // Format: "username/repo-name"
    const githubBranch = process.env.GITHUB_BRANCH || 'main';
    
    if (githubToken && githubRepo) {
      try {
        // Try to get the latest file content from GitHub
        const response = await fetch(
          `https://api.github.com/repos/${githubRepo}/contents/public/data/stats.json?ref=${githubBranch}`,
          {
            headers: {
              'Authorization': githubToken.startsWith('Bearer ') ? githubToken : `token ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          }
        );
        
        if (response.ok) {
          const fileData = await response.json();
          // GitHub API returns file content as base64 encoded
          const fileContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
          const parsedStats = JSON.parse(fileContent);
          stats = parsedStats;
        }
      } catch (githubError) {
        console.log('GitHub API not available or not configured, trying fallbacks...', githubError.message);
      }
    }
    
    // Fallback: Try to read from environment variable
    if (stats === defaultStats) {
      try {
        const storedStats = process.env.DASHBOARD_STATS;
        if (storedStats) {
          stats = JSON.parse(storedStats);
        }
      } catch (e) {
        console.log('Could not read from environment variable, using defaults');
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(stats),
    };
  } catch (error) {
    console.error('Error reading stats:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch stats' }),
    };
  }
};
