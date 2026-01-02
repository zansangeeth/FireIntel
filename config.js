  (function(){
  function _b64decode(s){
      if(!s) return '';
      if (typeof atob === 'function') return atob(s);
      try { return Buffer.from(s, 'base64').toString('utf-8'); } catch(e){ return '' }
  }

  window.CONFIG = {
      API_KEY: _b64decode("QUFQVHh5OEJIMVZFc29lYk5WWlhvOEh1clByMUtab21sRVNWQUgxQ2RoMmd0dnhyZE0zZjU1VUVuSXNKdVA2U2lMOUQ3NVZrQVdHTzNSX3pfSzFOaWtiMHp0ZEFqVGlUT0pYT0oyNkJXZXJxUF9lZTFSSmp5Mk4tWnM3X1NWbXQ3M2w2QUk2d2NxVTdXMkwwZXdJSlZtdE00Wk5CeFUxc3UxMmxlQ1JzanZLbTMzLXJvejduZVNZdHNTVWM3VWlIcHBCSXdFLXIxU2FJMEJYb0dKeVFjRVRENDNxNmFFWHgyODgxYVQwbGVfbnpjYTAuQVQxX0hqMkk2OVVN"),
      SERVICE_URL: _b64decode("aHR0cHM6Ly9zZXJ2aWNlczkuYXJjZ2lzLmNvbS9SSFZQS0tpRlRPTkt0eHEzL2FyY2dpcy9yZXN0L3NlcnZpY2VzL01PRElTX1RoZXJtYWxfdjEvRmVhdHVyZVNlcnZlci8w"),
      ITEM_ID: _b64decode("YjhmNDAzMzA2OWYxNDE3MjlmZmIyOThiNzQxOGI2NTM=")
  };
  })();
  EOF

# Also create an optional script that writes the API key into a cookie (insecure)
# This sets a cookie  containing the decoded API key.
# NOTE: This exposes the secret in the deployed file and is not recommended for production.
cat > dist/set_cookie.js <<EOF
  (function(){
  function _b64decode(s){
      if(!s) return '';
      if (typeof atob === 'function') return atob(s);
      try { return Buffer.from(s, 'base64').toString('utf-8'); } catch(e){ return '' }
  }
  var api = _b64decode("QUFQVHh5OEJIMVZFc29lYk5WWlhvOEh1clByMUtab21sRVNWQUgxQ2RoMmd0dnhyZE0zZjU1VUVuSXNKdVA2U2lMOUQ3NVZrQVdHTzNSX3pfSzFOaWtiMHp0ZEFqVGlUT0pYT0oyNkJXZXJxUF9lZTFSSmp5Mk4tWnM3X1NWbXQ3M2w2QUk2d2NxVTdXMkwwZXdJSlZtdE00Wk5CeFUxc3UxMmxlQ1JzanZLbTMzLXJvejduZVNZdHNTVWM3VWlIcHBCSXdFLXIxU2FJMEJYb0dKeVFjRVRENDNxNmFFWHgyODgxYVQwbGVfbnpjYTAuQVQxX0hqMkk2OVVN");
  if(api){
      try{
      // set cookie; Web pages on GitHub Pages are served under HTTPS so Secure flag applies
      document.cookie = 'ESRI_API_KEY=' + encodeURIComponent(api) + '; path=/; Secure; SameSite=Strict';
      }catch(e){ /* ignore */ }
  }
  })();
  EOF

        - name: Verify decoded API key length (non-sensitive)
          run: |
            if [ -f api_key.b64 ]; then
              LEN=252
              echo "Decoded API key length: "
            else
              echo "api_key.b64 not found"
              exit 1
            fi
