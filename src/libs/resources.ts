type url = string;

export default class {
  private resourceCache = {};
  private readyCallbacks = [];

  constructor() {}

  load(urlOrArr: url | url[]) {
    if (urlOrArr instanceof Array) {
      urlOrArr.forEach((url) => {
        this._load(url);
      });
    } else {
      this._load(urlOrArr);
    }
  }

  _load(url: string) {
    if (this.resourceCache[url]) {
      return this.resourceCache[url];
    } else {
      let img = new Image();
      img.onload = () => {
        this.resourceCache[url] = img;

        if (this.isReady()) {
          this.readyCallbacks.forEach((func) => {
            func();
          });
        }
      };
      this.resourceCache[url] = false;
      img.src = url;
    }
  }

  get(url: string) {
    return this.resourceCache[url];
  }

  isReady() {
    for (let k in this.resourceCache) {
      if (this.resourceCache.hasOwnProperty(k) && !this.resourceCache[k]) {
        return false;
      }
    }

    return true;
  }

  onReady(func: Function) {
    this.readyCallbacks.push(func);
  }
}
