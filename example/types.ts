export interface OPDS {
  metadata: {
    title: string;
  };
  links: {
    type: string;
    rel: string;
    href: string;
  }[];
  publications: {
    metadata: {
      '@type': string;
      title: string;
      identifier: string;
      author: { name: string }[];
      language: string[];
    };
    links: {
      type: string;
      rel: string;
      href: string;
    }[];
    images?: {
      type: string;
      height: number;
      width: number;
      href: string;
    }[];
  }[];
}
