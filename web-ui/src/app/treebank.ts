export interface Treebank{
  id: string;
  title: string;
  userId?: string;
  email?: string;
  uploaded?: string;
  processed?: string;
  isPublic?: boolean;
}

// Do not know a proper name: any suggestions?
export interface TreebankInfo{
  slug: string;
  name: string;
  basex_db?: string,
  nrSentences: number,
  nrWords: number
}
