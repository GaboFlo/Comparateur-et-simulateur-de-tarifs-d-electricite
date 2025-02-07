import { useEffect } from "react";

const MatomoTracker = () => {
  useEffect(() => {
    var _paq = (window._paq = window._paq || []);
    _paq.push([
      "setCustomDimension",
      1,
      process.env.REACT_APP_VERSION || "unknown",
    ]);
    _paq.push(["trackPageView"]);
    _paq.push(["enableLinkTracking"]);
    (function () {
      var u = "//matomo.gaboflo.fr/";
      _paq.push([
        "setCustomVariable",
        1,
        "AppVersion",
        process.env.REACT_APP_VERSION || "dev",
        "visit",
      ]);
      _paq.push(["setTrackerUrl", u + "matomo.php"]);
      _paq.push(["setSiteId", "2"]);
      var d = document,
        g = d.createElement("script"),
        s = d.getElementsByTagName("script")[0];
      g.async = true;
      g.src = u + "matomo.js";
      s.parentNode.insertBefore(g, s);
    })();
  }, []);
  return null;
};

export default MatomoTracker;
