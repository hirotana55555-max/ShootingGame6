// game/components/Renderable.js
export class Renderable {
    /**
     * @param {string} color
     * @param {number} width
     * @param {number} height
     */
    constructor(color = 'white', width = 10, height = 10) {
      this.color = color;
      this.width = width;
      this.height = height;
    }
  }
  