export default class {
  pos;
  size;
  speed;
  frames;
  _index;
  url: string;
  dir;
  once: boolean;
  done: boolean;
  resources: any;

  constructor(url, pos, size, speed, frames, dir, once, resources) {
    this.pos = pos;
    this.size = size;
    this.speed = typeof speed === 'number' ? speed : 0;
    this.frames = frames;
    this._index = 0;
    this.url = url;
    this.dir = dir || 'horizontal';
    this.once = once;
    this.resources = resources;
  }

  update(dt: number) {
    this._index += this.speed * dt;
  }

  render(ctx: CanvasRenderingContext2D) {
    let frame: number;

    if (this.speed > 0) {
      var max = this.frames.length;
      var idx = Math.floor(this._index);
      frame = this.frames[idx % max];

      if (this.once && idx >= max) {
        this.done = true;
        return;
      }
    } else {
      frame = 0;
    }

    var x = this.pos[0];
    var y = this.pos[1];

    if (this.dir == 'vertical') {
      y += frame * this.size[1];
    } else {
      x += frame * this.size[0];
    }

    ctx.drawImage(
      this.resources.get(this.url),
      x,
      y,
      this.size[0],
      this.size[1],
      0,
      0,
      this.size[0],
      this.size[1]
    );
  }
}
