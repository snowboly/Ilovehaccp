import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'iLoveHACCP - Free HACCP Plan Generator';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
            display: 'flex',
          }}
        />

        {/* Content Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 60px',
            position: 'relative',
          }}
        >
          {/* Logo/Brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#6366f1',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px',
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <span
              style={{
                fontSize: '48px',
                fontWeight: 800,
                color: 'white',
                letterSpacing: '-0.02em',
              }}
            >
              iLoveHACCP
            </span>
          </div>

          {/* Main Heading */}
          <div
            style={{
              fontSize: '56px',
              fontWeight: 900,
              color: 'white',
              textAlign: 'center',
              lineHeight: 1.1,
              marginBottom: '16px',
              maxWidth: '900px',
            }}
          >
            Free HACCP Plan Generator
          </div>

          {/* Subheading */}
          <div
            style={{
              fontSize: '28px',
              color: '#94a3b8',
              textAlign: 'center',
              maxWidth: '700px',
              lineHeight: 1.4,
            }}
          >
            EU & UK Compliant Food Safety Plans for Restaurants, Manufacturers & Food Businesses
          </div>

          {/* Features Row */}
          <div
            style={{
              display: 'flex',
              gap: '32px',
              marginTop: '40px',
            }}
          >
            {['EC 852/2004 Compliant', 'PDF & Word Export', 'AI-Powered'].map((feature) => (
              <div
                key={feature}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  padding: '12px 24px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginRight: '8px' }}
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span style={{ color: 'white', fontSize: '18px', fontWeight: 600 }}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* URL at bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span style={{ color: '#64748b', fontSize: '20px' }}>
            www.ilovehaccp.com
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
