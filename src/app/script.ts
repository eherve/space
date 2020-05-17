import { environment } from '../environments/environment';

export function googleAnalyticsHeadScripts() {
  const head = document.getElementsByTagName('head')[0];

  const googleAnalyticsFirstScript = document.createElement('script');
  googleAnalyticsFirstScript.async = true;
  googleAnalyticsFirstScript.src = `https://www.googletagmanager.com/gtag/js?id=${environment.gga}`;

  const googleAnalyticsSecondScript = document.createElement('script');
  googleAnalyticsSecondScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag(\'js\', new Date());
      gtag(\'config\', \'${environment.gga}\');
    `;

  head.insertBefore(googleAnalyticsSecondScript, head.firstChild);
  head.insertBefore(googleAnalyticsFirstScript, head.firstChild);
}