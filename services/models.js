(function() {
  var app = angular.module('app');

  app.factory('models', function() {

    // Sigmoid-5 function from Michele's paper (inverting a)
    // C[0] = n = minimum asymptote
    // C[1] = m = maximum asymptote
    // B[0] = t = inflection point
    // B[1] = a = hill slope
    // B[2] = c = asymmetry factor

    // f = (m - n) / (e^(a(t - x)) + 1)^c + n
    var sig = function(x, B, C) {
      return (C[1] - C[0]) / sig3(x, B) + C[0];
    };

    // df/dt = ac(n - m)e^(a(t - x))(e^(a(t - x)) + 1)^(-c-1)
    var dsig_dt = function(x, B, C) {
      return B[1] * B[2] * (C[0] - C[1]) * sig1(x, B) * sig4(x, B);
    };

    // df/da = -c(m - n)(t - x)e^(a(t - x))(e^(a(t - x)) + 1)^(-c-1)
    var dsig_da = function(x, B, C) {
      return -B[2] * (C[1] - C[0]) * (B[0] - x) * sig1(x, B) * sig4(x, B);
    };

    // df/dc = (n - m)ln(e^(a(t - x)) + 1) / (e^(a(t - x)) + 1)^c
    var dsig_dc = function(x, B, C) {
      return (C[0] - C[1]) * Math.log(sig2(x, B)) / sig3(x, B);
    };

    // sig_mid = t - ln(2^1/c - 1) / a
    var sig_mid = function(B) {
      return B[0] - Math.log(Math.pow(2, 1/B[2]) - 1) / B[1];
    };

    // sig_inf = t - ln(1/c) / a
    var sig_inf = function(B) {
      return B[0] - Math.log(1/B[2]) / B[1];
    };

    var sig_C = function(points) {
      var n = d3.min(points, function(p) { return p[1]; });
      var m = d3.max(points, function(p) { return p[1]; });
      return [n, m];
    };

    var sig_B0 = function(points) {
      var minT = d3.min(points, function(p) { return p[0]; });
      var maxT = d3.max(points, function(p) { return p[0]; });
      var t = (minT + maxT) / 2;
      var a = 1;
      var c = 1;
      return [t, a, c];
    };

    // sig1 = e^(a(t - x))
    var sig1 = function(x, B) {
      return Math.exp(B[1] * (B[0] - x));
    };
    // sig2 = e^(a(t - x)) + 1
    var sig2 = function(x, B) {
      return sig1(x, B) + 1;
    };
    // sig3 = (e^(a(t - x)) + 1)^c
    var sig3 = function(x, B) {
      return Math.pow(sig2(x, B), B[2])
    };
    // sig4 = (e^(a(t - x)) + 1)^(-c-1)
    var sig4 = function(x, B) {
      return Math.pow(sig2(x, B), -B[2]-1);
    };

    // Boltzmann function (Sigmoid-4)
    // C[0] = n = minimum asymptote
    // C[1] = m = maximum asymptote
    // B[0] = t = inflection point
    // B[1] = a = hill slope

    // f = (m - n) / (e^(a(t - x)) + 1) + n
    var boltz = function(x, B, C) {
      return (C[1] - C[0]) / boltz2(x, B) + C[0];
    }

    // df/dt = a(n - m)e^(a(t - x)) / (e^(a(t - x)) + 1)^2
    var dboltz_dt = function(x, B, C) {
      return B[1] * (C[0] - C[1]) * boltz1(x, B) / boltz3(x, B);
    }

    // df/da = -(m - n)(t - x)e^(a(t - x)) / (e^(a(t - x)) + 1)^2
    var dboltz_da = function(x, B, C) {
      return -(C[1] - C[0]) * (B[0] - x) * boltz1(x, B) / boltz3(x, B);
    }

    var boltz_t = function(B) {
      return B[0];
    }

    var boltz_C = function(points) {
      var n = d3.min(points, function(p) { return p[1]; });
      var m = d3.max(points, function(p) { return p[1]; });
      return [n, m];
    };

    var boltz_B0 = function(points) {
      var minT = d3.min(points, function(p) { return p[0]; });
      var maxT = d3.max(points, function(p) { return p[0]; });
      var t = (minT + maxT) / 2;
      var a = 1;
      return [t, a];
    };

    // boltz1 = e^(a(t - x))
    var boltz1 = function(x, B) {
      return Math.exp(B[1] * (B[0] - x));
    };
    // boltz2 = e^(a(t - x)) + 1
    var boltz2 = function(x, B) {
      return boltz1(x, B) + 1;
    };
    // boltz3 = (e^(a(t - x)) + 1)^2
    var boltz3 = function(x, B) {
      return Math.pow(boltz2(x, B), 2);
    };

    return {
      'Sigmoid-5': {
        func: sig,
        derivatives: [dsig_dt, dsig_da, dsig_dc],
        C: sig_C,
        B0: sig_B0,
        tms: {
          'Midpoint': sig_mid,
          'Inflection': sig_inf
        }
      },
      'Boltzmann': {
        func: boltz,
        derivatives: [dboltz_dt, dboltz_da],
        C: boltz_C,
        B0: boltz_B0,
        tms: {
          'Midpoint': boltz_t
        }
      }
    };
  });
})();
