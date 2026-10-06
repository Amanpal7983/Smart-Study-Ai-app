from collections import defaultdict, deque
from threading import Lock
import time

class SlidingWindowLimiter:
    def __init__(self, maximum: int, window_seconds: int):
        self.maximum = maximum
        self.window = window_seconds
        self.hits = defaultdict(deque)
        self.lock = Lock()

    def allow(self, key: str) -> bool:
        now = time.time()
        with self.lock:
            q = self.hits[key]
            while q and now - q[0] >= self.window:
                q.popleft()
            if len(q) >= self.maximum:
                return False
            q.append(now)
            return True
