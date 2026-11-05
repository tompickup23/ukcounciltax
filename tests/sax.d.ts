// Minimal types for the strict XML parser the feed test uses (sax, installed with svgo).
declare module "sax" {
  interface Tag { name: string; attributes: Record<string, string> }
  interface SAXParser {
    onopentag: (node: Tag) => void;
    ontext: (text: string) => void;
    onclosetag: (name: string) => void;
    onerror: (error: Error) => void;
    write(xml: string): SAXParser;
    close(): SAXParser;
  }
  const sax: { parser(strict: boolean): SAXParser };
  export default sax;
}
