import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const host = req.headers.get('host') || 'localhost:3000'
  const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`

  const jsContent = `
(function() {
  'use strict';
  try {
    // 1. Identify current script tag & experiment ID
    var currentScript = document.currentScript;
    if (!currentScript) {
      var scripts = document.querySelectorAll('script[data-experiment]');
      currentScript = scripts[scripts.length - 1];
    }
    if (!currentScript) {
      var allScripts = document.getElementsByTagName('script');
      for (var i = 0; i < allScripts.length; i++) {
        if (allScripts[i].getAttribute && allScripts[i].getAttribute('data-experiment')) {
          currentScript = allScripts[i];
          break;
        }
      }
    }

    var experimentId = currentScript ? currentScript.getAttribute('data-experiment') : null;
    if (!experimentId) {
      console.warn('[ClickWard SDK] Missing data-experiment attribute on script tag.');
      return;
    }

    var baseUrl = "${baseUrl}";

    // 2. Persistent Visitor ID
    var VISITOR_KEY = 'clickward_visitor_id';
    var visitorId = localStorage.getItem(VISITOR_KEY);
    if (!visitorId) {
      visitorId = 'cw_v_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem(VISITOR_KEY, visitorId);
    }

    function simpleHash(str) {
      var hash = 0;
      for (var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
      }
      return Math.abs(hash);
    }

    // 3. Fetch Experiment Config
    fetch(baseUrl + '/api/sdk/config?experimentId=' + encodeURIComponent(experimentId), {
      mode: 'cors',
      cache: 'no-store'
    })
    .then(function(res) { return res.json(); })
    .then(function(config) {
      if (!config || !config.active || !config.variants || config.variants.length === 0) {
        return;
      }

      // 4. Assign Variant deterministically
      var ASSIGNMENT_KEY = 'clickward_exp_' + experimentId;
      var assignedVariantId = localStorage.getItem(ASSIGNMENT_KEY);
      var selectedVariant = null;

      // If a winner was promoted (100% allocation on winner), force winner
      if (config.winningVariantId) {
        for (var w = 0; w < config.variants.length; w++) {
          if (config.variants[w].id === config.winningVariantId) {
            selectedVariant = config.variants[w];
            break;
          }
        }
      }

      if (!selectedVariant && assignedVariantId) {
        for (var j = 0; j < config.variants.length; j++) {
          if (config.variants[j].id === assignedVariantId) {
            selectedVariant = config.variants[j];
            break;
          }
        }
      }

      if (!selectedVariant) {
        var totalWeight = 0;
        for (var k = 0; k < config.variants.length; k++) {
          totalWeight += (config.variants[k].allocation !== undefined ? config.variants[k].allocation : 50);
        }
        
        var hashVal = simpleHash(visitorId + '_' + experimentId) % (totalWeight || 100);
        var currentSum = 0;
        
        for (var m = 0; m < config.variants.length; m++) {
          currentSum += (config.variants[m].allocation !== undefined ? config.variants[m].allocation : 50);
          if (hashVal < currentSum) {
            selectedVariant = config.variants[m];
            break;
          }
        }

        if (!selectedVariant) {
          selectedVariant = config.variants[0];
        }

        localStorage.setItem(ASSIGNMENT_KEY, selectedVariant.id);
      }

      // 5. Apply Variant changes safely to DOM
      function applyChanges() {
        try {
          var selector = config.targetSelector || '#clickward-demo-cta';
          var targetElement = document.querySelector(selector);

          if (!targetElement) {
            targetElement = document.querySelector('[data-clickward-cta]') || document.querySelector('button.cta-primary');
          }

          if (targetElement) {
            // Text modification
            if (selectedVariant.ctaText) {
              targetElement.textContent = selectedVariant.ctaText;
            }

            // Href modification (if specified)
            if (selectedVariant.targetHref && selectedVariant.targetHref.trim() !== '') {
              if (targetElement.tagName === 'A') {
                targetElement.setAttribute('href', selectedVariant.targetHref);
              } else {
                var childLink = targetElement.querySelector('a');
                if (childLink) childLink.setAttribute('href', selectedVariant.targetHref);
              }
            }

            // Visibility modification (if set to false)
            if (selectedVariant.targetVisible === false) {
              targetElement.style.display = 'none';
            } else if (targetElement.style.display === 'none') {
              targetElement.style.display = '';
            }

            // 6. Record Impression (de-duplicated per session)
            var IMPRESSION_SESSION_KEY = 'cw_imp_' + experimentId + '_' + selectedVariant.id;
            if (!sessionStorage.getItem(IMPRESSION_SESSION_KEY)) {
              sessionStorage.setItem(IMPRESSION_SESSION_KEY, '1');
              sendEvent('impression');
            }

            // 7. Track Conversion on Click (de-duplicated per session)
            targetElement.addEventListener('click', function() {
              var CONVERSION_SESSION_KEY = 'cw_conv_' + experimentId + '_' + selectedVariant.id;
              if (!sessionStorage.getItem(CONVERSION_SESSION_KEY)) {
                sessionStorage.setItem(CONVERSION_SESSION_KEY, '1');
                sendEvent('conversion');
              }
            });
          }
        } catch (domErr) {
          console.warn('[ClickWard SDK] DOM modification error:', domErr);
        }
      }

      function sendEvent(eventType) {
        try {
          var payload = JSON.stringify({
            experimentId: experimentId,
            variantId: selectedVariant.id,
            visitorId: visitorId,
            eventType: eventType
          });

          if (navigator.sendBeacon) {
            navigator.sendBeacon(baseUrl + '/api/sdk/event', payload);
          } else {
            fetch(baseUrl + '/api/sdk/event', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: payload,
              keepalive: true
            });
          }
        } catch (e) {
          // Silent fallback - customer page is unaffected
        }
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyChanges);
      } else {
        applyChanges();
      }
    })
    .catch(function() {
      // Graceful error fallback: ClickWard unavailable, page untouched
    });
  } catch (globalErr) {
    // Fail silently so customer site never crashes
  }
})();
`

  return new NextResponse(jsContent, {
    headers: {
      'Content-Type': 'application/javascript',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}
