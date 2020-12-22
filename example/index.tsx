import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';
import { WebReader, PdfManifest, WebpubManifest } from '../.';

const webpubManifest: WebpubManifest = {
  '@context': 'http://readium.org/webpub/default.jsonld',

  metadata: {
    '@type': 'http://schema.org/Book',
    title: 'Moby-Dick (webpub)',
    author: 'Herman Melville',
    identifier:
      'https://hadriengardeur.github.io/webpub-manifest/examples/MobyDick/',
    language: 'en',
    modified: '2018-02-10T17:00:00Z',
  },

  links: [
    {
      rel: 'cover',
      href: 'images/cover.jpg',
      type: 'image/jpeg',
      height: 1253,
      width: 797,
    },
    {
      rel: 'self',
      href:
        'http://hadriengardeur.github.io/webpub-manifest/examples/MobyDick/manifest.json',
      type: 'application/webpub+json',
    },
  ],

  spine: [
    { href: 'html/title.html', type: 'text/html', title: 'Title Page' },
    { href: 'html/copyright.html', type: 'text/html', title: 'Copyright' },
    { href: 'html/introduction.html', type: 'text/html', title: 'Etymology' },
    { href: 'html/epigraph.html', type: 'text/html', title: 'Extracts' },
    {
      href: 'html/c001.html',
      type: 'text/html',
      title: 'Chapter 1 - Loomings',
    },
    {
      href: 'html/c002.html',
      type: 'text/html',
      title: 'Chapter 2 - The Carpet-Bad',
    },
    {
      href: 'html/c003.html',
      type: 'text/html',
      title: 'Chapter 3 - The Spouter-Inn',
    },
    {
      href: 'html/c004.html',
      type: 'text/html',
      title: 'Chapter 4 - The Counterpane',
    },
    {
      href: 'html/c005.html',
      type: 'text/html',
      title: 'Chapter 5 - Breakfast',
    },
    {
      href: 'html/c006.html',
      type: 'text/html',
      title: 'Chapter 6 - The Street',
    },
  ],

  resources: [
    {
      href: 'html/toc.html',
      rel: 'contents',
      type: 'text/html',
      title: 'Table of Contents',
    },
    { href: 'css/mobydick.css', type: 'text/css' },
    { href: 'fonts/STIXGeneral.otf', type: 'application/vnd.ms-opentype' },
    { href: 'fonts/STIXGeneralBol.otf', type: 'application/vnd.ms-opentype' },
    {
      href: 'fonts/STIXGeneralBolIta.otf',
      type: 'application/vnd.ms-opentype',
    },
    {
      href: 'fonts/STIXGeneralItalic.otf',
      type: 'application/vnd.ms-opentype',
    },
  ],
};

const pdfManifest: PdfManifest = {
  '@context': 'pdf',
  metadata: {
    author: 'Herman Melville',
    title: 'Moby Dick (pdf)',
  },
  spine: [
    {
      href:
        'https://onemorelibrary.com/index.php/en/?option=com_djclassifieds&format=raw&view=download&task=download&fid=16720',
      type: 'application/pdf',
      title: 'Full PDF',
    },
  ],
};

const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/pdf">
          <WebReader manifest={pdfManifest} />
        </Route>
        <Route path="/webpub">
          <WebReader manifest={webpubManifest} />
        </Route>
        <Route path="/">
          <h1>Web Reader Proof of Concept</h1>
          <ul>
            <li>
              <Link to="/pdf">Pdf Example</Link>
            </li>
            <li>
              <Link to="/webpub">Webpub Example</Link>
            </li>
          </ul>
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
