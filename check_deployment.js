const https = require('https');

const url = 'https://gp.senecoins.com/';
const options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
};

console.log('Fetching ' + url + '...');

https.get(url, options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        // Check HTML content
        if (data.includes('lang="fr-SN"')) {
            console.log('✅ HTML: New SEO deployment confirmed (lang="fr-SN").');
        } else {
            console.log('⚠️ HTML: New SEO deployment NOT detected (lang="fr-SN" missing).');
        }

        if (data.includes('gp-backend-skwd.onrender.com')) {
            console.log('✅ HTML: Found Render URL in HTML.');
        }

        // Find ALL JS files
        const scriptRegex = /_next\/static\/chunks\/[a-zA-Z0-9\-\.\/]+\.js/g;
        // Also look for src="..."
        const srcRegex = /src="(\/_next\/static\/chunks\/[^"]+\.js)"/g;

        let scripts = [];
        let match;
        while ((match = srcRegex.exec(data)) !== null) {
            scripts.push(match[1]);
        }

        // Also try simple match if regex failed
        if (scripts.length === 0) {
            const simpleMatches = data.match(scriptRegex) || [];
            scripts = [...scripts, ...simpleMatches];
        }

        // Deduplicate
        scripts = [...new Set(scripts)];

        console.log(`Found ${scripts.length} script files.`);

        if (scripts.length === 0) {
            console.log("No scripts found. HTML preview:");
            console.log(data.substring(0, 500));
            return;
        }

        let completed = 0;
        let foundRender = false;
        let foundCloudfront = false;

        scripts.forEach(scriptPath => {
            const scriptUrl = 'https://gp.senecoins.com' + scriptPath;

            https.get(scriptUrl, options, (res2) => {
                let jsData = '';
                res2.on('data', (c) => jsData += c);
                res2.on('end', () => {
                    if (jsData.includes('gp-backend-skwd.onrender.com')) {
                        console.log(`✅ FOUND RENDER URL in ${scriptPath}`);
                        foundRender = true;
                    }
                    if (jsData.includes('d2fy4fjpaisnki.cloudfront.net')) {
                        console.log(`❌ FOUND OLD CLOUDFRONT URL in ${scriptPath}`);
                        foundCloudfront = true;
                    }
                    if (jsData.includes('localhost:5000')) {
                        console.log(`ℹ️ FOUND LOCALHOST URL in ${scriptPath} (fallback?)`);
                    }

                    completed++;
                    if (completed === scripts.length) {
                        console.log('\n--- FINAL DIAGNOSIS ---');
                        if (foundRender) {
                            console.log('✅ SUCCESS: The deployed code contains the NEW backend URL (Render).');
                            console.log('   The site should be working. Try clearing your browser cache.');
                        } else if (foundCloudfront) {
                            console.log('❌ FAILURE: The deployed code still contains the OLD backend URL (CloudFront).');
                            console.log('   Likely cause: You saved the Env Var but did NOT Redeploy, or the build is still running.');
                            console.log('   Action: Go to Amplify Console -> Main Branch -> Redeploy.');
                        } else {
                            console.log('⚠️ UNKNOWN: Could not find any backend URL in the scripts.');
                            console.log('   This might mean the Env Var is missing or defaulted to localhost.');
                        }
                    }
                });
            }).on('error', (e) => console.error(`Error fetching script ${scriptUrl}: ${e.message}`));
        });
    });

}).on('error', (err) => {
    console.log('Error: ' + err.message);
});
