export default function PrivacyPage() {
  return (
    <main style={{ padding: "40px", fontFamily: "Arial, sans-serif", lineHeight: 1.6 }}>
      <h1>Privacy Policy</h1>
      <p>Last updated: April 2026</p>

      <h2>1. Overview</h2>
      <p>
        YPLORE is a social media scheduling and publishing tool. This Privacy Policy
        explains what data we collect, how we use it, and how we protect it.
      </p>

      <h2>2. Data We Collect</h2>
      <p>
        We may collect and store:
      </p>
      <ul>
        <li>Account identifiers (e.g., platform user IDs)</li>
        <li>Access tokens required to interact with connected platforms</li>
        <li>Video metadata such as captions, scheduled times, and platform selection</li>
      </ul>

      <h2>3. How We Use Data</h2>
      <p>
        The collected data is used solely to:
      </p>
      <ul>
        <li>Connect user accounts to supported platforms</li>
        <li>Schedule and publish video content on behalf of the user</li>
        <li>Manage and display scheduled posts within the application</li>
      </ul>

      <h2>4. TikTok API Usage</h2>
      <p>
        YPLORE uses the official TikTok API to publish content. Data accessed from
        TikTok is used only for the functionality of scheduling and publishing videos.
        We do not store or use TikTok data for any other purpose.
      </p>

      <h2>5. Data Sharing</h2>
      <p>
        We do not sell or share user data with third parties. Data is only transmitted
        to platform APIs (e.g., TikTok, YouTube, Instagram) to perform user-authorized actions.
      </p>

      <h2>6. Data Security</h2>
      <p>
        We take reasonable technical measures to protect stored data, including access
        tokens and account identifiers.
      </p>

      <h2>7. User Control</h2>
      <p>
        Users can revoke access at any time through the respective platform settings.
      </p>

      <h2>8. Contact</h2>
      <p>
        For privacy-related questions, contact: support@yplore.com
      </p>
    </main>
  );
}