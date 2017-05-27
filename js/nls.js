// Levenberg-Marquardt algorithm for non-linear least squares regression
// Requires math.js to be read first
var nls = function(points, model, derivatives, B0, C) {

  // Check parameters
  if (points.length < B0.length) throw 'Not enough points to fit the model';
  if (derivatives.length != B0.length) throw 'Missing derivatives';

  // Config
  var max_iterations = 500;
  var convergence_limit = 1e-6;
  var damping = 0.01;
  var damping_factor = 10;
  var damping_limit = 1e100;

  // Commonly used variables
  var n = points.length;
  var k = B0.length;
  var r = math.zeros(n);
  var J = math.zeros(n, k);

  var sum_of_squares = function(B) {
    var sum = 0;
    for (var i = 0; i < n; i++) {
      var x = points[i][0];
      var y = points[i][1];
      var ri = y - model(x, B, C);
      sum += ri * ri;
    }
    return sum;
  };

  var rSquared = function(B) {
    var mean_y = math.mean(points.map(function(p) { return p[1]; }));
    var d_sum = 0;
    var r_sum = 0;
    for (var i = 0; i < n; i++) {
      var x = points[i][0];
      var y = points[i][1];
      var ri = y - model(x, B, C);
      var dy = y - mean_y;
      r_sum += ri * ri;
      d_sum += dy * dy;
    }
    return 1 - r_sum / d_sum;
  };

  var get_residuals_and_jacobian = function() {
    for (var i = 0; i < n; i++) {
      var x = points[i][0];
      var y = points[i][1];
      var ri = y - model(x, B0, C);
      r.set([i], ri);
      for (var j = 0; j < k; j++) {
        J.set([i,j], derivatives[j](x, B0, C));
      }
    }
  };

  var shift_vector = function() {
    var Jt = math.transpose(J);
    var JtJ = math.multiply(Jt, J);
    var tmp1 = math.diag(math.diag(JtJ));
    var tmp2 = math.multiply(damping, tmp1);
    var tmp3 = math.add(JtJ, tmp2);
    var tmp4 = math.inv(tmp3); // Will error if determinant is zero
    var tmp5 = math.multiply(tmp4, Jt);
    return math.multiply(tmp5, r);
  };

  // Start the Levenberg-Marquardt algorithm
  var S0 = sum_of_squares(B0);
  for (var iteration = 0; iteration < max_iterations; iteration++) {

    get_residuals_and_jacobian();

    while (true) {
      var dB = shift_vector();
      var B1 = math.add(B0, dB).toArray();
      var S1 = sum_of_squares(B1);
      if (S1 < S0) break;
      damping *= damping_factor;
      if (damping > damping_limit) throw 'Damping not improving shift vector';
    }

    // Test for convergence
    if ((S0 - S1) / S0 < convergence_limit) {
      return {
        B: B1,
        C: C,
        R2: rSquared(B1)
      }
    }

    B0 = B1;
    S0 = S1;
    damping /= damping_factor;
  }

  throw "Maximum number of iterations reached";

};
