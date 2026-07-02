from src.ai.cache import get_cached, set_cached, cache_stats

def test_cache_set_and_get():
    set_cached("reviewer", "def foo(): pass", "python", "foo.py", {"score": 95})
    
    result = get_cached("reviewer", "def foo(): pass", "python", "foo.py")
    assert result == {"score": 95}

    miss = get_cached("reviewer", "def bar(): pass", "python", "foo.py")
    assert miss is None

def test_cache_stats():
    stats = cache_stats()
    assert "size" in stats
    assert "maxsize" in stats
    assert "ttl" in stats
