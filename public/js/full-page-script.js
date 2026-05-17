(function() {
    var api_token = window.linksite_api_token;
    var ad_type = window.linksite_advert_type || 1;
    var domains = window.linksite_domains || [];
    var base_url = window.location.origin;

    if (!api_token) return;

    function shortenAll() {
        var links = document.getElementsByTagName('a');
        for (var i = 0; i < links.length; i++) {
            var a = links[i];
            var href = a.href;
            if (!href || href.indexOf('http') !== 0) continue;
            
            // Check if current domain
            var url = new URL(href);
            if (url.hostname === window.location.hostname) continue;

            // Check if domain is in allowed list (if list exists)
            if (domains.length > 0) {
                var found = false;
                for (var j = 0; j < domains.length; j++) {
                    if (url.hostname.indexOf(domains[j]) !== -1) {
                        found = true;
                        break;
                    }
                }
                if (!found) continue;
            }

            // Replace with short link endpoint (we use the Quick Link API but on the client side we can just link to /st if we want, 
            // but standard scripts usually pre-shorten or redirect through a specific path)
            // For simplicity in this script, we'll just prefix it if the user has a custom domain, 
            // but usually this script should call an API. 
            // REAL ADLINKFLY SCRIPT: Just replaces the href with the shortner URL + encoded long URL.
            // We'll do exactly that.
            
            // Wait, we need a "Redirect with API" path that doesn't require pre-shortening in DB to be ultra fast.
            // Let's create /r?api=...&url=...
            a.href = base_url + '/r?api=' + api_token + '&url=' + encodeURIComponent(href);
        }
    }

    if (document.readyState === 'complete') {
        shortenAll();
    } else {
        window.addEventListener('load', shortenAll);
    }
})();
