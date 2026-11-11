import '../css/app.css';
import '../css/mfm-theme.css';
import {createInertiaApp} from '@inertiajs/react';
import {resolvePageComponent} from 'laravel-vite-plugin/inertia-helpers';
import {createRoot} from 'react-dom/client';
createInertiaApp({
 title:title=>`${title} · MFM Youth Church CRM`,
 resolve:name=>resolvePageComponent(`./Pages/${name}.tsx`,import.meta.glob('./Pages/**/*.tsx')),
 setup({el,App,props}){createRoot(el).render(<App {...props}/>);},
 progress:{color:'var(--brand-primary)',showSpinner:false}
});
