import "./globals.css";

const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX || '';
export const metadata = {
  title: "Busy Simulator 2.0",
  description: "Revamp of the original Busy Simulator, a web app that simulates busy work with repetitive sounds.",
  icons: {
    icon: `${assetPrefix}/favicon-16x16.png`,
  },
};

export default function RootLayout({ children }) {
  return (
    <>
      <html lang="en">
        <body style={{ background: `url('${assetPrefix}/bg.jpg') no-repeat center center fixed` }}>
          {children}
        </body>
      </html>
    </>
  );
}
