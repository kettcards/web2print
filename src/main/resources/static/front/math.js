const M = {
  scaleXY: function(v) {
    return [v, 0, 0, 0,
            0, v, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1];
  },
  rotateY: function(v) {
    return [ Math.cos(v), 0, Math.sin(v), 0,
                       0, 1,           0, 0,
            -Math.sin(v), 0, Math.cos(v), 0,
                       0, 0,           0, 1];
  },
  translate: function(x, y, z) {
    x = x || 1;
    y = y || 1;
    z = z || 1;
    return [1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1]
  },
  mulMM: function(m1, m2) {
    const r1 = this.mulMV(m1, m2.slice( 0,  4));
    const r2 = this.mulMV(m1, m2.slice( 4,  8));
    const r3 = this.mulMV(m1, m2.slice( 8, 12));
    const r4 = this.mulMV(m1, m2.slice(12, 16));
    return r1.concat(r2, r3, r4);
  },
  mulMV: function(m, v) {
    return [
      v[0] * m[ 0] + v[1] * m[ 1] + v[2] * m[ 2] + v[3] * m[ 3],
      v[0] * m[ 4] + v[1] * m[ 5] + v[2] * m[ 6] + v[3] * m[ 7],
      v[0] * m[ 8] + v[1] * m[ 9] + v[2] * m[10] + v[3] * m[11],
      v[0] * m[12] + v[1] * m[13] + v[2] * m[14] + v[3] * m[15]
    ];
  }
}