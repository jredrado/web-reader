import React from 'react';
import { Box, Heading } from '@chakra-ui/react';
import { OPDS } from './types';
import WebReader, { addTocToManifest } from '../src';

interface ViewerProps {
  publication: OPDS['publications'][0];
}

export const Viewer: React.FC<ViewerProps> = ({ publication }) => {
  const acquisitionLink = publication.links.find(
    (link) => link.rel === 'http://opds-spec.org/acquisition'
  );

  return (
    <Box>
      {acquisitionLink && (
        <WebReader webpubManifestUrl={acquisitionLink.href} />
      )}
    </Box>
  );
};
