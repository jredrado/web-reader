import 'react-app-polyfill/ie11';
import 'regenerator-runtime/runtime';
import * as React from 'react';
import { useState, useEffect } from 'react';

import ReactDOM from 'react-dom';
import {
  BrowserRouter,
  Switch,
  Route,
  Link,
  useParams,
} from 'react-router-dom';
import WebReader, { addTocToManifest } from '../src';
import {
  ChakraProvider,
  Heading,
  UnorderedList,
  ListItem,
  Box,
  Text,
  Input,
  Button,
  IconButton,
  Stack,
  Flex,
  Collapse,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  useDisclosure,
} from '@chakra-ui/react';

import { FaChevronRight, FaChevronLeft, FaCog } from 'react-icons/fa';

//import { ChevronRightIcon, ChevronLeftIcon } from '@chakra-ui/icons';

import { getTheme } from '../src/ui/theme';
import readiumBefore from 'url:../src/HtmlReader/ReadiumCss/ReadiumCSS-before.css';
import readiumDefault from 'url:../src/HtmlReader/ReadiumCss/ReadiumCSS-default.css';
import readiumAfter from 'url:../src/HtmlReader/ReadiumCss/ReadiumCSS-after.css';
import Tests from './Tests';
import { Injectable } from '../src/Readium/Injectable';

import UseHtmlReader from './use-html-reader';
import mobyEpub2Manifest from './static/samples/moby-epub2-exploded/manifest.json';
import pdfSingleResourceManifest from './static/samples/pdf/single-resource-short.json';
import { WebpubManifest } from '../src/types';
import UsePdfReader from './use-pdf-reader';

import { PublicationList } from './PublicationList';
import { Viewer } from './Viewer';
import { OPDS } from './types';

const origin = window.location.origin;

const pdfProxyUrl = process.env.CORS_PROXY_URL as string | undefined;
const pdfWorkerSrc = `${origin}/pdf-worker/pdf.worker.min.js`;

const cssInjectables: Injectable[] = [
  /*
  {
    type: 'style',
    url: readiumBefore,
  },
  {
    type: 'style',
    url: readiumDefault,
  },
  {
    type: 'style',
    url: readiumAfter,
  },
  */
];

const fontInjectable: Injectable[] = [
  {
    type: 'style',
    url: `${origin}/fonts/opendyslexic/opendyslexic.css`,
    fontFamily: 'opendyslexic',
  },
];

const scriptInjectable: Injectable[] = [
  {
    type: 'script',
    url: `${origin}/js/sample.js`,
  },
];

const htmlInjectablesReflowable = [
  ...cssInjectables,
  ...fontInjectable,
  ...scriptInjectable,
];

const App = () => {
  return (
    <ChakraProvider theme={getTheme('day')}>
      <BrowserRouter>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route exact path="/manifest">
            <Manifest />
          </Route>
          <Route path="/html">
            <HtmlReaders />
          </Route>

          <Route path="*">
            <h1>404</h1>
            <p>Page not found.</p>
          </Route>
        </Switch>
      </BrowserRouter>
    </ChakraProvider>
  );
};

/**
 * This is a function we will use to get the resource through a given proxy url.
 * It will eventually be passed to the web reader instead of passing a proxy url directly.
 */
const getProxiedResource = (proxyUrl?: string) => async (href: string) => {
  // Generate the resource URL using the proxy
  const url: string = proxyUrl
    ? `${proxyUrl}${encodeURIComponent(href)}`
    : href;
  const response = await fetch(url, { mode: 'cors' });
  const array = new Uint8Array(await response.arrayBuffer());

  if (!response.ok) {
    throw new Error('Response not Ok for URL: ' + url);
  }
  return array;
};

/**
 * - Fetches manifest
 * - Adds the TOC to the manifest
 * - Generates a syncthetic url for the manifest to be passed to
 * web reader.
 * - Returns the synthetic url
 */

const HtmlReaders = () => {
  return (
    <Switch>
      <Route path={`/html/url/:manifestUrl`}>
        <DynamicReader />
      </Route>
      <Route path={`/html/test`}>
        <Tests />
      </Route>
    </Switch>
  );
};

const Manifest = () => {
  const [dynamicHref, setValue] = React.useState('');
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValue(event.target.value);
  return (
    <Box m={2}>
      <Heading as="h1">URS Reader</Heading>
      <Heading as="h2" fontSize={2} mt={3}>
        Bring your own manifest:
      </Heading>
      <UnorderedList p={4}>
        <ListItem>
          <Stack direction="row" alignItems="center">
            <Input
              maxW={500}
              value={dynamicHref}
              onChange={handleChange}
              placeholder="Webpub Manifest URL"
              mr={2}
            />
            <Button
              as={Link}
              to={`/html/url/${encodeURIComponent(dynamicHref)}`}
            >
              Go
            </Button>
          </Stack>
        </ListItem>
      </UnorderedList>
    </Box>
  );
};

const HomePage = () => {
  const [dynamicHref, setValue] = React.useState('');
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValue(event.target.value);
  return (
    <Box m={2}>
      <Heading as="h1">URS Reader</Heading>
      <Heading as="h2" fontSize={2} mt={3}>
        Generic Examples
      </Heading>
      <UnorderedList p={4}></UnorderedList>
    </Box>
  );
};

export const Home: React.FC = () => {
  const [publications, setPublications] = useState<OPDS | null>(null);
  const [selectedPublication, setSelectedPublication] = useState<
    OPDS['publications'][0] | null
  >(null);

  const {
    isOpen: isConfigOpen,
    onOpen: onConfigOpen,
    onClose: onConfigClose,
  } = useDisclosure();
  const {
    isOpen: isListOpen,
    onOpen: onListOpen,
    onClose: onListClose,
  } = useDisclosure();

  const [endpoint, setEndpoint] = useState('');

  const fetchPublications = async () => {
    try {
      const response = await fetch(endpoint + '/opds2/publications.json');
      const data = await response.json();
      setPublications(data.publications);
    } catch (error) {
      console.error('Error fetching publications:', error);
    }
  };

  if (!publications)
    return (
      <Flex p={5}>
        <IconButton
          aria-label="Configuración"
          icon={<FaCog />}
          onClick={onConfigOpen}
        />

        <Drawer
          placement="right"
          onClose={onConfigClose}
          isOpen={isConfigOpen}
          size="md"
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerHeader borderBottomWidth="1px">
              <IconButton
                aria-label="Configuración"
                icon={<FaChevronRight />}
                onClick={onConfigClose}
              />
            </DrawerHeader>
            <DrawerBody>
              <Box mb={4}>
                <Input
                  placeholder="API endpoint"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                />
              </Box>
              <Button onClick={fetchPublications}>Set API</Button>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Flex>
    );

  return (
    <Flex p={5}>
      <IconButton
        aria-label="Mostrar publicaciones"
        icon={<FaChevronRight />}
        onClick={onListOpen}
      />

      <Drawer
        placement="left"
        onClose={onListClose}
        isOpen={isListOpen}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">
            <IconButton
              aria-label="Cerrar"
              icon={<FaChevronLeft />}
              onClick={onListClose}
            />
          </DrawerHeader>
          <DrawerBody>
            <PublicationList
              publications={publications}
              onSelect={(pub) => {
                setSelectedPublication(pub);
                onListClose();
              }}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Box flex={1}>
        {selectedPublication && <Viewer publication={selectedPublication} />}
      </Box>

      <IconButton
        aria-label="Configuración"
        icon={<FaCog />}
        onClick={onConfigOpen}
      />

      <Drawer
        placement="right"
        onClose={onConfigClose}
        isOpen={isConfigOpen}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">
            <IconButton
              aria-label="Configuración"
              icon={<FaChevronRight />}
              onClick={onConfigClose}
            />
          </DrawerHeader>
          <DrawerBody>
            <Box mb={4}>
              <Input
                placeholder="API endpoint"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
              />
            </Box>
            <Button onClick={fetchPublications}>Set API</Button>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
};

const DynamicReader: React.FC = () => {
  const { manifestUrl } = useParams<{ manifestUrl: string }>();
  const decoded = decodeURIComponent(manifestUrl);
  return (
    <WebReader
      injectablesReflowable={htmlInjectablesReflowable}
      webpubManifestUrl={decoded}
    />
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
