type StripedBox = {
  x : number;
  y : number;
  r : number;
  b : number;
}
type ColliderBox = StripedBox & { $t : JQuery };


type CollidersStorage = {
  ox : number;
  oy : number;
  w  : number;
  h  : number;
  colliders : ColliderBox[];
}

class Colliders {

  static colliders : [page : HTMLElement, colliders : ColliderBox[]][] = [];
  private static getColliders(page : HTMLElement) : ColliderBox[] {
    for(const d of Colliders.colliders) {
      if(d[0] === page)
        return d[1];
    }

    const $colliders = $(page).find('.colliders-layer' as JQuery.Selector).children();
    const newColliders : ColliderBox[] = new Array($colliders.length);
    for(let i = 0; i < $colliders.length; i++) {
      const $collider = $colliders.eq(i);
      const { left: x, width: w, top: y, height: h } = $collider.css(['left', 'width', 'top', 'height'])
      newColliders[i] = {
        x : pxToNum(x),
        r : pxToNum(x) + pxToNum(w),
        y : pxToNum(y),
        b : pxToNum(y) + pxToNum(h),
        $t: $collider,
      };
    }

    Colliders.colliders.push([page, newColliders]);
    return newColliders;
  }

  static storage : CollidersStorage = {
    ox: 0,
    oy: 0,
    w : 0,
    h : 0,
    colliders: undefined,
  };

  static hCollidersLayerClick(e : MouseEvent) {
    if(!Editor.storage.addOnClick)
      return;
    if(!(e.target as Node).parentElement.classList.contains('colliders-layer'))
      return;

    const $t = $(e.target).removeClass('ping');
    setTimeout(function() { $t.addClass('ping'); }, 100);
  }

  static beginDrag() {
    const cStorage = Colliders.storage;
    const eStorage = Editor.storage;

    const $target= eStorage.$target;

    const ox = pxToNum(eStorage.target.style.left);
    const oy = pxToNum(eStorage.target.style.top);
    eStorage.x = ox;
    eStorage.y = oy;
    cStorage.ox = ox;
    cStorage.oy = oy;

    cStorage.w = pxToNum($target.css('width') );
    cStorage.h = pxToNum($target.css('height'));

    const page = $target.parents('.page')[0];
    Snaplines.activateRelevantLines(page);
    cStorage.colliders = Colliders.getColliders(page);
  }

  static drag(dx, dy) : [nx : number, ny : number] {
    const cStorage = Colliders.storage;
    const eStorage = Editor.storage;

    eStorage.x += dx / Editor.transform.scale;
    eStorage.y += dy / Editor.transform.scale;

    const [snappedX, snappedY] = Snaplines.maybeSnap(eStorage.x, eStorage.y, cStorage.w, cStorage.h);

    [cStorage.ox, cStorage.oy] = Colliders.resolveCollisions(
      cStorage.ox, cStorage.oy, cStorage.w, cStorage.h,
      snappedX - cStorage.ox, snappedY - cStorage.oy,
      cStorage.colliders
    );

    return [cStorage.ox, cStorage.oy];
  }

  private static resolveCollisions(ox : number, oy : number, w : number, h: number, vx : number, vy : number, colliders : ColliderBox[]) : [ix : number, iy : number] {
    const hdx = vx / 2;
    const hdy = vy / 2;

    let ix = ox + hdx;
    let iy = oy + hdy;

    // (lucas 01.03.21) do the collision twice with halve the distance to stabilize the simulation
    for(const c of colliders) {
      if(Colliders.collides(ix, iy, ix + w, iy + h, c)) {
        c.$t.addClass('visible');

        [ix, iy] = Colliders.resolveCollisionsUnstable(ox, oy, ox + w, oy + h, hdx, hdy, c);
      } else
        c.$t.removeClass('visible');
    }

    for(const c of colliders) {
      if(Colliders.collides(ix, iy, ix + w, iy + h, c)) {
        c.$t.addClass('visible');

        [ix, iy] = Colliders.resolveCollisionsUnstable(ix, iy, ix + w, iy + h, hdx, hdy, c);
      }
    }

    return [ix, iy];
  }
  private static resolveCollisionsUnstable(x1, y1, r1, b1, vx1, vy1, c) : [ix : number, iy : number] {
    const [xttCollide, yttCollide] = Colliders.getCollisionTime(x1, y1, r1, b1, vx1, vy1, c);
    let vx = 0;
    let vy = 0;

    if(vx1 !== 0 && vy1 === 0) {
      vx = xttCollide * vx1;
    } else if(vx1 === 0 && vy1 !== 0) {
      vy = yttCollide * vy1;
    } else {
      console.assert(vx1 !== 0 && vy1 !== 0, "v shouldn't be 0, 0");

      const dt = Math.min(Math.abs(xttCollide), Math.abs(yttCollide));
      vx = dt * vx1;
      vy = dt * vy1;

      // (lucas 01.03.21) incomplete sliding code
      //
      // if(dt === xttCollide) {
      //   vx = 0;

      //   if(collides(x1, y1 + vy1, r1, b1, x2, y2, r2, b2)) {
      //     vy = vy1;
      //   }
      // }
      // if(dt === yttCollide) {
      //   vy = 0;

      //   if(collides(x1 + vx1, y1, r1, b1, x2, y2, r2, b2)) {
      //     vx = vx1;
      //   }
      // }
    }

    return [x1 + vx, y1 + vy]
  }
  private static getCollisionTime(x1 : number, y1 : number, r1 : number, b1 : number, vx1 : number, vy1 : number, c : StripedBox) : [xttCollide : number, yttCollide : number] {
    const [dx, dy] = Colliders.getCollidingDistance(x1, y1, r1, b1, c);
    const xttCollide = vx1 !== 0 ? Math.abs(dx / vx1) : Infinity;
    const yttCollide = vy1 !== 0 ? Math.abs(dy / vy1) : Infinity;

    return [xttCollide, yttCollide];
  }
  private static getCollidingDistance(x1 : number, y1 : number, r1 : number, b1 : number, c : StripedBox) : [dx : number, dy : number] {
    let dx = 0;
    let dy = 0;

    if (x1 < c.x) {
      dx = c.x - r1;
    } else if (x1 > c.x) {
      dx = x1 - c.r;
    }

    if (y1 < c.y) {
      dy = c.y - b1;
    } else if (y1 > c.y) {
      dy = y1 - c.b;
    }

    return [dx, dy];
  }
  private static collides(x1 : number, y1 : number, r1 : number, b1 : number, c : StripedBox) : boolean {
    return x1 < c.r && r1 > c.x && y1 < c.b && b1 > c.y;
  }

  static hideAllColliders() {
    for(const c of Colliders.storage.colliders) {
      c.$t.removeClass('visible');
    }
  }
}