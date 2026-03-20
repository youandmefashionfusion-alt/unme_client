import { Poppins } from "next/font/google";
import "./globals.css";
import Footer from "../../components/Footer/Footer";
import { Toaster } from "react-hot-toast";
import { Providers } from "../lib/Providers";
import AOSInitializer from "../../components/AOSInitializer";
import NotificationManager from "../../components/NotificationManager";
import Script from "next/script";
import DataLayerScript from "../../components/DataLayerScript";
import SnowEffect from "../../components/snoweffect/SnowEffect";
import HeaderWrapper from "../../components/Header/HeaderWrapper";

export const dynamic = "force-dynamic";

const poppins = Poppins({
  subsets: ["latin"],
  display: 'swap',
  weight: ['400', '500', '600']
});

export const metadata = {
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google-site-verification" content="qsmeH-k0DsAR6xw5U6PQTgUW01HR2ghV0hxxAI_6jZE" />
        <meta name="google-site-verification" content="Ao4Enirx-4NZwmP4LNCqUnUXEFkp6YS7m0GgGWzqgiA" />
        {/* Partytown Script - Load first */}
        <Script
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              partytown = {
                forward: ['dataLayer.push', 'fbq', 'gtag', 'clarity'],
                resolveUrl: function(url) {
                  if (url.hostname === 'www.googletagmanager.com') {
                    var proxyUrl = new URL('https://cdn.builder.io/api/v1/proxy-api');
                    proxyUrl.searchParams.append('url', url.href);
                    return proxyUrl;
                  }
                  return url;
                }
              };
            `,
          }}
        />
      </head>

      <body className={poppins.variable}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PDNP73X9"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Toaster position="top-center" reverseOrder={false} />
        <Providers>
          <HeaderWrapper />
          <DataLayerScript />
          {/* <SnowEffect/> */}
          {children}
          <NotificationManager />
          <AOSInitializer />
          <Footer />
        </Providers>

        {/* All analytics scripts with Partytown - runs in Web Worker */}
        <Script
          type="text/partytown"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){
                w[l]=w[l]||[];
                w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
                var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),
                    dl=l!='dataLayer'?'&l='+l:'';
                j.async=true;
                j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-PDNP73X9');
            `,
          }}
        />

        {/* Google Analytics with Partytown */}
        <Script
          type="text/partytown"
          src="https://www.googletagmanager.com/gtag/js?id=G-M3JKK185BH"
          strategy="worker"
        />
        <Script
          id="ga-setup"
          type="text/partytown"
          strategy="worker"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-M3JKK185BH');
            `,
          }}
        />
        {/* Facebook Pixel */}
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');

              // Initialize Pixel
              fbq('init', '1400371481676465');

              // Capture fbclid if available
              (function() {
                const urlParams = new URLSearchParams(window.location.search);
                const fbclid = urlParams.get('fbclid');
                if (fbclid) {
                  localStorage.setItem('fbclid', fbclid);
                  document.cookie = "fbclid=" + fbclid + "; path=/";
                }
              })();

              // Add fbclid to PageView event if available
              const storedFbclid = localStorage.getItem('fbclid');
              if (storedFbclid) {
                fbq('track', 'PageView', { fbclid: storedFbclid });
              } else {
                fbq('track', 'PageView');
              }
            `,
          }}
        />

        <Script
          id="fbclid-capture"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const urlParams = new URLSearchParams(window.location.search);
                const fbclid = urlParams.get('fbclid');
                if (fbclid) {
                  // Store in localStorage for persistence
                  localStorage.setItem('fbclid', fbclid);
                  // Also store in cookie for server-side (CAPI)
                  document.cookie = "fbclid=" + fbclid + "; path=/";
                }
              })();
            `,
          }}
        />

        {/* Microsoft Clarity with Partytown */}
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "uryy6kz9ts");
            `,
          }}
        />
      </body>
    </html>
  );
}
