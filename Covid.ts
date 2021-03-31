export default class Covid {
  constructor(private url: string) {
    this.url = url;
  }
  async getData() {
    const res = await fetch(this.url);
    const out = await res.json();
    return out;
  }
}
