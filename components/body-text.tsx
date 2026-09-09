import { PretextSpread } from '@/components/pretext-spread';

type BodyTextProps = {
  lead?: string;
  text: string;
  columns?: 1 | 2;
};

export function BodyText({ lead = 'H', text, columns = 2 }: BodyTextProps) {
  return <PretextSpread lead={lead} text={text} columns={columns} />;
}
