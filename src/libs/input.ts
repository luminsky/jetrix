export default class {
  private pressedKeys = {};

  constructor() {
    document.addEventListener('keydown', (e) => this.setKey(e, true));

    document.addEventListener('keyup', (e) => this.setKey(e, false));

    window.addEventListener('blur', () => (this.pressedKeys = {}));
  }

  private setKey(event: KeyboardEvent, status: any) {
    let code: number = event.keyCode;
    let key: string;

    switch (code) {
      case 32:
        key = 'SPACE';
        break;
      case 37:
        key = 'LEFT';
        break;
      case 38:
        key = 'UP';
        break;
      case 39:
        key = 'RIGHT';
        break;
      case 40:
        key = 'DOWN';
        break;
      default:
        // Convert ASCII codes to letters
        key = String.fromCharCode(code);
    }

    this.pressedKeys[key] = status;
  }

  public isDown(key: string) {
    return this.pressedKeys[key.toUpperCase()];
  }
}
