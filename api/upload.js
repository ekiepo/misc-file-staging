// Load local .env.local file if not in Vercel production environment
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  try {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.substring(1, value.length - 1);
          }
          process.env[key] = value;
        }
      });
    }
  } catch (err) {
    console.error('Failed to load local .env.local file:', err);
  }
}

const { handleUpload } = require('@vercel/blob/client');

module.exports = async function handler(request, response) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = request.body;

    if (!body) {
      return response.status(400).json({ error: 'Missing request body' });
    }

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname /*, clientPayload */) => {
        // Validation: Verify file extension is a video format
        const allowedExtensions = ['.mp4', '.mov', '.webm', '.avi', '.m4v'];
        const hasAllowedExtension = allowedExtensions.some(ext =>
          pathname.toLowerCase().endsWith(ext)
        );

        if (!hasAllowedExtension) {
          throw new Error('Upload blocked: Only video files (.mp4, .mov, .webm, .avi, .m4v) are allowed.');
        }

        // Return config options for client-side upload
        return {
          allowedContentTypes: [
            'video/mp4',
            'video/quicktime',
            'video/webm',
            'video/x-msvideo',
            'video/x-m4v'
          ],
          maximumSizeInBytes: 500 * 1024 * 1024, // 500MB maximum
          tokenPayload: JSON.stringify({
            uploadedAt: new Date().toISOString()
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Execute server-side hook on completion
        console.log('Vercel Blob upload completed successfully:', blob.url);
      },
    });

    return response.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Error during Vercel Blob token generation:', error);
    return response.status(400).json({ error: error.message });
  }
};
