import React from 'react';
import { List, ListItem, Box } from '@chakra-ui/react';
import { OPDS } from './types';

interface PublicationListProps {
  publications: OPDS['publications'];
  onSelect: (publication: OPDS['publications'][0]) => void;
}

export const PublicationList: React.FC<PublicationListProps> = ({
  publications,
  onSelect,
}) => {
  return (
    <Box mb={5}>
      <List spacing={3}>
        {publications.map((pub) => (
          <ListItem
            key={pub.metadata.identifier}
            onClick={() => onSelect(pub)}
            cursor="pointer"
            _hover={{ bg: 'gray.100' }}
          >
            {pub.metadata.title}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
