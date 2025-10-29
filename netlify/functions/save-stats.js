// Netlify Function to save dashboard stats
// For immediate cross-device sync, this will update the public JSON file
// Note: In production, consider using Netlify KV or a database for better persistence
exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const stats = JSON.parse(event.body);
    
    // Validate stats structure
    const requiredFields = [
      'totalExperiences', 'totalProducts', 'totalGalleries', 'raptorDelivered',
      'inProgress', 'failed', 'readyForAutopost', 'weeklyGoal', 'weeklyAvailable',
      'weeklyRaptor', 'weeklyNonRaptor', 'qcReviewed', 'qcApproved', 'qcRejected',
      'triageReviewed', 'triageNoPost', 'triagePlatformPost', 'triageStuck', 'triageReshoots'
    ];
    
    for (const field of requiredFields) {
      if (!(field in stats)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Missing field: ${field}` }),
        };
      }
    }

    // Save to GitHub repository file (public/data/stats.json)
    // Uses existing GitHub account - no new service needed!
    const githubToken = process.env.GITHUB_TOKEN;
    const githubRepo = process.env.GITHUB_REPO; // Format: "username/repo-name"
    const githubBranch = process.env.GITHUB_BRANCH || 'main';
    
    let saveSuccess = false;
    let saveMessage = 'Stats cached locally only';
    
    if (githubToken && githubRepo) {
      try {
        // First, get the current file to get its SHA (required for update)
        const getFileResponse = await fetch(
          `https://api.github.com/repos/${githubRepo}/contents/public/data/stats.json?ref=${githubBranch}`,
          {
            headers: {
              'Authorization': githubToken.startsWith('Bearer ') ? githubToken : `token ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          }
        );
        
        let sha = null;
        if (getFileResponse.ok) {
          const fileData = await getFileResponse.json();
          sha = fileData.sha; // Required for updating existing file
        }
        
        // Update the file in GitHub
        const fileContent = JSON.stringify(stats, null, 2);
        const base64Content = Buffer.from(fileContent).toString('base64');
        
        // Prepare the update payload
        const updatePayload = {
          message: 'Update dashboard stats',
          content: base64Content,
          branch: githubBranch,
        };
        
        // Only include SHA if file exists (for update), omit for new file creation
        if (sha) {
          updatePayload.sha = sha;
        }
        
        const updateResponse = await fetch(
          `https://api.github.com/repos/${githubRepo}/contents/public/data/stats.json`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `token ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatePayload),
          }
        );
        
        if (updateResponse.ok) {
          saveSuccess = true;
          saveMessage = 'Stats saved to GitHub and synced across all devices';
          console.log('Successfully updated stats.json in GitHub repository');
        } else {
          const errorText = await updateResponse.text();
          console.error('GitHub API error:', updateResponse.status, errorText);
          saveMessage = `Failed to save to GitHub: ${updateResponse.status}`;
        }
      } catch (githubError) {
        console.error('Error saving to GitHub:', githubError);
        saveMessage = 'GitHub API unavailable, stats cached locally only';
      }
    } else {
      console.log('GitHub not configured. To enable cross-device sync:');
      console.log('1. Create a GitHub Personal Access Token with repo permissions');
      console.log('2. Set GITHUB_TOKEN, GITHUB_REPO (format: "username/repo"), and optionally GITHUB_BRANCH in Netlify environment variables');
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: saveMessage,
        synced: saveSuccess,
        stats: stats // Return the stats so client knows save was acknowledged
      }),
    };
  } catch (error) {
    console.error('Error saving stats:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to save stats' }),
    };
  }
};

