import math
import time

class OneEuroFilter:
    def __init__(self, t0, x0, dx0=0.0, min_cutoff=1.0, beta=0.0, d_cutoff=1.0):
        """
        Initialize the One Euro Filter.
        :param t0: Initial timestamp
        :param x0: Initial value (float or tuple/list of floats)
        :param dx0: Initial derivative
        :param min_cutoff: Minimum cutoff frequency
        :param beta: Speed coefficient
        :param d_cutoff: Derivative cutoff frequency
        """
        self.t_prev = t0
        self.x_prev = x0
        self.dx_prev = dx0
        self.min_cutoff = min_cutoff
        self.beta = beta
        self.d_cutoff = d_cutoff

    def smoothing_factor(self, t_e, cutoff):
        r = 2 * math.pi * cutoff * t_e
        return r / (r + 1)

    def exponential_smoothing(self, a, x, x_prev):
        return a * x + (1 - a) * x_prev

    def filter(self, t, x):
        """
        Filter a noisy value.
        :param t: Current timestamp
        :param x: Current noisy value
        :return: Smoothed value
        """
        t_e = t - self.t_prev

        # Avoid division by zero or negative time
        if t_e <= 0.0:
            return self.x_prev

        # Handle both scalar and vector inputs
        is_vector = isinstance(x, (list, tuple))
        if is_vector:
            # Vector implementation
            if not isinstance(self.dx_prev, (list, tuple)):
                 self.dx_prev = [0.0] * len(x)
            
            x_filtered = []
            dx_new = []
            
            for i, val in enumerate(x):
                # Estimate derivative
                a_d = self.smoothing_factor(t_e, self.d_cutoff)
                dx = (val - self.x_prev[i]) / t_e
                dx_hat = self.exponential_smoothing(a_d, dx, self.dx_prev[i])
                dx_new.append(dx_hat)
                
                # Calculate cutoff based on speed
                cutoff = self.min_cutoff + self.beta * abs(dx_hat)
                a = self.smoothing_factor(t_e, cutoff)
                x_hat = self.exponential_smoothing(a, val, self.x_prev[i])
                x_filtered.append(x_hat)
            
            self.x_prev = x_filtered
            self.dx_prev = dx_new
            self.t_prev = t
            return tuple(x_filtered)
        else:
            # Scalar implementation
            a_d = self.smoothing_factor(t_e, self.d_cutoff)
            dx = (x - self.x_prev) / t_e
            dx_hat = self.exponential_smoothing(a_d, dx, self.dx_prev)

            cutoff = self.min_cutoff + self.beta * abs(dx_hat)
            a = self.smoothing_factor(t_e, cutoff)
            x_hat = self.exponential_smoothing(a, x, self.x_prev)

            self.x_prev = x_hat
            self.dx_prev = dx_hat
            self.t_prev = t
            return x_hat
